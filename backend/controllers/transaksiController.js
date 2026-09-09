const { Op } = require('sequelize');
const Transaksi = require('../models/Transaksi');
const Outlet = require('../models/Outlet');
const User = require('../models/User');
const Layanan = require('../models/Layanan');
const Pelanggan = require('../models/Pelanggan');

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
        { model: Layanan, attributes: ['id', 'nama', 'tipe_satuan'] },
        { model: Pelanggan, as: 'Pelanggan', attributes: ['id', 'nama', 'no_hp'] },
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
        { model: Pelanggan, as: 'Pelanggan', attributes: ['id', 'nama', 'no_hp'] },
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
    let {
      outlet_id,
      layanan_id,
      pelanggan_id,
      nama_pelanggan,
      no_hp_pelanggan,
      jumlah_qty,
      total_harga,
      status_bayar,
    } = req.body;

    // Karyawan otomatis memakai outlet sendiri bila tidak dikirim / kosong
    if (req.user.role === 'karyawan') {
      outlet_id = req.user.outlet_id;
    }

    if (!outlet_id) {
      return res.status(400).json({ message: 'Outlet wajib dipilih' });
    }
    if (!layanan_id) {
      return res.status(400).json({ message: 'Layanan wajib dipilih' });
    }

    // If pelanggan_id provided, fetch pelanggan data
    if (pelanggan_id) {
      const pelanggan = await Pelanggan.findByPk(pelanggan_id);
      if (!pelanggan) {
        return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
      }
      // Check outlet access for karyawan
      if (req.user.role === 'karyawan' && pelanggan.outlet_id !== req.user.outlet_id) {
        return res.status(403).json({ message: 'Pelanggan bukan dari outlet Anda' });
      }
      nama_pelanggan = pelanggan.nama;
      no_hp_pelanggan = pelanggan.no_hp;
    }

    if (!nama_pelanggan || !no_hp_pelanggan) {
      return res.status(400).json({ message: 'Nama dan No HP pelanggan wajib diisi' });
    }
    if (!jumlah_qty || parseFloat(jumlah_qty) <= 0) {
      return res.status(400).json({ message: 'Jumlah (qty) harus lebih dari 0' });
    }

    // Hitung ulang total dari harga layanan agar konsisten
    const layanan = await Layanan.findByPk(layanan_id);
    if (!layanan) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    const qty = parseFloat(jumlah_qty);
    const computedTotal = parseFloat(layanan.harga) * qty;
    // Pakai total kiriman client hanya bila valid, fallback ke hitungan server
    if (!total_harga || isNaN(parseFloat(total_harga)) || parseFloat(total_harga) <= 0) {
      total_harga = computedTotal;
    }

    const allowedBayar = ['belum_bayar', 'lunas'];
    if (!allowedBayar.includes(status_bayar)) status_bayar = 'belum_bayar';

    const transaksi = await Transaksi.create({
      outlet_id,
      user_id: req.user.id,
      layanan_id,
      pelanggan_id: pelanggan_id || null,
      nama_pelanggan,
      no_hp_pelanggan,
      jumlah_qty: qty,
      total_harga,
      status: 'diterima',
      status_bayar,
    });

    res.status(201).json(transaksi);
  } catch (error) {
    console.error('createTransaksi error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, status_bayar, pelanggan_id, nama_pelanggan, no_hp_pelanggan, layanan_id, jumlah_qty, total_harga } = req.body;
    const transaksi = await Transaksi.findByPk(id);
    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    // Karyawan hanya boleh ubah transaksi outlet sendiri
    if (req.user.role === 'karyawan' && transaksi.outlet_id !== req.user.outlet_id) {
      return res.status(403).json({ message: 'Akses ditolak untuk outlet ini' });
    }
    
    const patch = {};
    if (status) patch.status = status;
    if (status_bayar) patch.status_bayar = status_bayar;
    
    // Admin can update more fields
    if (req.user.role === 'admin') {
      if (pelanggan_id !== undefined) {
        if (pelanggan_id) {
          const pelanggan = await Pelanggan.findByPk(pelanggan_id);
          if (!pelanggan) {
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
          }
          if (pelanggan.outlet_id !== transaksi.outlet_id) {
            return res.status(400).json({ message: 'Pelanggan harus dari outlet yang sama' });
          }
          patch.pelanggan_id = pelanggan_id;
          patch.nama_pelanggan = pelanggan.nama;
          patch.no_hp_pelanggan = pelanggan.no_hp;
        } else {
          patch.pelanggan_id = null;
        }
      }
      if (nama_pelanggan) patch.nama_pelanggan = nama_pelanggan;
      if (no_hp_pelanggan) patch.no_hp_pelanggan = no_hp_pelanggan;
      if (layanan_id) patch.layanan_id = layanan_id;
      if (jumlah_qty) patch.jumlah_qty = parseFloat(jumlah_qty);
      if (total_harga) patch.total_harga = parseFloat(total_harga);
    }
    
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: 'Tidak ada perubahan dikirim' });
    }
    await transaksi.update(patch);
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
        { model: Layanan, attributes: ['id', 'nama', 'tipe_satuan'] },
        { model: Pelanggan, as: 'Pelanggan', attributes: ['id', 'nama', 'no_hp'] },
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

exports.deleteTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const transaksi = await Transaksi.findByPk(id);
    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    await transaksi.destroy();
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
