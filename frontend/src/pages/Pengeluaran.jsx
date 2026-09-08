import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pengeluaranAPI, outletAPI } from '../services/api';

const cardStyle = { background: 'var(--color-card)', border: '1px solid var(--color-card-border)' };
const inputStyle = { background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' };
const selectStyle = { background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' };

const Pengeluaran = () => {
  const { user } = useAuth();
  const [pengeluaran, setPengeluaran] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ outlet_id: '', kategori: '', tanggal_mulai: '', tanggal_akhir: '' });
  const [form, setForm] = useState({ outlet_id: '', kategori: '', jumlah: '', deskripsi: '', tanggal: new Date().toISOString().split('T')[0] });

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      const [pRes, oRes] = await Promise.all([pengeluaranAPI.getAll(filters), outletAPI.getAll()]);
      setPengeluaran(pRes.data); setOutlets(oRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await pengeluaranAPI.create(form); setShowForm(false); setForm({ outlet_id: '', kategori: '', jumlah: '', deskripsi: '', tanggal: new Date().toISOString().split('T')[0] }); fetchData(); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus?')) { try { await pengeluaranAPI.delete(id); fetchData(); } catch (e) { console.error(e); } }
  };

  const Select = ({ name, value, onChange, children, required }) => (
    <select name={name} value={value} onChange={onChange} required={required}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={selectStyle}
      onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-blue)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--color-card-border)'}>{children}</select>
  );

  const Input = ({ type = 'text', name, value, onChange, placeholder, required, min, step }) => (
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} step={step}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
      onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-blue)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--color-card-border)'} />
  );

  const kategoriLabels = { listrik: 'Listrik', gaji: 'Gaji', bahan_baku: 'Bahan Baku', lainnya: 'Lainnya' };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }}></div></div>;

  return (
    <div className="page-stack workspace-page">
      <div className="workspace-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Pengeluaran</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Catat pengeluaran outlet</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-5 py-3.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-accent-blue)' }}>+ Pengeluaran Baru</button>
      </div>

      <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Outlet</label>
            <Select name="outlet_id" value={filters.outlet_id} onChange={handleFilter}><option value="">Semua Outlet</option>{outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}</Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Kategori</label>
            <Select name="kategori" value={filters.kategori} onChange={handleFilter}><option value="">Semua Kategori</option><option value="listrik">Listrik</option><option value="gaji">Gaji</option><option value="bahan_baku">Bahan Baku</option><option value="lainnya">Lainnya</option></Select>
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

      {showForm && (
        <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Pengeluaran Baru</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-md" style={{ color: 'var(--color-text-muted)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Outlet</label>
              <Select name="outlet_id" value={form.outlet_id} onChange={handleForm} required><option value="">Pilih Outlet</option>{outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}</Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Kategori</label>
              <Select name="kategori" value={form.kategori} onChange={handleForm} required><option value="">Pilih Kategori</option><option value="listrik">Listrik</option><option value="gaji">Gaji</option><option value="bahan_baku">Bahan Baku</option><option value="lainnya">Lainnya</option></Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Jumlah</label>
              <Input type="number" name="jumlah" value={form.jumlah} onChange={handleForm} placeholder="100000" min="0" step="1000" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Tanggal</label>
              <Input type="date" name="tanggal" value={form.tanggal} onChange={handleForm} required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Deskripsi</label>
              <Input name="deskripsi" value={form.deskripsi} onChange={handleForm} placeholder="Catatan pengeluaran" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--color-text-secondary)' }}>Batal</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-accent-blue)' }}>Simpan</button>
            </div>
          </form>
        </div>
      )}

      <div className="workspace-table rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-sidebar)' }}>
                {['ID', 'Outlet', 'Kategori', 'Jumlah', 'Deskripsi', 'Tanggal', 'Aksi'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pengeluaran.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>Belum ada pengeluaran</td></tr>
              ) : pengeluaran.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--color-divider)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-nav-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.id}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{p.Outlet?.nama}</td>
                  <td className="px-5 py-3.5">
                    <span style={{ background: 'rgba(79,140,255,0.12)', color: 'var(--color-accent-blue)', borderRadius: 9999, padding: '1.5px 8px', fontSize: '10px', fontWeight: 500 }}>
                      {kategoriLabels[p.kategori] || p.kategori}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>Rp {p.jumlah?.toLocaleString()}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{p.deskripsi || '-'}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-muted)' }}>{p.tanggal}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-red)'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
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

export default Pengeluaran;