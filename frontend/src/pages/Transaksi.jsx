import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transaksiAPI, layananAPI, outletAPI } from '../services/api';

const statusColors = {
  diterima: 'badge-info',
  diproses: 'badge-warning',
  selesai: 'badge-success',
  diambil: 'badge-primary',
};

const bayarColors = {
  belum_bayar: 'badge-error',
  lunas: 'badge-success',
};

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
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">Transaksi</h1>
          <p className="text-base-content/60 mt-1">Kelola transaksi laundry</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Transaksi Baru
          </button>
          {isAdmin && (
            <button onClick={handleExport} className="btn btn-secondary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {isAdmin && (
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
            )}
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Status</span></label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="select select-bordered w-full"
              >
                <option value="">Semua</option>
                <option value="diterima">Diterima</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="diambil">Diambil</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Pembayaran</span></label>
              <select
                name="status_bayar"
                value={filters.status_bayar}
                onChange={handleFilterChange}
                className="select select-bordered w-full"
              >
                <option value="">Semua</option>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="lunas">Lunas</option>
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

      {/* Form Transaksi Baru */}
      {showForm && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-base-content">Transaksi Baru</h3>
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
              {isAdmin && (
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
              )}
              <div className="form-control">
                <label className="label"><span className="label-text">Layanan</span></label>
                <select
                  name="layanan_id"
                  value={form.layanan_id}
                  onChange={handleFormChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Pilih Layanan</option>
                  {layanan.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nama} - Rp {l.harga.toLocaleString()}/{l.tipe_satuan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Nama Pelanggan</span></label>
                <input
                  type="text"
                  name="nama_pelanggan"
                  value={form.nama_pelanggan}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="Nama pelanggan"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">No HP</span></label>
                <input
                  type="tel"
                  name="no_hp_pelanggan"
                  value={form.no_hp_pelanggan}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Jumlah (kg/item)</span></label>
                <input
                  type="number"
                  name="jumlah_qty"
                  value={form.jumlah_qty}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="1"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Transaksi
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
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Layanan</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bayar</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-base-content/50">
                    <svg className="w-12 h-12 mx-auto mb-3 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>Belum ada transaksi</p>
                  </td>
                </tr>
              ) : (
                transaksi.map((t) => (
                  <tr key={t.id} className="hover:bg-base-50/50">
                    <td className="px-4 py-3 text-sm font-mono text-base-content/60">{t.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-base-content">{t.nama_pelanggan}</p>
                        {t.no_hp_pelanggan && (
                          <p className="text-xs text-base-content/50">{t.no_hp_pelanggan}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-base-content">{t.Layanan?.nama}</td>
                    <td className="px-4 py-3 text-sm text-base-content/80">{t.jumlah_qty} {t.Layanan?.tipe_satuan}</td>
                    <td className="px-4 py-3 text-sm font-medium text-base-content">
                      Rp {t.total_harga?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[t.status]}`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${bayarColors[t.status_bayar]}`}>
                        {t.status_bayar === 'belum_bayar' ? 'Belum Bayar' : 'Lunas'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {t.status === 'diterima' && (
                          <button
                            onClick={() => handleStatusUpdate(t.id, 'diproses')}
                            className="btn btn-xs btn-warning"
                            title="Proses"
                          >
                            Proses
                          </button>
                        )}
                        {t.status === 'diproses' && (
                          <button
                            onClick={() => handleStatusUpdate(t.id, 'selesai')}
                            className="btn btn-xs btn-success"
                            title="Selesai"
                          >
                            Selesai
                          </button>
                        )}
                        {t.status === 'selesai' && (
                          <button
                            onClick={() => handleStatusUpdate(t.id, 'diambil')}
                            className="btn btn-xs btn-primary"
                            title="Diambil"
                          >
                            Diambil
                          </button>
                        )}
                        {t.no_hp_pelanggan && (
                          <a
                            href={`https://wa.me/${t.no_hp_pelanggan}?text=Pesanan ${encodeURIComponent(t.nama_pelanggan)} sudah selesai`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-success"
                            title="Kirim WA"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.42.01-.643.078-.223.068-.482.14-.74.37-.257.23-.46.488-.59.785-.13.296-.238.663-.277.896-.038.233-.095.475-.148.706-.05.23-.1.474-.15.71-.048.23-.088.473-.13.713-.04.23-.08.468-.12.704-.075.45-.283 1.13-.59 1.664-.288.51-.778.87-1.405 1.035-.477.12-1.013.08-1.49-.13-.625-.28-1.26-.68-1.79-1.19-.56-.54-.98-1.29-.98-1.96 0-.374.12-.71.297-.99.173-.28.42-.63.693-1.052.273-.42.612-.872.917-1.352.305-.48.662-.97.838-1.364.187-.408.266-.874.187-1.303-.079-.428-.265-.82-.448-1.14-.182-.32-.43-.593-.72-.828-.29-.235-.63-.42-.973-.57-.343-.15-.756-.23-1.163-.273-.408-.042-.816-.05-.905.042-.277.22-.52.64-.59 1.084-.13 1.06 1.062 2.27 2.387 2.997.72.4 1.737.813 2.56 1.172.56.247 1.092.448 1.52.633.425.187.82.332 1.168.432.344.1.71.15 1.042.075.333-.075.667-.15 1-.278" />
                            </svg>
                          </a>
                        )}
                      </div>
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

export default Transaksi;