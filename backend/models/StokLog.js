const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const StokItem = require('./StokItem');
const User = require('./User');

const StokLog = sequelize.define('StokLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stok_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: StokItem,
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
  tipe_perubahan: {
    type: DataTypes.ENUM('masuk', 'keluar'),
    allowNull: false,
  },
  jumlah_perubahan: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  catatan: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'stok_logs',
  timestamps: false,
});

StokLog.belongsTo(StokItem, { foreignKey: 'stok_item_id' });
StokLog.belongsTo(User, { foreignKey: 'user_id' });

StokItem.hasMany(StokLog, { foreignKey: 'stok_item_id' });
User.hasMany(StokLog, { foreignKey: 'user_id' });

module.exports = StokLog;
