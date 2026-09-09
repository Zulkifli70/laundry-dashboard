const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "laundry_dashboard",
  process.env.DB_USER || "postgres",
  process.env.DB_PASS || "postgres",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
  }
);

module.exports = sequelize;
