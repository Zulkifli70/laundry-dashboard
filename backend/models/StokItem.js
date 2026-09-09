const { DataTypes } = require('sequelize');
const databaseModule = require('../config/database');
const sequelize = databaseModule.default || databaseModule;
const Outlet = require('./Outlet');

const StokItem = sequelize.define('StokItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  outlet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Outlet,
      key: 'id',
    },
  },
  nama_barang: {
    type: DataTypes.STRING,
  },
  satuan: {
    type: DataTypes.STRING,
  },
  jumlah_stok: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  batas_minimum: {
    type: DataTypes.DECIMAL(10, 2),
  },
}, {
  tableName: 'stok_items',
  timestamps: false,
});

StokItem.belongsTo(Outlet, { foreignKey: 'outlet_id' });
Outlet.hasMany(StokItem, { foreignKey: 'outlet_id' });

module.exports = StokItem;
