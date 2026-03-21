const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/postgres');

const DeliveryTask = sequelize.define('DeliveryTask', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  shopId: { type: DataTypes.INTEGER, allowNull: false },
  agentId: { type: DataTypes.STRING(30) }, // MongoDB User _id
  taskType: { type: DataTypes.ENUM('delivery', 'pickup', 'return_pickup'), allowNull: false },
  status: {
    type: DataTypes.ENUM(
      'pending', 'assigned', 'accepted', 'picking', 'picked_up',
      'in_transit', 'arrived', 'completed', 'cancelled', 'failed'
    ),
    defaultValue: 'pending',
  },
  pickupLocation: { type: DataTypes.JSONB, allowNull: false },
  dropLocation: { type: DataTypes.JSONB, allowNull: false },
  pickupOtp: { type: DataTypes.STRING(6) },
  deliveryOtp: { type: DataTypes.STRING(6) },
  assignedAt: { type: DataTypes.DATE },
  acceptedAt: { type: DataTypes.DATE },
  pickedUpAt: { type: DataTypes.DATE },
  completedAt: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
  distanceKm: { type: DataTypes.DECIMAL(6, 2) },
  estimatedMinutes: { type: DataTypes.INTEGER },
}, {
  tableName: 'delivery_tasks',
  timestamps: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['shopId'] },
    { fields: ['agentId'] },
    { fields: ['status'] },
    { fields: ['taskType'] },
  ],
});

module.exports = DeliveryTask;
