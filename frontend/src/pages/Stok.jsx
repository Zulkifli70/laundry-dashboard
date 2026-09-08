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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Stok</h1>
          <a href="/dashboard" className="text-blue-500">Kembali</a>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex gap-4 flex-wrap">
            {isAdmin && (
              <select name="outlet_id" value={filters.outlet_id} onChange={handleFilterChange} className="p-2 border rounded">
                <option value="">Semua Outlet</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.nama}</option>
                ))}
              </select>
            )}
          </div>
          <div className="mt-4">
            {isAdmin && (
              <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
                + Stok Baru
              </button>
            )}
          </div>
        </div>

        {showForm && isAdmin && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Stok Baru</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <select name="outlet_id" value={form.outlet_id} onChange={handleFormChange} className="p-2 border rounded" required>
                <option value="">Pilih Outlet</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.nama}</option>
                ))}
              </select>
              <input type="text" name="nama_barang" placeholder="Nama Barang" value={form.nama_barang} onChange={handleFormChange} className="p-2 border rounded" required />
              <input type="text" name="satuan" placeholder="Satuan (liter, kg, pcs)" value={form.satuan} onChange={handleFormChange} className="p-2 border rounded" required />
              <input type="number" name="jumlah_stok" placeholder="Jumlah Stok" value={form.jumlah_stok} onChange={handleFormChange} className="p-2 border rounded" required />
              <input type="number" name="batas_minimum" placeholder="Batas Minimum" value={form.batas_minimum} onChange={handleFormChange} className="p-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Batal</button>
              </div>
            </form>
          </div>
        )}

        {showAdjust && isAdmin && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Adjust Stok: {showAdjust.nama_barang}</h3>
            <form onSubmit={handleAdjustSubmit} className="grid grid-cols-2 gap-4">
              <select name="tipe_perubahan" value={adjustForm.tipe_perubahan} onChange={handleAdjustChange} className="p-2 border rounded" required>
                <option value="masuk">Masuk (Beli)</option>
                <option value="keluar">Keluar (Pakai)</option>
              </select>
              <input type="number" name="jumlah_perubahan" placeholder="Jumlah" value={adjustForm.jumlah_perubahan} onChange={handleAdjustChange} className="p-2 border rounded" required />
              <input type="text" name="catatan" placeholder="Catatan" value={adjustForm.catatan} onChange={handleAdjustChange} className="p-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Simpan</button>
                <button type="button" onClick={() => setShowAdjust(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Batal</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Outlet</th>
                <th className="px-4 py-3 text-left">Nama Barang</th>
                <th className="px-4 py-3 text-left">Satuan</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                {isAdmin && <th className="px-4 py-3 text-left">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {stok.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.Outlet?.nama}</td>
                  <td className="px-4 py-3">{s.nama_barang}</td>
                  <td className="px-4 py-3">{s.satuan}</td>
                  <td className="px-4 py-3">
                    <span className={s.jumlah_stok <= s.batas_minimum ? 'text-red-500 font-bold' : ''}>
                      {s.jumlah_stok}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button onClick={() => setShowAdjust(s)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                        Adjust
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Stok;
