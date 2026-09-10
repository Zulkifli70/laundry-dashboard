const { DataTypes } = require("sequelize");
const db = require("../config/database");
const sequelize = (db.default || db).sequelize;
const Outlet = require("./Outlet");

const Pelanggan = sequelize.define(
  "Pelanggan",
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
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_hp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alamat: {
      type: DataTypes.TEXT,
    },
    catatan: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "pelanggan",
    timestamps: false,
  },
);

Pelanggan.belongsTo(Outlet, { foreignKey: "outlet_id" });
Outlet.hasMany(Pelanggan, { foreignKey: "outlet_id" });

module.exports = Pelanggan;
