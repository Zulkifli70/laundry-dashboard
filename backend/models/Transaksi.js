const { DataTypes } = require("sequelize");
const db = require("../config/database");
const sequelize = db.default || db;
const Outlet = require("./Outlet");
const User = require("./User");
const Layanan = require("./Layanan");
const Pelanggan = require("./Pelanggan");

const Transaksi = sequelize.define(
  "Transaksi",
  {
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
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    layanan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Layanan,
        key: "id",
      },
    },
    pelanggan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Pelanggan,
        key: "id",
      },
    },
    nama_pelanggan: {
      type: DataTypes.STRING,
    },
    no_hp_pelanggan: {
      type: DataTypes.STRING,
    },
    jumlah_qty: {
      type: DataTypes.DECIMAL(10, 2),
    },
    total_harga: {
      type: DataTypes.DECIMAL(10, 2),
    },
    status: {
      type: DataTypes.ENUM("diterima", "diproses", "selesai", "diambil"),
      defaultValue: "diterima",
    },
    status_bayar: {
      type: DataTypes.ENUM("belum_bayar", "lunas"),
      defaultValue: "belum_bayar",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "transaksi",
    timestamps: false,
  },
);

Transaksi.belongsTo(Outlet, { foreignKey: "outlet_id" });
Transaksi.belongsTo(User, { foreignKey: "user_id" });
Transaksi.belongsTo(Layanan, { foreignKey: "layanan_id" });
Transaksi.belongsTo(Pelanggan, { foreignKey: "pelanggan_id", as: "Pelanggan" });

Outlet.hasMany(Transaksi, { foreignKey: "outlet_id" });
User.hasMany(Transaksi, { foreignKey: "user_id" });
Layanan.hasMany(Transaksi, { foreignKey: "layanan_id" });
Pelanggan.hasMany(Transaksi, { foreignKey: "pelanggan_id" });

module.exports = Transaksi;
