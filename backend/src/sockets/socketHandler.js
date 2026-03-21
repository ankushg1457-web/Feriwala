module.exports = function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join rooms based on user type
    socket.on('join_shop', (shopId) => {
      socket.join(`shop_${shopId}`);
      console.log(`Socket ${socket.id} joined shop_${shopId}`);
    });

    socket.on('join_customer', (customerId) => {
      socket.join(`customer_${customerId}`);
      console.log(`Socket ${socket.id} joined customer_${customerId}`);
    });

    socket.on('join_agent', (agentId) => {
      socket.join(`agent_${agentId}`);
      console.log(`Socket ${socket.id} joined agent_${agentId}`);
    });

    // Delivery agent location updates
    socket.on('agent_location', (data) => {
      const { agentId, latitude, longitude, taskId, shopId } = data;
      // Broadcast to shop and customer tracking the delivery
      if (shopId) {
        io.to(`shop_${shopId}`).emit('agent_location_update', {
          agentId, latitude, longitude, taskId,
        });
      }
      if (data.customerId) {
        io.to(`customer_${data.customerId}`).emit('agent_location_update', {
          agentId, latitude, longitude, taskId,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
