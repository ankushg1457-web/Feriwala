const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/postgres');

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  shopId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  reservedQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  lowStockThreshold: { type: DataTypes.INTEGER, defaultValue: 5 },
}, {
  tableName: 'inventory',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['productId', 'shopId'] },
    { fields: ['shopId'] },
  ],
});

module.exports = Inventory;
