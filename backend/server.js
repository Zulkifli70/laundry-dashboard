require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const sequelize = db.default || db;

const authRoutes = require('./routes/auth');
const outletRoutes = require('./routes/outlets');
const userRoutes = require('./routes/users');
const layananRoutes = require('./routes/layanan');
const transaksiRoutes = require('./routes/transaksi');
const pengeluaranRoutes = require('./routes/pengeluaran');
const stokRoutes = require('./routes/stok');
const pelangganRoutes = require('./routes/pelanggan');

const app = express();

app.use(cors());
app.use(express.json());

let dbConnected = false;

app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      dbConnected = true;
      console.log('Database connected & synced');
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/users', userRoutes);
app.use('/api/layanan', layananRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/pengeluaran', pengeluaranRoutes);
app.use('/api/stok', stokRoutes);
app.use('/api/pelanggan', pelangganRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Laundry Dashboard' });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
