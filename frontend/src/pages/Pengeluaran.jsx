import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pengeluaranAPI, outletAPI } from '../services/api';

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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Pengeluaran</h1>
          <a href="/dashboard" className="text-blue-500">Kembali</a>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex gap-4 flex-wrap">
            <select name="outlet_id" value={filters.outlet_id} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Semua Outlet</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>{o.nama}</option>
              ))}
            </select>
            <select name="kategori" value={filters.kategori} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Semua Kategori</option>
              <option value="listrik">Listrik</option>
              <option value="gaji">Gaji</option>
              <option value="bahan_baku">Bahan Baku</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <input type="date" name="tanggal_mulai" value={filters.tanggal_mulai} onChange={handleFilterChange} className="p-2 border rounded" />
            <input type="date" name="tanggal_akhir" value={filters.tanggal_akhir} onChange={handleFilterChange} className="p-2 border rounded" />
          </div>
          <div className="mt-4">
            <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
              + Pengeluaran Baru
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Pengeluaran Baru</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <select name="outlet_id" value={form.outlet_id} onChange={handleFormChange} className="p-2 border rounded" required>
                <option value="">Pilih Outlet</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.nama}</option>
                ))}
              </select>
              <select name="kategori" value={form.kategori} onChange={handleFormChange} className="p-2 border rounded" required>
                <option value="">Pilih Kategori</option>
                <option value="listrik">Listrik</option>
                <option value="gaji">Gaji</option>
                <option value="bahan_baku">Bahan Baku</option>
                <option value="lainnya">Lainnya</option>
              </select>
              <input type="number" name="jumlah" placeholder="Jumlah" value={form.jumlah} onChange={handleFormChange} className="p-2 border rounded" required />
              <input type="date" name="tanggal" value={form.tanggal} onChange={handleFormChange} className="p-2 border rounded" required />
              <input type="text" name="deskripsi" placeholder="Deskripsi" value={form.deskripsi} onChange={handleFormChange} className="p-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Batal</button>
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
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                <th className="px-4 py-3 text-left">Deskripsi</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaran.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3">{p.Outlet?.nama}</td>
                  <td className="px-4 py-3">{p.kategori}</td>
                  <td className="px-4 py-3">Rp {p.jumlah?.toLocaleString()}</td>
                  <td className="px-4 py-3">{p.deskripsi}</td>
                  <td className="px-4 py-3">{p.tanggal}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Pengeluaran;
