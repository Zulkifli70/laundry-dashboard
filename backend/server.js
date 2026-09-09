require('dotenv').config();
const express = require('express');
const cors = require('cors');
const databaseModule = require('./config/database');
const sequelize = databaseModule.default || databaseModule;

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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    console.log('Models synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
  }
};

startServer();
