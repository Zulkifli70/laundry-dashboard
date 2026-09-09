const StokItem = require('../models/StokItem');
const StokLog = require('../models/StokLog');
const Outlet = require('../models/Outlet');

exports.getStok = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const where = {};

    // Karyawan hanya bisa lihat outlet sendiri
    if (req.user.role === 'karyawan') {
      where.outlet_id = req.user.outlet_id;
    } else if (outlet_id) {
      where.outlet_id = outlet_id;
    }

    const stok = await StokItem.findAll({
      where,
      include: [{ model: Outlet, attributes: ['id', 'nama'] }],
    });
    res.json(stok);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createStok = async (req, res) => {
  try {
    const { outlet_id, nama_barang, satuan, jumlah_stok, batas_minimum } = req.body;
    const stok = await StokItem.create({
      outlet_id,
      nama_barang,
      satuan,
      jumlah_stok,
      batas_minimum,
    });
    res.status(201).json(stok);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.adjustStok = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipe_perubahan, jumlah_perubahan, catatan } = req.body;

    const stokItem = await StokItem.findByPk(id);
    if (!stokItem) {
      return res.status(404).json({ message: 'Stok item tidak ditemukan' });
    }

    // Update jumlah stok
    let newJumlah = parseFloat(stokItem.jumlah_stok);
    if (tipe_perubahan === 'masuk') {
      newJumlah += parseFloat(jumlah_perubahan);
    } else {
      newJumlah -= parseFloat(jumlah_perubahan);
      if (newJumlah < 0) {
        return res.status(400).json({ message: 'Stok tidak mencukupi' });
      }
    }

    await stokItem.update({ jumlah_stok: newJumlah });

    // Buat log perubahan
    await StokLog.create({
      stok_item_id: id,
      user_id: req.user.id,
      tipe_perubahan,
      jumlah_perubahan,
      catatan,
    });

    res.json(stokItem);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getStokLog = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await StokLog.findAll({
      where: { stok_item_id: id },
      include: [
        { model: Outlet, attributes: ['id', 'nama'] },
        { model: require('../models/User'), attributes: ['id', 'nama'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateStok = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, satuan, jumlah_stok, batas_minimum } = req.body;
    const stokItem = await StokItem.findByPk(id);
    if (!stokItem) {
      return res.status(404).json({ message: 'Stok item tidak ditemukan' });
    }
    await stokItem.update({ nama_barang, satuan, jumlah_stok, batas_minimum });
    res.json(stokItem);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteStok = async (req, res) => {
  try {
    const { id } = req.params;
    const stokItem = await StokItem.findByPk(id);
    if (!stokItem) {
      return res.status(404).json({ message: 'Stok item tidak ditemukan' });
    }
    await stokItem.destroy();
    res.json({ message: 'Stok item berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
