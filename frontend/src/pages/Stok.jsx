import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { stokAPI, outletAPI } from '../services/api';

const Stok = () => {
  const { user, isAdmin } = useAuth();
  const [stok, setStok] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAdjust, setShowAdjust] = useState(null);
  const [filters, setFilters] = useState({ outlet_id: '' });
  const [form, setForm] = useState({
    outlet_id: '',
    nama_barang: '',
    satuan: '',
    jumlah_stok: '',
    batas_minimum: '',
  });
  const [adjustForm, setAdjustForm] = useState({
    tipe_perubahan: 'masuk',
    jumlah_perubahan: '',
    catatan: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [stokRes, outletRes] = await Promise.all([
        stokAPI.getAll(filters),
        outletAPI.getAll(),
      ]);
      setStok(stokRes.data);
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

  const handleAdjustChange = (e) => {
    setAdjustForm({ ...adjustForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stokAPI.create(form);
      setShowForm(false);
      setForm({ outlet_id: '', nama_barang: '', satuan: '', jumlah_stok: '', batas_minimum: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating stok:', error);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      await stokAPI.adjust(showAdjust.id, adjustForm);
      setShowAdjust(null);
      setAdjustForm({ tipe_perubahan: 'masuk', jumlah_perubahan: '', catatan: '' });
      fetchData();
    } catch (error) {
      console.error('Error adjusting stok:', error);
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
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">Stok Barang</h1>
          <p className="text-base-content/60 mt-1">Kelola stok per outlet</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Stok Baru
          </button>
        )}
      </div>

      {/* Filter */}
      {isAdmin && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <div className="form-control w-full max-w-xs">
              <label className="label"><span className="label-text text-xs">Filter Outlet</span></label>
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
          </div>
        </div>
      )}

      {/* Form Stok Baru */}
      {showForm && isAdmin && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-base-content">Stok Baru</h3>
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
                <label className="label"><span className="label-text">Nama Barang</span></label>
                <input
                  type="text"
                  name="nama_barang"
                  value={form.nama_barang}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="Deterjen, Pewangi, Plastik, dll"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Satuan</span></label>
                <input
                  type="text"
                  name="satuan"
                  value={form.satuan}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="liter, kg, pcs, dus"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Jumlah Stok Awal</span></label>
                <input
                  type="number"
                  name="jumlah_stok"
                  value={form.jumlah_stok}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Batas Minimum (Opsional)</span></label>
                <input
                  type="number"
                  name="batas_minimum"
                  value={form.batas_minimum}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="5"
                  min="0"
                  step="0.1"
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

      {/* Form Adjust Stok */}
      {showAdjust && isAdmin && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-base-content">Adjust Stok: {showAdjust.nama_barang}</h3>
              <button
                onClick={() => setShowAdjust(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="alert alert-info mb-4">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-5a1 1 0 11-2 0 1 1 0 012 0zm-1 8a1 1 0 01-1 1h-2a1 1 0 010-2h2a1 1 0 011 1z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-medium">Stok saat ini: </span>
                <span className="font-bold text-lg">{showAdjust.jumlah_stok} {showAdjust.satuan}</span>
                {showAdjust.batas_minimum && (
                  <> | Minimum: {showAdjust.batas_minimum} {showAdjust.satuan}</>
                )}
              </div>
            </div>
            <form onSubmit={handleAdjustSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Tipe Perubahan</span></label>
                <select
                  name="tipe_perubahan"
                  value={adjustForm.tipe_perubahan}
                  onChange={handleAdjustChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="masuk">Masuk (Beli/Restock)</option>
                  <option value="keluar">Keluar (Pakai/Habis)</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Jumlah</span></label>
                <input
                  type="number"
                  name="jumlah_perubahan"
                  value={adjustForm.jumlah_perubahan}
                  onChange={handleAdjustChange}
                  className="input input-bordered w-full"
                  placeholder="10"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-control sm:col-span-2">
                <label className="label"><span className="label-text">Catatan</span></label>
                <input
                  type="text"
                  name="catatan"
                  value={adjustForm.catatan}
                  onChange={handleAdjustChange}
                  className="input input-bordered w-full"
                  placeholder="Contoh: beli 5 dus deterjen, pakai 2 liter pewangi"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAdjust(null)} className="btn btn-ghost">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan
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
                <th className="px-4 py-3">Nama Barang</th>
                <th className="px-4 py-3">Satuan</th>
                <th className="px-4 py-3">Jumlah Stok</th>
                {isAdmin && <th className="px-4 py-3">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {stok.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-base-content/50">
                    <svg className="w-12 h-12 mx-auto mb-3 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p>Belum ada data stok</p>
                  </td>
                </tr>
              ) : (
                stok.map((s) => (
                  <tr key={s.id} className="hover:bg-base-50/50">
                    <td className="px-4 py-3 text-sm font-mono text-base-content/60">{s.id}</td>
                    <td className="px-4 py-3 text-sm text-base-content">{s.Outlet?.nama}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-base-content">{s.nama_barang}</p>
                      {s.batas_minimum && (
                        <p className="text-xs text-base-content/50">Min: {s.batas_minimum} {s.satuan}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-base-content/60">{s.satuan}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${s.jumlah_stok <= (s.batas_minimum || 0) && s.batas_minimum > 0 ? 'text-error' : 'text-base-content'}`}>
                          {s.jumlah_stok}
                        </span>
                        {s.batas_minimum && s.jumlah_stok <= s.batas_minimum && s.batas_minimum > 0 && (
                          <span className="badge badge-error badge-xs">Habis</span>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setShowAdjust(s)}
                          className="btn btn-xs btn-warning btn-circle"
                          title="Adjust Stok"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </td>
                    )}
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

export default Stok;