const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Outlet = require('./Outlet');
const User = require('./User');

const Pengeluaran = sequelize.define('Pengeluaran', {
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  kategori: {
    type: DataTypes.STRING,
  },
  jumlah: {
    type: DataTypes.DECIMAL(10, 2),
  },
  deskripsi: {
    type: DataTypes.STRING,
  },
  tanggal: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'pengeluaran',
  timestamps: false,
});

Pengeluaran.belongsTo(Outlet, { foreignKey: 'outlet_id' });
Pengeluaran.belongsTo(User, { foreignKey: 'user_id' });

Outlet.hasMany(Pengeluaran, { foreignKey: 'outlet_id' });
User.hasMany(Pengeluaran, { foreignKey: 'user_id' });

module.exports = Pengeluaran;
