const { DataTypes } = require("sequelize");
const db = require("../config/database");
const sequelize = (db.default || db).sequelize;

const Layanan = sequelize.define(
  "Layanan",
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
    tipe_satuan: {
      type: DataTypes.ENUM("kg", "item"),
      allowNull: false,
    },
    harga: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "layanan",
    timestamps: false,
  },
);

module.exports = Layanan;
