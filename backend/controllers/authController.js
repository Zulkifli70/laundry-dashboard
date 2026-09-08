const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        outlet_id: user.outlet_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logout berhasil' });
};

exports.getMe = async (req, res) => {
  res.json({
    id: req.user.id,
    nama: req.user.nama,
    email: req.user.email,
    role: req.user.role,
    outlet_id: req.user.outlet_id,
  });
};
