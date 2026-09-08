import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pengeluaranAPI, outletAPI } from '../services/api';

const kategoriLabels = {
  listrik: 'Listrik',
  gaji: 'Gaji',
  bahan_baku: 'Bahan Baku',
  lainnya: 'Lainnya',
};

const Pengeluaran = () => {
  const { user } = useAuth();
  const [pengeluaran, setPengeluaran] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    outlet_id: '',
    kategori: '',
    tanggal_mulai: '',
    tanggal_akhir: '',
  });
  const [form, setForm] = useState({
    outlet_id: '',
    kategori: '',
    jumlah: '',
    deskripsi: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [pengeluaranRes, outletRes] = await Promise.all([
        pengeluaranAPI.getAll(filters),
        outletAPI.getAll(),
      ]);
      setPengeluaran(pengeluaranRes.data);
      setOutlets(outletRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await pengeluaranAPI.create(form);
      setShowForm(false);
      setForm({
        outlet_id: '',
        kategori: '',
        jumlah: '',
        deskripsi: '',
        tanggal: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (error) {
      console.error('Error creating pengeluaran:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus?')) {
      try {
        await pengeluaranAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting pengeluaran:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">Pengeluaran</h1>
          <p className="text-base-content/60 mt-1">Catat pengeluaran outlet</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Pengeluaran Baru
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Outlet</span></label>
              <select
                name="outlet_id"
                value={filters.outlet_id}
                onChange={handleFilterChange}
                className="select select-bordered w-full"
              >
                <option value="">Semua Outlet</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.nama}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Kategori</span></label>
              <select
                name="kategori"
                value={filters.kategori}
                onChange={handleFilterChange}
                className="select select-bordered w-full"
              >
                <option value="">Semua Kategori</option>
                <option value="listrik">Listrik</option>
                <option value="gaji">Gaji</option>
                <option value="bahan_baku">Bahan Baku</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Dari</span></label>
              <input
                type="date"
                name="tanggal_mulai"
                value={filters.tanggal_mulai}
                onChange={handleFilterChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Sampai</span></label>
              <input
                type="date"
                name="tanggal_akhir"
                value={filters.tanggal_akhir}
                onChange={handleFilterChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Pengeluaran Baru */}
      {showForm && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-base-content">Pengeluaran Baru</h3>
              <button
                onClick={() => setShowForm(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Outlet</span></label>
                <select
                  name="outlet_id"
                  value={form.outlet_id}
                  onChange={handleFormChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Pilih Outlet</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>{o.nama}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Kategori</span></label>
                <select
                  name="kategori"
                  value={form.kategori}
                  onChange={handleFormChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="listrik">Listrik</option>
                  <option value="gaji">Gaji</option>
                  <option value="bahan_baku">Bahan Baku</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Jumlah</span></label>
                <input
                  type="number"
                  name="jumlah"
                  value={form.jumlah}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="100000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Tanggal</span></label>
                <input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control sm:col-span-2">
                <label className="label"><span className="label-text">Deskripsi</span></label>
                <input
                  type="text"
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="Catatan pengeluaran"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Outlet</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Jumlah</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaran.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-base-content/50">
                    <svg className="w-12 h-12 mx-auto mb-3 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0l1-1m-1 1l-1-1" />
                    </svg>
                    <p>Belum ada pengeluaran</p>
                  </td>
                </tr>
              ) : (
                pengeluaran.map((p) => (
                  <tr key={p.id} className="hover:bg-base-50/50">
                    <td className="px-4 py-3 text-sm font-mono text-base-content/60">{p.id}</td>
                    <td className="px-4 py-3 text-sm text-base-content">{p.Outlet?.nama}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge-outline">{kategoriLabels[p.kategori] || p.kategori}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-base-content">
                      Rp {p.jumlah?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-base-content/80">{p.deskripsi || '-'}</td>
                    <td className="px-4 py-3 text-sm text-base-content/60">{p.tanggal}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn btn-xs btn-error btn-circle"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pengeluaran;