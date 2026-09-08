require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const { Outlet, User, Layanan } = require('./models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ force: true });
    console.log('Database synced (tables dropped & recreated)');

    // Seed Outlets
    const outlets = await Outlet.bulkCreate([
      { nama: 'Laundry Outlet Pusat', alamat: 'Jl. Merdeka No. 1', no_telepon: '081234567890' },
      { nama: 'Laundry Outlet Timur', alamat: 'Jl. Sudirman No. 10', no_telepon: '081234567891' },
    ]);
    console.log(`Created ${outlets.length} outlets`);

    // Seed Users
    const passwordHash = await bcrypt.hash('admin123', 10);
    const karyawanHash = await bcrypt.hash('karyawan123', 10);

    const users = await User.bulkCreate([
      { nama: 'Admin Utama', email: 'admin@laundry.com', password_hash: passwordHash, role: 'admin', outlet_id: null },
      { nama: 'Budi Karyawan', email: 'budi@laundry.com', password_hash: karyawanHash, role: 'karyawan', outlet_id: outlets[0].id },
      { nama: 'Sari Karyawan', email: 'sari@laundry.com', password_hash: karyawanHash, role: 'karyawan', outlet_id: outlets[1].id },
    ]);
    console.log(`Created ${users.length} users`);

    // Seed Layanan
    const layanan = await Layanan.bulkCreate([
      { nama: 'Cuci Reguler', tipe_satuan: 'kg', harga: 5000 },
      { nama: 'Cuci + Setrika', tipe_satuan: 'kg', harga: 7000 },
      { nama: 'Setrika Saja', tipe_satuan: 'kg', harga: 3000 },
      { nama: 'Cuci Karpet', tipe_satuan: 'item', harga: 15000 },
      { nama: 'Cuci Gorden', tipe_satuan: 'item', harga: 20000 },
    ]);
    console.log(`Created ${layanan.length} layanan`);

    console.log('\n--- SEED DONE ---');
    console.log('Login credentials:');
    console.log('  Admin   : admin@laundry.com / admin123');
    console.log('  Karyawan: budi@laundry.com / karyawan123');
    console.log('  Karyawan: sari@laundry.com / karyawan123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
