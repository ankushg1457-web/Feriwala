const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/postgres');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  customerId: { type: DataTypes.STRING(30), allowNull: false }, // MongoDB User _id
  shopId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM(
      'pending', 'confirmed', 'preparing', 'ready_for_pickup',
      'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
    ),
    defaultValue: 'pending',
  },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  deliveryFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  promoCodeId: { type: DataTypes.INTEGER, allowNull: true },
  deliveryAddress: { type: DataTypes.JSONB, allowNull: false },
  paymentMethod: { type: DataTypes.ENUM('cod', 'online', 'upi', 'card'), defaultValue: 'cod' },
  paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT },
  estimatedDeliveryMinutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  deliveredAt: { type: DataTypes.DATE },
  cancelledAt: { type: DataTypes.DATE },
  cancelReason: { type: DataTypes.TEXT },
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['shopId'] },
    { fields: ['status'] },
    { fields: ['orderNumber'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = Order;
