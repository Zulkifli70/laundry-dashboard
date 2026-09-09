import { useState, useEffect, useMemo } from 'react';
import { pengeluaranAPI, outletAPI } from '../services/api';
import Modal from '../components/Modal';

const cardStyle = { background: 'var(--color-card)', border: '1px solid var(--color-card-border)' };
const inputStyle = { background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' };
const selectStyle = { background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' };

const toArray = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
const todayStr = () => new Date().toISOString().split('T')[0];

const KATEGORI_OPTIONS = [
  { value: 'listrik', label: 'Listrik' },
  { value: 'air', label: 'Air / PDAM' },
  { value: 'gaji', label: 'Gaji' },
  { value: 'sewa', label: 'Sewa Tempat' },
  { value: 'bahan_baku', label: 'Bahan Baku' },
  { value: 'perawatan', label: 'Perawatan Mesin' },
  { value: 'transport', label: 'Transport / Antar' },
  { value: 'lainnya', label: 'Lainnya' },
];
const kategoriLabel = (v) => KATEGORI_OPTIONS.find((k) => k.value === v)?.label || v || '-';
const emptyForm = { outlet_id: '', kategori: '', jumlah: '', deskripsi: '', tanggal: todayStr() };

const Pengeluaran = () => {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [filters, setFilters] = useState({ outlet_id: '', kategori: '', tanggal_mulai: '', tanggal_akhir: '' });
  const [form, setForm] = useState(emptyForm);

  // Outlet master sekali saja, terpisah dari filter
  useEffect(() => {
    let alive = true;
    outletAPI.getAll()
      .then((oRes) => { if (alive) setOutlets(toArray(oRes)); })
      .catch((e) => { console.error('Gagal load outlet:', e); if (alive) setOutlets([]); });
    return () => { alive = false; };
  }, []);

  const fetchData = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const pRes = await pengeluaranAPI.getAll(params);
      setPengeluaran(toArray(pRes));
    } catch (e) { console.error('Gagal load pengeluaran:', e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalFiltered = useMemo(
    () => pengeluaran.reduce((sum, p) => sum + Number(p.jumlah || 0), 0),
    [pengeluaran]
  );

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditing(null);
    setFormError('');
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormError('');
    setForm({
      outlet_id: String(item.outlet_id || item.Outlet?.id || ''),
      kategori: item.kategori || '',
      jumlah: String(item.jumlah || ''),
      deskripsi: item.deskripsi || '',
      tanggal: item.tanggal ? String(item.tanggal).split('T')[0] : todayStr(),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.outlet_id) return setFormError('Outlet wajib dipilih.');
    if (!form.kategori) return setFormError('Kategori wajib dipilih.');
    if (isNaN(parseFloat(form.jumlah)) || parseFloat(form.jumlah) <= 0) return setFormError('Jumlah harus lebih dari 0.');
    if (!form.tanggal) return setFormError('Tanggal wajib diisi.');
    setSubmitting(true);
    try {
      const payload = {
        outlet_id: parseInt(form.outlet_id),
        kategori: form.kategori,
        jumlah: parseFloat(form.jumlah),
        deskripsi: form.deskripsi.trim(),
        tanggal: form.tanggal,
      };
      if (editing) await pengeluaranAPI.update(editing.id, payload);
      else await pengeluaranAPI.create(payload);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan pengeluaran.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pengeluaran ini?')) return;
    try { await pengeluaranAPI.delete(id); fetchData(); } catch (e) { console.error(e); alert(e.response?.data?.message || 'Gagal menghapus'); }
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
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Pengeluaran</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Catat pengeluaran outlet · Total tampil: <strong style={{ color: 'var(--color-text-primary)' }}>{rupiah(totalFiltered)}</strong>
          </p>
        </div>
        <button onClick={openCreate} className="px-5 py-3.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-accent-blue)' }}>+ Pengeluaran Baru</button>
      </div>

      <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Outlet</label>
            <Select name="outlet_id" value={filters.outlet_id} onChange={handleFilter}>
              <option value="">Semua Outlet</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Kategori</label>
            <Select name="kategori" value={filters.kategori} onChange={handleFilter}>
              <option value="">Semua Kategori</option>
              {KATEGORI_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
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

      <Modal
        open={showForm}
        onClose={() => (!submitting && (setShowForm(false), setEditing(null)))}
        title={editing ? `Edit Pengeluaran #${editing.id}` : 'Pengeluaran Baru'}
        subtitle="Lengkapi outlet, kategori, nominal, dan tanggal."
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-grid modal-grid--2">
            <div className="modal-field">
              <label>Outlet *</label>
              <select name="outlet_id" value={form.outlet_id} onChange={handleForm} required>
                <option value="">{outlets.length ? 'Pilih Outlet' : 'Belum ada outlet'}</option>
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Kategori *</label>
              <select name="kategori" value={form.kategori} onChange={handleForm} required>
                <option value="">Pilih Kategori</option>
                {KATEGORI_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Jumlah (Rp) *</label>
              <input type="number" name="jumlah" value={form.jumlah} onChange={handleForm} placeholder="100000" min="0" step="1000" required />
              {form.jumlah && <small style={{ color: 'var(--color-text-muted)' }}>= {rupiah(form.jumlah)}</small>}
            </div>
            <div className="modal-field">
              <label>Tanggal *</label>
              <input type="date" name="tanggal" value={form.tanggal} onChange={handleForm} required />
            </div>
            <div className="modal-field" style={{ gridColumn: '1 / -1' }}>
              <label>Deskripsi / Catatan</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleForm} placeholder="Contoh: bayar listrik bulan Juni outlet pusat" rows={3} />
            </div>
          </div>
          {formError && <div className="modal-error" style={{ marginTop: 14 }}>{formError}</div>}
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--ghost" disabled={submitting}
              onClick={() => { setShowForm(false); setEditing(null); }}>Batal</button>
            <button type="submit" className="modal-btn modal-btn--primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

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
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{p.Outlet?.nama || '-'}</td>
                  <td className="px-5 py-3.5">
                    <span style={{ background: 'rgba(79,140,255,0.12)', color: 'var(--color-accent-blue)', borderRadius: 9999, padding: '1.5px 8px', fontSize: '10px', fontWeight: 500 }}>
                      {kategoriLabel(p.kategori)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>{rupiah(p.jumlah)}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)', maxWidth: 260 }}>{p.deskripsi || '-'}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-muted)' }}>{String(p.tanggal || '').split('T')[0]}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} title="Edit" className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-blue)'; e.currentTarget.style.background = 'rgba(79,140,255,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} title="Hapus" className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-red)'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
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

export default Pengeluaran;
