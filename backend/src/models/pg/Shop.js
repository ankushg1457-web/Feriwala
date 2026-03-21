const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/postgres');

const Shop = sequelize.define('Shop', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  phone: { type: DataTypes.STRING(15) },
  email: { type: DataTypes.STRING(100) },
  addressLine1: { type: DataTypes.STRING(300), allowNull: false },
  addressLine2: { type: DataTypes.STRING(300) },
  city: { type: DataTypes.STRING(100), allowNull: false },
  state: { type: DataTypes.STRING(100), allowNull: false },
  pincode: { type: DataTypes.STRING(10), allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
  coverImage: { type: DataTypes.STRING(500) },
  logo: { type: DataTypes.STRING(500) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  openingTime: { type: DataTypes.TIME, defaultValue: '09:00:00' },
  closingTime: { type: DataTypes.TIME, defaultValue: '21:00:00' },
  deliveryRadiusKm: { type: DataTypes.DECIMAL(5, 2), defaultValue: 5.0 },
  minOrderAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  deliveryFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 5.00 },
  totalRatings: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'shops',
  timestamps: true,
  indexes: [
    { fields: ['latitude', 'longitude'] },
    { fields: ['city'] },
    { fields: ['isActive'] },
  ],
});

module.exports = Shop;
