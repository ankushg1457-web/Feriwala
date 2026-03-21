const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/postgres');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  shopId: { type: DataTypes.INTEGER, allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(300), allowNull: false },
  slug: { type: DataTypes.STRING(350), allowNull: false },
  description: { type: DataTypes.TEXT },
  brand: { type: DataTypes.STRING(100) },
  sku: { type: DataTypes.STRING(50) },
  mrp: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  sellingPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  size: { type: DataTypes.STRING(20) },
  color: { type: DataTypes.STRING(50) },
  material: { type: DataTypes.STRING(100) },
  gender: { type: DataTypes.ENUM('men', 'women', 'unisex', 'kids', 'boys', 'girls'), defaultValue: 'unisex' },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  tags: { type: DataTypes.JSONB, defaultValue: [] },
  attributes: { type: DataTypes.JSONB, defaultValue: {} },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  avgRating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  totalReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['shopId'] },
    { fields: ['categoryId'] },
    { fields: ['slug'] },
    { fields: ['brand'] },
    { fields: ['gender'] },
    { fields: ['isActive', 'shopId'] },
  ],
});

module.exports = Product;
