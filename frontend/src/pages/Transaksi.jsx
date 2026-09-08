import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transaksiAPI, layananAPI, outletAPI } from '../services/api';

const Transaksi = () => {
  const { user, isAdmin } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [layanan, setLayanan] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    outlet_id: '',
    status: '',
    status_bayar: '',
    tanggal_mulai: '',
    tanggal_akhir: '',
  });
  const [form, setForm] = useState({
    outlet_id: user?.outlet_id || '',
    layanan_id: '',
    nama_pelanggan: '',
    no_hp_pelanggan: '',
    jumlah_qty: '',
    total_harga: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [transaksiRes, layananRes] = await Promise.all([
        transaksiAPI.getAll(filters),
        layananAPI.getAll(),
      ]);
      setTransaksi(transaksiRes.data);
      setLayanan(layananRes.data);

      if (isAdmin) {
        const outletRes = await outletAPI.getAll();
        setOutlets(outletRes.data);
      }
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
      const selectedLayanan = layanan.find((l) => l.id === parseInt(form.layanan_id));
      const totalHarga = selectedLayanan
        ? selectedLayanan.harga * parseFloat(form.jumlah_qty)
        : 0;

      await transaksiAPI.create({
        ...form,
        total_harga: totalHarga,
      });
      setShowForm(false);
      setForm({
        outlet_id: user?.outlet_id || '',
        layanan_id: '',
        nama_pelanggan: '',
        no_hp_pelanggan: '',
        jumlah_qty: '',
        total_harga: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating transaksi:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await transaksiAPI.export(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transaksi.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await transaksiAPI.update(id, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Transaksi</h1>
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
            <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Semua Status</option>
              <option value="diterima">Diterima</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="diambil">Diambil</option>
            </select>
            <select name="status_bayar" value={filters.status_bayar} onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">Semua Bayar</option>
              <option value="belum_bayar">Belum Bayar</option>
              <option value="lunas">Lunas</option>
            </select>
            <input type="date" name="tanggal_mulai" value={filters.tanggal_mulai} onChange={handleFilterChange} className="p-2 border rounded" />
            <input type="date" name="tanggal_akhir" value={filters.tanggal_akhir} onChange={handleFilterChange} className="p-2 border rounded" />
          </div>
          <div className="mt-4 flex gap-4">
            <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
              + Transaksi Baru
            </button>
            {isAdmin && (
              <button onClick={handleExport} className="bg-green-500 text-white px-4 py-2 rounded">
                Export CSV
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Transaksi Baru</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {isAdmin && (
                <select name="outlet_id" value={form.outlet_id} onChange={handleFormChange} className="p-2 border rounded" required>
                  <option value="">Pilih Outlet</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>{o.nama}</option>
                  ))}
                </select>
              )}
              <select name="layanan_id" value={form.layanan_id} onChange={handleFormChange} className="p-2 border rounded" required>
                <option value="">Pilih Layanan</option>
                {layanan.map((l) => (
                  <option key={l.id} value={l.id}>{l.nama} - Rp {l.harga}/{l.tipe_satuan}</option>
                ))}
              </select>
              <input type="text" name="nama_pelanggan" placeholder="Nama Pelanggan" value={form.nama_pelanggan} onChange={handleFormChange} className="p-2 border rounded" required />
              <input type="text" name="no_hp_pelanggan" placeholder="No HP" value={form.no_hp_pelanggan} onChange={handleFormChange} className="p-2 border rounded" required />
              <input type="number" name="jumlah_qty" placeholder="Jumlah (kg/item)" value={form.jumlah_qty} onChange={handleFormChange} className="p-2 border rounded" required />
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
                <th className="px-4 py-3 text-left">Pelanggan</th>
                <th className="px-4 py-3 text-left">Layanan</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Bayar</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">{t.id}</td>
                  <td className="px-4 py-3">{t.nama_pelanggan}</td>
                  <td className="px-4 py-3">{t.Layanan?.nama}</td>
                  <td className="px-4 py-3">{t.jumlah_qty}</td>
                  <td className="px-4 py-3">Rp {t.total_harga?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      t.status === 'selesai' ? 'bg-green-100 text-green-800' :
                      t.status === 'diproses' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      t.status_bayar === 'lunas' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.status_bayar}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {t.status === 'diterima' && (
                        <button onClick={() => handleStatusUpdate(t.id, 'diproses')} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                          Proses
                        </button>
                      )}
                      {t.status === 'diproses' && (
                        <button onClick={() => handleStatusUpdate(t.id, 'selesai')} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                          Selesai
                        </button>
                      )}
                      {t.status === 'selesai' && (
                        <button onClick={() => handleStatusUpdate(t.id, 'diambil')} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Diambil
                        </button>
                      )}
                      {t.no_hp_pelanggan && (
                        <a
                          href={`https://wa.me/${t.no_hp_pelanggan}?text=Pesanan ${t.nama_pelanggan} sudah selesai`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          WA
                        </a>
                      )}
                    </div>
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

export default Transaksi;
