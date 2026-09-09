import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { stokAPI, outletAPI } from '../services/api';
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

const SATUAN_OPTIONS = ['pcs', 'kg', 'liter', 'dus', 'pack', 'botol', 'karung', 'roll'];
const emptyForm = { outlet_id: '', nama_barang: '', satuan: 'pcs', satuan_custom: '', jumlah_stok: '', batas_minimum: '' };

const Stok = () => {
  const { isAdmin } = useAuth();
  const [stok, setStok] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAdjust, setShowAdjust] = useState(null);
  const [showLog, setShowLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [adjustError, setAdjustError] = useState('');
  const [filters, setFilters] = useState({ outlet_id: '' });
  const [form, setForm] = useState(emptyForm);
  const [adjustForm, setAdjustForm] = useState({ tipe_perubahan: 'masuk', jumlah_perubahan: '', catatan: '' });

  // Master outlet hanya untuk admin, sekali saja (tidak ikut filter)
  useEffect(() => {
    let alive = true;
    const loadOutlets = async () => {
      if (!isAdmin) { setOutlets([]); return; }
      try {
        const oRes = await outletAPI.getAll();
        if (alive) setOutlets(toArray(oRes));
      } catch (e) { console.error('Gagal load outlet:', e); if (alive) setOutlets([]); }
    };
    loadOutlets();
    return () => { alive = false; };
  }, [isAdmin]);

  const fetchStok = async () => {
    try {
      const params = {};
      if (isAdmin && filters.outlet_id) params.outlet_id = filters.outlet_id;
      const sRes = await stokAPI.getAll(params);
      setStok(toArray(sRes));
    } catch (e) { console.error('Gagal load stok:', e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStok(); }, [filters, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdjust = (e) => setAdjustForm({ ...adjustForm, [e.target.name]: e.target.value });

  const openCreate = () => {
    setFormError('');
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.outlet_id) return setFormError('Outlet wajib dipilih.');
    if (!form.nama_barang.trim()) return setFormError('Nama barang wajib diisi.');
    const satuanFinal = form.satuan === 'custom' ? form.satuan_custom.trim() : form.satuan;
    if (!satuanFinal) return setFormError('Satuan wajib diisi.');
    if (isNaN(parseFloat(form.jumlah_stok)) || parseFloat(form.jumlah_stok) < 0) return setFormError('Jumlah stok awal tidak valid.');
    setSubmitting(true);
    try {
      await stokAPI.create({
        outlet_id: parseInt(form.outlet_id),
        nama_barang: form.nama_barang.trim(),
        satuan: satuanFinal,
        jumlah_stok: parseFloat(form.jumlah_stok),
        batas_minimum: form.batas_minimum === '' ? 0 : parseFloat(form.batas_minimum),
      });
      setShowForm(false);
      setForm(emptyForm);
      fetchStok();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Gagal menyimpan stok.');
    } finally { setSubmitting(false); }
  };

  const openAdjust = (item) => {
    setAdjustError('');
    setAdjustForm({ tipe_perubahan: 'masuk', jumlah_perubahan: '', catatan: '' });
    setShowAdjust(item);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustError('');
    if (isNaN(parseFloat(adjustForm.jumlah_perubahan)) || parseFloat(adjustForm.jumlah_perubahan) <= 0) {
      return setAdjustError('Jumlah perubahan harus lebih dari 0.');
    }
    setSubmitting(true);
    try {
      await stokAPI.adjust(showAdjust.id, {
        ...adjustForm,
        jumlah_perubahan: parseFloat(adjustForm.jumlah_perubahan),
      });
      setShowAdjust(null);
      setAdjustForm({ tipe_perubahan: 'masuk', jumlah_perubahan: '', catatan: '' });
      fetchStok();
    } catch (e) {
      setAdjustError(e.response?.data?.message || 'Gagal update stok.');
    } finally { setSubmitting(false); }
  };

  const openLog = async (item) => {
    setShowLog(item);
    setLogs([]);
    setLogLoading(true);
    try {
      const res = await stokAPI.getLog(item.id);
      setLogs(toArray(res));
    } catch (e) { console.error('Gagal load log:', e); } finally { setLogLoading(false); }
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
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {isAdmin ? 'Kelola stok per outlet + riwayat perubahan' : 'Lihat stok outlet Anda (read-only)'}
          </p>
        </div>
        {isAdmin && <button onClick={openCreate} className="px-5 py-3.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-accent-blue)' }}>+ Stok Baru</button>}
      </div>

      {isAdmin && (
        <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
          <div className="max-w-xs">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Filter Outlet</label>
            <Select name="outlet_id" value={filters.outlet_id} onChange={handleFilter}>
              <option value="">Semua Outlet</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
            </Select>
          </div>
        </div>
      )}

      {/* Modal tambah stok */}
      <Modal open={showForm && isAdmin} onClose={() => (!submitting && setShowForm(false))}
        title="Tambah Stok Baru" subtitle="Daarkan barang baru ke outlet tertentu." maxWidth="600px">
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
              <label>Nama Barang *</label>
              <input name="nama_barang" value={form.nama_barang} onChange={handleForm} placeholder="Deterjen, Pewangi, Plastik..." required />
            </div>
            <div className="modal-field">
              <label>Satuan *</label>
              <select name="satuan" value={form.satuan} onChange={handleForm} required>
                {SATUAN_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="custom">Lainnya (tulis manual)...</option>
              </select>
            </div>
            {form.satuan === 'custom' && (
              <div className="modal-field">
                <label>Satuan Manual *</label>
                <input name="satuan_custom" value={form.satuan_custom} onChange={handleForm} placeholder="Contoh: sachet, galon..." required />
              </div>
            )}
            <div className="modal-field">
              <label>Jumlah Stok Awal *</label>
              <input type="number" name="jumlah_stok" value={form.jumlah_stok} onChange={handleForm} placeholder="0" min="0" step="0.1" required />
            </div>
            <div className="modal-field">
              <label>Batas Minimum (alert menipis)</label>
              <input type="number" name="batas_minimum" value={form.batas_minimum} onChange={handleForm} placeholder="Contoh: 5" min="0" step="0.1" />
            </div>
          </div>
          {formError && <div className="modal-error" style={{ marginTop: 14 }}>{formError}</div>}
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--ghost" onClick={() => setShowForm(false)} disabled={submitting}>Batal</button>
            <button type="submit" className="modal-btn modal-btn--primary" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal adjust stok */}
      <Modal open={!!showAdjust && isAdmin} onClose={() => (!submitting && setShowAdjust(null))}
        title={`Adjust Stok: ${showAdjust?.nama_barang || ''}`}
        subtitle="Stok masuk (restock) atau keluar (pemakaian). Tercatat di riwayat.">
        <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg mb-4" style={{ background: 'rgba(79,140,255,0.08)' }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Stok saat ini</p>
            <p className="text-base font-bold" style={{ color: 'var(--color-accent-blue)' }}>{showAdjust?.jumlah_stok} <span className="text-xs font-normal" style={{ color: 'var(--color-text-secondary)' }}>{showAdjust?.satuan}</span></p>
          </div>
          {showAdjust?.batas_minimum > 0 && <>
            <div className="w-px h-7" style={{ background: 'var(--color-divider)' }}></div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Minimum</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{showAdjust?.batas_minimum} <span className="text-xs font-normal">{showAdjust?.satuan}</span></p>
            </div>
          </>}
        </div>
        <form onSubmit={handleAdjustSubmit}>
          <div className="modal-grid modal-grid--2">
            <div className="modal-field">
              <label>Tipe Perubahan *</label>
              <select name="tipe_perubahan" value={adjustForm.tipe_perubahan} onChange={handleAdjust} required>
                <option value="masuk">Masuk (Beli/Restock)</option>
                <option value="keluar">Keluar (Pakai/Habis)</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Jumlah *</label>
              <input type="number" name="jumlah_perubahan" value={adjustForm.jumlah_perubahan} onChange={handleAdjust} placeholder="10" min="0.1" step="0.1" required />
            </div>
            <div className="modal-field" style={{ gridColumn: '1 / -1' }}>
              <label>Catatan</label>
              <input name="catatan" value={adjustForm.catatan} onChange={handleAdjust} placeholder="Contoh: beli 5 dus deterjen" />
            </div>
          </div>
          {adjustError && <div className="modal-error" style={{ marginTop: 14 }}>{adjustError}</div>}
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--ghost" onClick={() => setShowAdjust(null)} disabled={submitting}>Batal</button>
            <button type="submit" className="modal-btn modal-btn--primary" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal riwayat */}
      <Modal open={!!showLog} onClose={() => setShowLog(null)}
        title={`Riwayat: ${showLog?.nama_barang || ''}`} subtitle="Audit trail perubahan stok." maxWidth="600px">
        {logLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }}></div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>Belum ada riwayat perubahan.</p>
        ) : (
          <div className="flex flex-col gap-2" style={{ maxHeight: 380, overflowY: 'auto' }}>
            {logs.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--color-sidebar)', border: '1px solid var(--color-card-border)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: l.tipe_perubahan === 'masuk' ? '#34d399' : '#fb923c' }}>
                    {l.tipe_perubahan === 'masuk' ? '+' : '-'}{l.jumlah_perubahan} {showLog?.satuan}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{l.catatan || '-'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {l.User?.nama || `User #${l.user_id}`} · {l.created_at ? new Date(l.created_at).toLocaleString('id-ID') : ''}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-md" style={{
                  background: l.tipe_perubahan === 'masuk' ? 'rgba(52,211,153,.12)' : 'rgba(251,146,60,.12)',
                  color: l.tipe_perubahan === 'masuk' ? '#34d399' : '#fb923c',
                }}>{l.tipe_perubahan}</span>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn--ghost" onClick={() => setShowLog(null)}>Tutup</button>
        </div>
      </Modal>

      <div className="workspace-table rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-sidebar)' }}>
                {['ID', 'Outlet', 'Nama Barang', 'Satuan', 'Jumlah Stok', 'Aksi'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stok.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>Belum ada data stok</td></tr>
              ) : stok.map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid var(--color-divider)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-nav-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.id}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{s.Outlet?.nama || '-'}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{s.nama_barang}</p>
                    {s.batas_minimum > 0 && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Min: {s.batas_minimum} {s.satuan}</p>}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{s.satuan}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold" style={{ color: s.batas_minimum > 0 && Number(s.jumlah_stok) <= Number(s.batas_minimum) ? 'var(--color-accent-red)' : 'var(--color-text-primary)' }}>{s.jumlah_stok}</span>
                      {s.batas_minimum > 0 && Number(s.jumlah_stok) <= Number(s.batas_minimum) && <span style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--color-accent-red)', borderRadius: 9999, padding: '1px 8px', fontSize: '10px', fontWeight: 500 }}>Menipis</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <button onClick={() => openAdjust(s)} title="Adjust stok" className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-orange)'; e.currentTarget.style.background = 'rgba(251,146,60,0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                      )}
                      {(isAdmin) && (
                        <button onClick={() => openLog(s)} title="Lihat riwayat" className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-blue)'; e.currentTarget.style.background = 'rgba(79,140,255,0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                      )}
                      {!isAdmin && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Read-only</span>}
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

export default Stok;
