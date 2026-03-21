const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const DeliveryTask = require('../models/pg/DeliveryTask');
const ReturnRequest = require('../models/pg/ReturnRequest');
const Order = require('../models/pg/Order');
const Shop = require('../models/pg/Shop');
const DeliveryAgentProfile = require('../models/mongo/DeliveryAgentProfile');
const User = require('../models/mongo/User');
const { generateOtp, calculateDistance } = require('../utils/helpers');
const { Op } = require('sequelize');

// Create delivery task (shop assigns)
router.post('/tasks', authenticate, authorize('shop_admin', 'admin'), [
  body('orderId').isInt(),
  body('taskType').isIn(['delivery', 'pickup', 'return_pickup']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { orderId, taskType } = req.body;
    const order = await Order.findByPk(orderId, {
      include: [{ model: Shop, as: 'shop' }],
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Find nearest available delivery agent
    const shopLat = parseFloat(order.shop.latitude);
    const shopLng = parseFloat(order.shop.longitude);

    const availableAgents = await DeliveryAgentProfile.find({
      isOnline: true,
      isAvailable: true,
      assignedShopId: { $in: [order.shopId, null] },
    }).populate({ path: 'userId', model: 'User' });

    // Sort by distance
    const agentsWithDistance = availableAgents.map(agent => ({
      agent,
      distance: agent.currentLocation?.latitude
        ? calculateDistance(shopLat, shopLng, agent.currentLocation.latitude, agent.currentLocation.longitude)
        : Infinity,
    })).sort((a, b) => a.distance - b.distance);

    const selectedAgent = agentsWithDistance.length > 0 ? agentsWithDistance[0] : null;

    const pickupLocation = {
      address: `${order.shop.addressLine1}, ${order.shop.city}`,
      latitude: shopLat,
      longitude: shopLng,
    };

    const dropLocation = taskType === 'return_pickup'
      ? pickupLocation
      : order.deliveryAddress;

    const task = await DeliveryTask.create({
      orderId,
      shopId: order.shopId,
      agentId: selectedAgent?.agent.userId._id.toString() || null,
      taskType,
      status: selectedAgent ? 'assigned' : 'pending',
      pickupLocation,
      dropLocation: taskType === 'return_pickup' ? order.deliveryAddress : dropLocation,
      pickupOtp: generateOtp(),
      deliveryOtp: generateOtp(),
      assignedAt: selectedAgent ? new Date() : null,
      distanceKm: selectedAgent?.distance,
      estimatedMinutes: selectedAgent ? Math.ceil((selectedAgent.distance / 20) * 60) : null,
    });

    if (selectedAgent) {
      await DeliveryAgentProfile.findByIdAndUpdate(selectedAgent.agent._id, { isAvailable: false });

      const io = req.app.get('io');
      io.to(`agent_${selectedAgent.agent.userId._id}`).emit('new_task', {
        taskId: task.id,
        taskType: task.taskType,
        orderId: task.orderId,
      });
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get delivery agent's tasks
router.get('/my-tasks', authenticate, authorize('delivery_agent'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { agentId: req.user._id.toString() };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await DeliveryTask.findAndCountAll({
      where,
      include: [
        { model: Order, as: 'order' },
        { model: Shop, as: 'shop', attributes: ['id', 'name', 'phone'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: tasks.rows,
      pagination: {
        total: tasks.count,
        page: parseInt(page),
        pages: Math.ceil(tasks.count / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept task
router.put('/tasks/:id/accept', authenticate, authorize('delivery_agent'), async (req, res) => {
  try {
    const task = await DeliveryTask.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.agentId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not assigned to you' });
    }

    await task.update({ status: 'accepted', acceptedAt: new Date() });

    const io = req.app.get('io');
    io.to(`shop_${task.shopId}`).emit('task_accepted', { taskId: task.id });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update task status (delivery agent)
router.put('/tasks/:id/status', authenticate, authorize('delivery_agent'), async (req, res) => {
  try {
    const task = await DeliveryTask.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.agentId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not assigned to you' });
    }

    const { status, otp } = req.body;

    // Verify OTP for pickup and delivery
    if (status === 'picked_up' && otp !== task.pickupOtp) {
      return res.status(400).json({ success: false, message: 'Invalid pickup OTP' });
    }
    if (status === 'completed' && task.taskType === 'delivery' && otp !== task.deliveryOtp) {
      return res.status(400).json({ success: false, message: 'Invalid delivery OTP' });
    }

    const updates = { status };
    if (status === 'picked_up') updates.pickedUpAt = new Date();
    if (status === 'completed') {
      updates.completedAt = new Date();

      // Mark agent available again
      await DeliveryAgentProfile.findOneAndUpdate(
        { userId: req.user._id },
        { isAvailable: true }
      );

      // Update order status
      if (task.taskType === 'delivery') {
        await Order.update({ status: 'delivered', deliveredAt: new Date() }, { where: { id: task.orderId } });
      }

      // Update agent stats
      const profileUpdate = task.taskType === 'delivery'
        ? { $inc: { completedDeliveries: 1 } }
        : { $inc: { completedReturns: 1 } };
      await DeliveryAgentProfile.findOneAndUpdate({ userId: req.user._id }, profileUpdate);
    }

    await task.update(updates);

    const io = req.app.get('io');
    io.to(`shop_${task.shopId}`).emit('task_status', { taskId: task.id, status });
    const order = await Order.findByPk(task.orderId);
    if (order) {
      io.to(`customer_${order.customerId}`).emit('delivery_status', {
        taskId: task.id,
        status,
        orderId: task.orderId,
      });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update delivery agent location
router.put('/location', authenticate, authorize('delivery_agent'), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await DeliveryAgentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { currentLocation: { latitude, longitude, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle online status
router.put('/online-status', authenticate, authorize('delivery_agent'), async (req, res) => {
  try {
    const { isOnline } = req.body;
    const profile = await DeliveryAgentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { isOnline, isAvailable: isOnline },
      { new: true }
    );
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create return request (customer)
router.post('/returns', authenticate, authorize('customer'), [
  body('orderId').isInt(),
  body('orderItemId').isInt(),
  body('reason').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { orderId, orderItemId, reason } = req.body;
    const order = await Order.findByPk(orderId);

    if (!order || order.customerId !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Can only return delivered orders' });
    }

    const returnReq = await ReturnRequest.create({
      orderId,
      orderItemId,
      shopId: order.shopId,
      customerId: req.user._id.toString(),
      reason,
    });

    const io = req.app.get('io');
    io.to(`shop_${order.shopId}`).emit('return_request', {
      returnId: returnReq.id,
      orderId,
    });

    res.status(201).json({ success: true, data: returnReq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process return verification (delivery agent)
router.put('/returns/:id/verify', authenticate, authorize('delivery_agent'), async (req, res) => {
  try {
    const returnReq = await ReturnRequest.findByPk(req.params.id);
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });

    const { verificationChecklist, verificationNotes, verificationImages } = req.body;

    await returnReq.update({
      verificationChecklist,
      verificationNotes,
      verificationImages: verificationImages || [],
      status: 'picked_up',
    });

    const io = req.app.get('io');
    io.to(`shop_${returnReq.shopId}`).emit('return_verified', {
      returnId: returnReq.id,
      checklist: verificationChecklist,
    });

    res.json({ success: true, data: returnReq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Shop tasks (for shop app)
router.get('/shop-tasks/:shopId', authenticate, authorize('shop_admin', 'admin'), async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);
    const { status, taskType, page = 1, limit = 20 } = req.query;
    const where = { shopId };
    if (status) where.status = status;
    if (taskType) where.taskType = taskType;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await DeliveryTask.findAndCountAll({
      where,
      include: [{ model: Order, as: 'order' }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: tasks.rows,
      pagination: {
        total: tasks.count,
        page: parseInt(page),
        pages: Math.ceil(tasks.count / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
