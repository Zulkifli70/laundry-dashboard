const { Op } = require('sequelize');
const Pengeluaran = require('../models/Pengeluaran');
const Outlet = require('../models/Outlet');

exports.getPengeluaran = async (req, res) => {
  try {
    const { outlet_id, kategori, tanggal_mulai, tanggal_akhir } = req.query;
    const where = {};

    if (outlet_id) where.outlet_id = outlet_id;
    if (kategori) where.kategori = kategori;

    if (tanggal_mulai && tanggal_akhir) {
      where.tanggal = {
        [Op.between]: [tanggal_mulai, tanggal_akhir],
      };
    }

    const pengeluaran = await Pengeluaran.findAll({
      where,
      include: [{ model: Outlet, attributes: ['id', 'nama'] }],
      order: [['tanggal', 'DESC']],
    });
    res.json(pengeluaran);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createPengeluaran = async (req, res) => {
  try {
    const { outlet_id, kategori, jumlah, deskripsi, tanggal } = req.body;
    const pengeluaran = await Pengeluaran.create({
      outlet_id,
      user_id: req.user.id,
      kategori,
      jumlah,
      deskripsi,
      tanggal,
    });
    res.status(201).json(pengeluaran);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updatePengeluaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori, jumlah, deskripsi, tanggal } = req.body;
    const pengeluaran = await Pengeluaran.findByPk(id);
    if (!pengeluaran) {
      return res.status(404).json({ message: 'Pengeluaran tidak ditemukan' });
    }
    await pengeluaran.update({ kategori, jumlah, deskripsi, tanggal });
    res.json(pengeluaran);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deletePengeluaran = async (req, res) => {
  try {
    const { id } = req.params;
    const pengeluaran = await Pengeluaran.findByPk(id);
    if (!pengeluaran) {
      return res.status(404).json({ message: 'Pengeluaran tidak ditemukan' });
    }
    await pengeluaran.destroy();
    res.json({ message: 'Pengeluaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
