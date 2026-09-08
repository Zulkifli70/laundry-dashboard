const { Op } = require('sequelize');
const Transaksi = require('../models/Transaksi');
const Outlet = require('../models/Outlet');
const User = require('../models/User');
const Layanan = require('../models/Layanan');

exports.getTransaksi = async (req, res) => {
  try {
    const { outlet_id, status, status_bayar, tanggal_mulai, tanggal_akhir } = req.query;
    const where = {};

    // Karyawan hanya bisa lihat outlet sendiri
    if (req.user.role === 'karyawan') {
      where.outlet_id = req.user.outlet_id;
    } else if (outlet_id) {
      where.outlet_id = outlet_id;
    }

    if (status) where.status = status;
    if (status_bayar) where.status_bayar = status_bayar;

    if (tanggal_mulai && tanggal_akhir) {
      where.created_at = {
        [Op.between]: [new Date(tanggal_mulai), new Date(tanggal_akhir)],
      };
    }

    const transaksi = await Transaksi.findAll({
      where,
      include: [
        { model: Outlet, attributes: ['id', 'nama'] },
        { model: User, attributes: ['id', 'nama'] },
        { model: Layanan, attributes: ['id', 'nama'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaksi = await Transaksi.findByPk(id, {
      include: [
        { model: Outlet, attributes: ['id', 'nama'] },
        { model: User, attributes: ['id', 'nama'] },
        { model: Layanan, attributes: ['id', 'nama', 'tipe_satuan'] },
      ],
    });
    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createTransaksi = async (req, res) => {
  try {
    const {
      outlet_id,
      layanan_id,
      nama_pelanggan,
      no_hp_pelanggan,
      jumlah_qty,
      total_harga,
    } = req.body;

    const transaksi = await Transaksi.create({
      outlet_id,
      user_id: req.user.id,
      layanan_id,
      nama_pelanggan,
      no_hp_pelanggan,
      jumlah_qty,
      total_harga,
      status: 'diterima',
      status_bayar: 'belum_bayar',
    });

    res.status(201).json(transaksi);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, status_bayar } = req.body;
    const transaksi = await Transaksi.findByPk(id);
    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    await transaksi.update({ status, status_bayar });
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.exportTransaksi = async (req, res) => {
  try {
    const { outlet_id, status, status_bayar, tanggal_mulai, tanggal_akhir } = req.query;
    const where = {};

    if (req.user.role === 'karyawan') {
      where.outlet_id = req.user.outlet_id;
    } else if (outlet_id) {
      where.outlet_id = outlet_id;
    }

    if (status) where.status = status;
    if (status_bayar) where.status_bayar = status_bayar;

    if (tanggal_mulai && tanggal_akhir) {
      where.created_at = {
        [Op.between]: [new Date(tanggal_mulai), new Date(tanggal_akhir)],
      };
    }

    const transaksi = await Transaksi.findAll({
      where,
      include: [
        { model: Outlet, attributes: ['id', 'nama'] },
        { model: User, attributes: ['id', 'nama'] },
        { model: Layanan, attributes: ['id', 'nama'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const { createObjectCsvWriter } = require('csv-writer');
    const csvWriter = createObjectCsvWriter({
      path: 'transaksi_export.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'outlet', title: 'Outlet' },
        { id: 'layanan', title: 'Layanan' },
        { id: 'nama_pelanggan', title: 'Nama Pelanggan' },
        { id: 'no_hp', title: 'No HP' },
        { id: 'qty', title: 'Qty' },
        { id: 'total', title: 'Total Harga' },
        { id: 'status', title: 'Status' },
        { id: 'bayar', title: 'Status Bayar' },
        { id: 'tanggal', title: 'Tanggal' },
      ],
    });

    const records = transaksi.map((t) => ({
      id: t.id,
      outlet: t.Outlet.nama,
      layanan: t.Layanan.nama,
      nama_pelanggan: t.nama_pelanggan,
      no_hp: t.no_hp_pelanggan,
      qty: t.jumlah_qty,
      total: t.total_harga,
      status: t.status,
      bayar: t.status_bayar,
      tanggal: t.created_at,
    }));

    await csvWriter.writeRecords(records);
    res.download('transaksi_export.csv');
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
