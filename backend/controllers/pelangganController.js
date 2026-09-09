const { Pelanggan, Outlet } = require('../models');
const { Op } = require('sequelize');

const pelangganController = {
  getAll: async (req, res) => {
    try {
      const { outlet_id, search, page = 1, limit = 50 } = req.query;
      const where = {};

      // Filter by outlet: admin can filter, karyawan auto-filter by their outlet
      if (req.user.role === 'admin') {
        if (outlet_id) where.outlet_id = parseInt(outlet_id);
      } else {
        where.outlet_id = req.user.outlet_id;
      }

      // Search by nama or no_hp
      if (search) {
        where[Op.or] = [
          { nama: { [Op.iLike]: `%${search}%` } },
          { no_hp: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const { count, rows } = await Pelanggan.findAndCountAll({
        where,
        include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'nama'] }],
        order: [['nama', 'ASC']],
        limit: parseInt(limit),
        offset,
      });

      res.json({
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('Error getAll pelanggan:', error);
      res.status(500).json({ message: 'Gagal mengambil data pelanggan' });
    }
  },

  getById: async (req, res) => {
    try {
      const pelanggan = await Pelanggan.findByPk(req.params.id, {
        include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'nama'] }],
      });
      if (!pelanggan) {
        return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
      }
      // Check outlet access for karyawan
      if (req.user.role !== 'admin' && pelanggan.outlet_id !== req.user.outlet_id) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
      res.json(pelanggan);
    } catch (error) {
      console.error('Error getById pelanggan:', error);
      res.status(500).json({ message: 'Gagal mengambil data pelanggan' });
    }
  },

  create: async (req, res) => {
    try {
      const { outlet_id, nama, no_hp, alamat, catatan } = req.body;

      // Validate required fields
      if (!nama || !no_hp) {
        return res.status(400).json({ message: 'Nama dan No HP wajib diisi' });
      }

      // Determine outlet_id
      let targetOutletId;
      if (req.user.role === 'admin') {
        if (!outlet_id) {
          return res.status(400).json({ message: 'Outlet wajib dipilih untuk admin' });
        }
        targetOutletId = parseInt(outlet_id);
      } else {
        targetOutletId = req.user.outlet_id;
      }

      // Check if outlet exists
      const outlet = await Outlet.findByPk(targetOutletId);
      if (!outlet) {
        return res.status(404).json({ message: 'Outlet tidak ditemukan' });
      }

      // Check duplicate no_hp in same outlet
      const existing = await Pelanggan.findOne({
        where: { no_hp, outlet_id: targetOutletId },
      });
      if (existing) {
        return res.status(400).json({ message: 'Nomor HP sudah terdaftar di outlet ini' });
      }

      const pelanggan = await Pelanggan.create({
        outlet_id: targetOutletId,
        nama,
        no_hp,
        alamat,
        catatan,
      });

      const result = await Pelanggan.findByPk(pelanggan.id, {
        include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'nama'] }],
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('Error create pelanggan:', error);
      res.status(500).json({ message: 'Gagal menambah pelanggan' });
    }
  },

  update: async (req, res) => {
    try {
      const { nama, no_hp, alamat, catatan } = req.body;

      const pelanggan = await Pelanggan.findByPk(req.params.id);
      if (!pelanggan) {
        return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
      }

      // Check outlet access for karyawan
      if (req.user.role !== 'admin' && pelanggan.outlet_id !== req.user.outlet_id) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }

      // Check duplicate no_hp in same outlet (excluding current)
      if (no_hp && no_hp !== pelanggan.no_hp) {
        const existing = await Pelanggan.findOne({
          where: {
            no_hp,
            outlet_id: pelanggan.outlet_id,
            id: { [Op.ne]: pelanggan.id },
          },
        });
        if (existing) {
          return res.status(400).json({ message: 'Nomor HP sudah terdaftar di outlet ini' });
        }
      }

      await pelanggan.update({ nama, no_hp, alamat, catatan });

      const result = await Pelanggan.findByPk(pelanggan.id, {
        include: [{ model: Outlet, as: 'Outlet', attributes: ['id', 'nama'] }],
      });

      res.json(result);
    } catch (error) {
      console.error('Error update pelanggan:', error);
      res.status(500).json({ message: 'Gagal mengupdate pelanggan' });
    }
  },

  delete: async (req, res) => {
    try {
      const pelanggan = await Pelanggan.findByPk(req.params.id);
      if (!pelanggan) {
        return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
      }

      // Check outlet access for karyawan
      if (req.user.role !== 'admin' && pelanggan.outlet_id !== req.user.outlet_id) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }

      await pelanggan.destroy();
      res.json({ message: 'Pelanggan berhasil dihapus' });
    } catch (error) {
      console.error('Error delete pelanggan:', error);
      res.status(500).json({ message: 'Gagal menghapus pelanggan' });
    }
  },
};

module.exports = pelangganController;