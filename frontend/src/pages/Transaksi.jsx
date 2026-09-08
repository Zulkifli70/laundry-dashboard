import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transaksiAPI, layananAPI, outletAPI } from '../services/api';

const cardStyle = { background: 'var(--color-card)', border: '1px solid var(--color-card-border)' };
const inputStyle = { background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' };
const selectStyle = { background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' };

const Transaksi = () => {
  const { user, isAdmin } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [layanan, setLayanan] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ outlet_id: '', status: '', status_bayar: '', tanggal_mulai: '', tanggal_akhir: '' });
  const [form, setForm] = useState({ outlet_id: user?.outlet_id || '', layanan_id: '', nama_pelanggan: '', no_hp_pelanggan: '', jumlah_qty: '', total_harga: '' });

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      const [tRes, lRes] = await Promise.all([transaksiAPI.getAll(filters), layananAPI.getAll()]);
      setTransaksi(tRes.data);
      setLayanan(lRes.data);
      if (isAdmin) { const oRes = await outletAPI.getAll(); setOutlets(oRes.data); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const l = layanan.find((x) => x.id === parseInt(form.layanan_id));
      await transaksiAPI.create({ ...form, total_harga: l ? l.harga * parseFloat(form.jumlah_qty) : 0 });
      setShowForm(false);
      setForm({ outlet_id: user?.outlet_id || '', layanan_id: '', nama_pelanggan: '', no_hp_pelanggan: '', jumlah_qty: '', total_harga: '' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleExport = async () => {
    try {
      const res = await transaksiAPI.export(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'transaksi.csv'; a.click();
    } catch (e) { console.error(e); }
  };

  const handleStatus = async (id, status) => {
    try { await transaksiAPI.update(id, { status }); fetchData(); } catch (e) { console.error(e); }
  };

  const Select = ({ name, value, onChange, children, required }) => (
    <select name={name} value={value} onChange={onChange} required={required}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
      style={selectStyle}
      onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-blue)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--color-card-border)'}>{children}</select>
  );

  const Input = ({ type = 'text', name, value, onChange, placeholder, required, min, step }) => (
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} step={step}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
      style={inputStyle}
      onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-blue)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--color-card-border)'} />
  );

  const statusColor = (s) => {
    const map = { diterima: '#4f8cff', diproses: '#fb923c', selesai: '#34d399', diambil: '#a78bfa' };
    return map[s] || '#8492a6';
  };

  const bayarColor = (s) => s === 'lunas' ? '#34d399' : '#f87171';

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }}></div>
    </div>
  );

  return (
    <div className="page-stack workspace-page">
      {/* Header */}
      <div className="workspace-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Transaksi</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Kelola transaksi laundry</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowForm(true)} className="px-5 py-3.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-accent-blue)' }}>
            + Transaksi Baru
          </button>
          {isAdmin && (
            <button onClick={handleExport} className="px-5 py-3.5 rounded-lg text-sm font-semibold" style={{ ...cardStyle, color: 'var(--color-text-secondary)' }}>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Outlet</label>
              <Select name="outlet_id" value={filters.outlet_id} onChange={handleFilter}>
                <option value="">Semua Outlet</option>
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
              </Select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Status</label>
            <Select name="status" value={filters.status} onChange={handleFilter}>
              <option value="">Semua</option>
              <option value="diterima">Diterima</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="diambil">Diambil</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Pembayaran</label>
            <Select name="status_bayar" value={filters.status_bayar} onChange={handleFilter}>
              <option value="">Semua</option>
              <option value="belum_bayar">Belum Bayar</option>
              <option value="lunas">Lunas</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Dari</label>
            <Input type="date" name="tanggal_mulai" value={filters.tanggal_mulai} onChange={handleFilter} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Sampai</label>
            <Input type="date" name="tanggal_akhir" value={filters.tanggal_akhir} onChange={handleFilter} />
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Transaksi Baru</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-md" style={{ color: 'var(--color-text-muted)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isAdmin && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Outlet</label>
                <Select name="outlet_id" value={form.outlet_id} onChange={handleForm} required>
                  <option value="">Pilih Outlet</option>
                  {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
                </Select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Layanan</label>
              <Select name="layanan_id" value={form.layanan_id} onChange={handleForm} required>
                <option value="">Pilih Layanan</option>
                {layanan.map((l) => <option key={l.id} value={l.id}>{l.nama} - Rp {l.harga.toLocaleString()}/{l.tipe_satuan}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Nama Pelanggan</label>
              <Input name="nama_pelanggan" value={form.nama_pelanggan} onChange={handleForm} placeholder="Nama pelanggan" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>No HP</label>
              <Input name="no_hp_pelanggan" value={form.no_hp_pelanggan} onChange={handleForm} placeholder="08xxxxxxxxxx" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Jumlah (kg/item)</label>
              <Input type="number" name="jumlah_qty" value={form.jumlah_qty} onChange={handleForm} placeholder="1" min="0.1" step="0.1" required />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--color-text-secondary)' }}>Batal</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-accent-blue)' }}>Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="workspace-table rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-sidebar)' }}>
                {['ID', 'Pelanggan', 'Layanan', 'Qty', 'Total', 'Status', 'Bayar', 'Aksi'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transaksi.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>Belum ada transaksi</td></tr>
              ) : transaksi.map((t) => (
                <tr key={t.id} style={{ borderTop: '1px solid var(--color-divider)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-nav-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.nama_pelanggan}</p>
                    {t.no_hp_pelanggan && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.no_hp_pelanggan}</p>}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{t.Layanan?.nama}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{t.jumlah_qty} {t.Layanan?.tipe_satuan}</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>Rp {t.total_harga?.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span style={{ background: `${statusColor(t.status)}20`, color: statusColor(t.status), borderRadius: 9999, padding: '1.5px 8px', fontSize: '10px', fontWeight: 500 }}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span style={{ background: `${bayarColor(t.status_bayar)}20`, color: bayarColor(t.status_bayar), borderRadius: 9999, padding: '1.5px 8px', fontSize: '10px', fontWeight: 500 }}>
                      {t.status_bayar === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {t.status === 'diterima' && <button onClick={() => handleStatus(t.id, 'diproses')} className="px-2 py-1 rounded-md text-xs font-medium text-white" style={{ background: 'var(--color-accent-orange)' }}>Proses</button>}
                      {t.status === 'diproses' && <button onClick={() => handleStatus(t.id, 'selesai')} className="px-2 py-1 rounded-md text-xs font-medium text-white" style={{ background: 'var(--color-accent-green)' }}>Selesai</button>}
                      {t.status === 'selesai' && <button onClick={() => handleStatus(t.id, 'diambil')} className="px-2 py-1 rounded-md text-xs font-medium text-white" style={{ background: 'var(--color-accent-blue)' }}>Diambil</button>}
                      {t.no_hp_pelanggan && (
                        <a href={`https://wa.me/${t.no_hp_pelanggan}?text=Pesanan ${encodeURIComponent(t.nama_pelanggan)} sudah selesai`} target="_blank" rel="noopener noreferrer"
                          className="px-2 py-1 rounded-md text-xs font-medium text-white" style={{ background: '#25d366' }}>WA</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transaksi;