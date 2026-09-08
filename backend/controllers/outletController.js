const Outlet = require('../models/Outlet');

exports.getOutlets = async (req, res) => {
  try {
    const outlets = await Outlet.findAll();
    res.json(outlets);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createOutlet = async (req, res) => {
  try {
    const { nama, alamat, no_telepon } = req.body;
    const outlet = await Outlet.create({ nama, alamat, no_telepon });
    res.status(201).json(outlet);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, alamat, no_telepon } = req.body;
    const outlet = await Outlet.findByPk(id);
    if (!outlet) {
      return res.status(404).json({ message: 'Outlet tidak ditemukan' });
    }
    await outlet.update({ nama, alamat, no_telepon });
    res.json(outlet);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const outlet = await Outlet.findByPk(id);
    if (!outlet) {
      return res.status(404).json({ message: 'Outlet tidak ditemukan' });
    }
    await outlet.destroy();
    res.json({ message: 'Outlet berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
