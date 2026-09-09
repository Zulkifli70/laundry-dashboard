const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Outlet = require("./Outlet");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    outlet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Outlet,
        key: "id",
      },
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "karyawan"),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

User.belongsTo(Outlet, { foreignKey: "outlet_id" });
Outlet.hasMany(User, { foreignKey: "outlet_id" });

module.exports = User;
