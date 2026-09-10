const { DataTypes } = require("sequelize");
const db = require("../config/database");
const sequelize = (db.default || db).sequelize;

const Outlet = sequelize.define(
  "Outlet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alamat: {
      type: DataTypes.STRING,
    },
    no_telepon: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "outlets",
    timestamps: false,
  },
);

module.exports = Outlet;
