const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/postgres');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING(500) },
  parentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'categories', key: 'id' } },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Category;
