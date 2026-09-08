import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { stokAPI, outletAPI } from '../services/api';

const cardStyle = { background: 'var(--color-card)', border: '1px solid var(--color-card-border)' };
const inputStyle = { background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' };
const selectStyle = { background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' };

const Stok = () => {
  const { user, isAdmin } = useAuth();
  const [stok, setStok] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAdjust, setShowAdjust] = useState(null);
  const [filters, setFilters] = useState({ outlet_id: '' });
  const [form, setForm] = useState({ outlet_id: '', nama_barang: '', satuan: '', jumlah_stok: '', batas_minimum: '' });
  const [adjustForm, setAdjustForm] = useState({ tipe_perubahan: 'masuk', jumlah_perubahan: '', catatan: '' });

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      const [sRes, oRes] = await Promise.all([stokAPI.getAll(filters), outletAPI.getAll()]);
      setStok(sRes.data); setOutlets(oRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdjust = (e) => setAdjustForm({ ...adjustForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await stokAPI.create(form); setShowForm(false); setForm({ outlet_id: '', nama_barang: '', satuan: '', jumlah_stok: '', batas_minimum: '' }); fetchData(); } catch (e) { console.error(e); }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try { await stokAPI.adjust(showAdjust.id, adjustForm); setShowAdjust(null); setAdjustForm({ tipe_perubahan: 'masuk', jumlah_perubahan: '', catatan: '' }); fetchData(); } catch (e) { console.error(e); }
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

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }}></div></div>;

  return (
    <div className="page-stack workspace-page">
      <div className="workspace-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Stok Barang</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Kelola stok per outlet</p>
        </div>
        {isAdmin && <button onClick={() => setShowForm(true)} className="px-5 py-3.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-accent-blue)' }}>+ Stok Baru</button>}
      </div>

      {isAdmin && (
        <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
          <div className="max-w-xs">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Filter Outlet</label>
            <Select name="outlet_id" value={filters.outlet_id} onChange={handleFilter}><option value="">Semua Outlet</option>{outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}</Select>
          </div>
        </div>
      )}

      {showForm && isAdmin && (
        <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Stok Baru</h3>
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
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Nama Barang</label>
              <Input name="nama_barang" value={form.nama_barang} onChange={handleForm} placeholder="Deterjen, Pewangi, dll" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Satuan</label>
              <Input name="satuan" value={form.satuan} onChange={handleForm} placeholder="liter, kg, pcs, dus" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Jumlah Stok Awal</label>
              <Input type="number" name="jumlah_stok" value={form.jumlah_stok} onChange={handleForm} placeholder="0" min="0" step="0.1" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Batas Minimum</label>
              <Input type="number" name="batas_minimum" value={form.batas_minimum} onChange={handleForm} placeholder="5" min="0" step="0.1" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--color-text-secondary)' }}>Batal</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-accent-blue)' }}>Simpan</button>
            </div>
          </form>
        </div>
      )}

      {showAdjust && isAdmin && (
        <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Adjust Stok: {showAdjust.nama_barang}</h3>
            <button onClick={() => setShowAdjust(null)} className="p-1 rounded-md" style={{ color: 'var(--color-text-muted)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg mb-4" style={{ background: 'rgba(79,140,255,0.08)' }}>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Stok saat ini</p>
              <p className="text-base font-bold" style={{ color: 'var(--color-accent-blue)' }}>{showAdjust.jumlah_stok} <span className="text-xs font-normal" style={{ color: 'var(--color-text-secondary)' }}>{showAdjust.satuan}</span></p>
            </div>
            {showAdjust.batas_minimum > 0 && <>
              <div className="w-px h-7" style={{ background: 'var(--color-divider)' }}></div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Minimum</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{showAdjust.batas_minimum} <span className="text-xs font-normal">{showAdjust.satuan}</span></p>
              </div>
            </>}
          </div>
          <form onSubmit={handleAdjustSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Tipe Perubahan</label>
              <Select name="tipe_perubahan" value={adjustForm.tipe_perubahan} onChange={handleAdjust} required>
                <option value="masuk">Masuk (Beli/Restock)</option><option value="keluar">Keluar (Pakai/Habis)</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Jumlah</label>
              <Input type="number" name="jumlah_perubahan" value={adjustForm.jumlah_perubahan} onChange={handleAdjust} placeholder="10" min="0.1" step="0.1" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Catatan</label>
              <Input name="catatan" value={adjustForm.catatan} onChange={handleAdjust} placeholder="Contoh: beli 5 dus deterjen" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
              <button type="button" onClick={() => setShowAdjust(null)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--color-text-secondary)' }}>Batal</button>
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
                {['ID', 'Outlet', 'Nama Barang', 'Satuan', 'Jumlah Stok', ...(isAdmin ? ['Aksi'] : [])].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stok.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>Belum ada data stok</td></tr>
              ) : stok.map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid var(--color-divider)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-nav-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.id}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{s.Outlet?.nama}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{s.nama_barang}</p>
                    {s.batas_minimum > 0 && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Min: {s.batas_minimum} {s.satuan}</p>}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{s.satuan}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold" style={{ color: s.batas_minimum > 0 && s.jumlah_stok <= s.batas_minimum ? 'var(--color-accent-red)' : 'var(--color-text-primary)' }}>{s.jumlah_stok}</span>
                      {s.batas_minimum > 0 && s.jumlah_stok <= s.batas_minimum && <span style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--color-accent-red)', borderRadius: 9999, padding: '1px 8px', fontSize: '10px', fontWeight: 500 }}>Habis</span>}
                    </div>
                  </td>
                  {isAdmin && <td className="px-5 py-3.5">
                    <button onClick={() => setShowAdjust(s)} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-orange)'; e.currentTarget.style.background = 'rgba(251,146,60,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stok;