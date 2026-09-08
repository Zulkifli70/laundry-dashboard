const Layanan = require('../models/Layanan');

exports.getLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.findAll();
    res.json(layanan);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createLayanan = async (req, res) => {
  try {
    const { nama, tipe_satuan, harga } = req.body;
    const layanan = await Layanan.create({ nama, tipe_satuan, harga });
    res.status(201).json(layanan);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateLayanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, tipe_satuan, harga } = req.body;
    const layanan = await Layanan.findByPk(id);
    if (!layanan) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    await layanan.update({ nama, tipe_satuan, harga });
    res.json(layanan);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteLayanan = async (req, res) => {
  try {
    const { id } = req.params;
    const layanan = await Layanan.findByPk(id);
    if (!layanan) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    await layanan.destroy();
    res.json({ message: 'Layanan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
