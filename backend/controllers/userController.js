const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Outlet = require('../models/Outlet');

exports.getUsers = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const where = {};
    if (outlet_id) {
      where.outlet_id = outlet_id;
    }
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Outlet, attributes: ['id', 'nama'] }],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { nama, email, password, role, outlet_id } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      nama,
      email,
      password_hash,
      role,
      outlet_id,
    });
    res.status(201).json({
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      outlet_id: user.outlet_id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, password, role, outlet_id } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    const updateData = { nama, email, role, outlet_id };
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    await user.update(updateData);
    res.json({
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      outlet_id: user.outlet_id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    await user.destroy();
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
