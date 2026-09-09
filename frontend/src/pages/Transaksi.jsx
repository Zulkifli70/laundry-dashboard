import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { transaksiAPI, layananAPI, outletAPI } from '../services/api';
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
const toWaNumber = (hp = '') => {
  let x = String(hp).replace(/[^0-9]/g, '');
  if (x.startsWith('0')) x = '62' + x.slice(1);
  return x;
};

const emptyForm = { outlet_id: '', layanan_id: '', nama_pelanggan: '', no_hp_pelanggan: '', jumlah_qty: '', status_bayar: 'belum_bayar' };

const Transaksi = () => {
  const { user, isAdmin } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [layanan, setLayanan] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterLoading, setMasterLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [filters, setFilters] = useState({ outlet_id: '', status: '', status_bayar: '', tanggal_mulai: '', tanggal_akhir: '' });
  const [form, setForm] = useState(emptyForm);

  // Sinkron outlet karyawan begitu user tersedia
  useEffect(() => {
    if (!isAdmin && user?.outlet_id) {
      setForm((f) => ({ ...f, outlet_id: String(user.outlet_id) }));
    }
  }, [isAdmin, user]);

  // Master data: layanan selalu, outlets hanya admin. Dipisah dari filter agar tidak kosong saat isAdmin telat ready.
  useEffect(() => {
    let alive = true;
    const loadMaster = async () => {
      setMasterLoading(true);
      try {
        const lRes = await layananAPI.getAll();
        if (alive) setLayanan(toArray(lRes));
      } catch (e) { console.error('Gagal load layanan:', e); }
      try {
        if (isAdmin) {
          const oRes = await outletAPI.getAll();
          if (alive) setOutlets(toArray(oRes));
        } else {
          if (alive) setOutlets([]);
        }
      } catch (e) { console.error('Gagal load outlet:', e); if (alive) setOutlets([]); }
      finally { if (alive) setMasterLoading(false); }
    };
    // Tunggu auth selesai (user sudah ada atau dipastikan tidak login -> ProtectedRoute handle)
    if (user !== null || !isAdmin) loadMaster();
    else if (user === null) {
      // user masih loading awal: coba juga agar admin tidak stuck, efek akan jalan lagi saat user terisi
      const t = setTimeout(loadMaster, 300);
      return () => { alive = false; clearTimeout(t); };
    }
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user?.id]);

  const fetchTransaksi = async () => {
    try {
      const params = { ...filters };
      // Karyawan: jangan kirim outlet_id (backend filter otomatis dari token)
      if (!isAdmin) delete params.outlet_id;
      else if (!params.outlet_id) delete params.outlet_id;
      if (!params.status) delete params.status;
      if (!params.status_bayar) delete params.status_bayar;
      if (!params.tanggal_mulai) delete params.tanggal_mulai;
      if (!params.tanggal_akhir) delete params.tanggal_akhir;
      const tRes = await transaksiAPI.getAll(params);
      setTransaksi(toArray(tRes));
    } catch (e) { console.error('Gagal load transaksi:', e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTransaksi(); }, [filters, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleForm = (e) => {
    const { name, value } = e.target;
    setForm((f) => {
      const next = { ...f, [name]: value };
      // Ganti satuan hint otomatis saat layanan berubah: reset qty tidak perlu, cukup biarkan
      return next;
    });
  };

  const selectedLayanan = useMemo(
    () => layanan.find((x) => String(x.id) === String(form.layanan_id)),
    [layanan, form.layanan_id]
  );
  const previewTotal = useMemo(() => {
    const qty = parseFloat(form.jumlah_qty);
    if (!selectedLayanan || isNaN(qty) || qty <= 0) return 0;
    return Number(selectedLayanan.harga) * qty;
  }, [selectedLayanan, form.jumlah_qty]);

  const openCreate = () => {
    setFormError('');
    setForm({
      ...emptyForm,
      outlet_id: isAdmin ? '' : String(user?.outlet_id || ''),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (isAdmin && !form.outlet_id) return setFormError('Outlet wajib dipilih.');
    if (!isAdmin && !user?.outlet_id) return setFormError('Akun karyawan belum terhubung ke outlet.');
    if (!form.layanan_id) return setFormError('Jenis layanan wajib dipilih.');
    if (parseFloat(form.jumlah_qty) <= 0 || isNaN(parseFloat(form.jumlah_qty))) return setFormError('Jumlah harus lebih dari 0.');
    setSubmitting(true);
    try {
      const payload = {
        outlet_id: isAdmin ? parseInt(form.outlet_id) : user.outlet_id,
        layanan_id: parseInt(form.layanan_id),
        nama_pelanggan: form.nama_pelanggan.trim(),
        no_hp_pelanggan: form.no_hp_pelanggan.trim(),
        jumlah_qty: parseFloat(form.jumlah_qty),
        total_harga: previewTotal,
        status_bayar: form.status_bayar,
      };
      await transaksiAPI.create(payload);
      setShowForm(false);
      setForm({ ...emptyForm, outlet_id: isAdmin ? '' : String(user?.outlet_id || '') });
      fetchTransaksi();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Gagal menyimpan transaksi. Coba lagi.');
    } finally { setSubmitting(false); }
  };

  const handleExport = async () => {
    try {
      const res = await transaksiAPI.export(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'transaksi.csv'; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { console.error(e); alert(e.response?.data?.message || 'Gagal export'); }
  };

  const handleStatus = async (id, patch) => {
    try { await transaksiAPI.update(id, patch); fetchTransaksi(); } catch (e) { console.error(e); alert(e.response?.data?.message || 'Gagal update status'); }
  };

  const Select = ({ name, value, onChange, children, required, disabled }) => (
    <select name={name} value={value} onChange={onChange} required={required} disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none disabled:opacity-60"
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
      <div className="workspace-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Transaksi</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Kelola transaksi laundry{!isAdmin && user?.outlet_id ? ' outlet Anda' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openCreate} className="px-5 py-3.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-accent-blue)' }}>
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

      {/* Modal form */}
      <Modal
        open={showForm}
        onClose={() => (!submitting && setShowForm(false))}
        title="Transaksi Baru"
        subtitle={isAdmin ? 'Pilih outlet, layanan, dan data pelanggan.' : 'Transaksi otomatis tercatat di outlet Anda.'}
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-grid modal-grid--2">
            {isAdmin ? (
              <div className="modal-field">
                <label>Outlet *</label>
                <select name="outlet_id" value={form.outlet_id} onChange={handleForm} required>
                  <option value="">{masterLoading ? 'Memuat outlet...' : outlets.length ? 'Pilih Outlet' : 'Belum ada outlet'}</option>
                  {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
                </select>
              </div>
            ) : (
              <div className="modal-field">
                <label>Outlet</label>
                <input value="Outlet saya (otomatis)" disabled />
              </div>
            )}
            <div className="modal-field">
              <label>Status Bayar *</label>
              <select name="status_bayar" value={form.status_bayar} onChange={handleForm} required>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="lunas">Lunas</option>
              </select>
            </div>
            <div className="modal-field" style={{ gridColumn: '1 / -1' }}>
              <label>Jenis Layanan *</label>
              <select name="layanan_id" value={form.layanan_id} onChange={handleForm} required>
                <option value="">{masterLoading ? 'Memuat layanan...' : layanan.length ? 'Pilih Layanan' : 'Belum ada layanan'}</option>
                {layanan.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama} — {rupiah(l.harga)}/{l.tipe_satuan}
                  </option>
                ))}
              </select>
              {!masterLoading && layanan.length === 0 && (
                <small style={{ color: 'var(--color-text-muted)' }}>Data layanan kosong. Minta admin menambahkannya dulu.</small>
              )}
            </div>
            <div className="modal-field">
              <label>Nama Pelanggan *</label>
              <input name="nama_pelanggan" value={form.nama_pelanggan} onChange={handleForm} placeholder="Nama pelanggan" required />
            </div>
            <div className="modal-field">
              <label>No HP / WA *</label>
              <input name="no_hp_pelanggan" value={form.no_hp_pelanggan} onChange={handleForm} placeholder="08xxxxxxxxxx" required />
            </div>
            <div className="modal-field">
              <label>Jumlah {selectedLayanan ? `(${selectedLayanan.tipe_satuan})` : '(kg/item)'} *</label>
              <input type="number" name="jumlah_qty" value={form.jumlah_qty} onChange={handleForm} placeholder={selectedLayanan?.tipe_satuan === 'item' ? 'Contoh: 3' : 'Contoh: 2.5'} min="0.1" step="0.1" required />
              {selectedLayanan && (
                <small style={{ color: 'var(--color-text-muted)' }}>
                  {selectedLayanan.nama} · {rupiah(selectedLayanan.harga)} per {selectedLayanan.tipe_satuan}
                </small>
              )}
            </div>
            <div className="modal-field">
              <label>Estimasi Total</label>
              <div className="modal-total">
                <div><small>Total otomatis (harga × jumlah)</small><strong>{rupiah(previewTotal)}</strong></div>
              </div>
            </div>
          </div>

          {formError && <div className="modal-error" style={{ marginTop: 14 }}>{formError}</div>}

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--ghost" onClick={() => setShowForm(false)} disabled={submitting}>Batal</button>
            <button type="submit" className="modal-btn modal-btn--primary" disabled={submitting || masterLoading}>
              {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </Modal>

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
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{t.Layanan?.nama || t.layanan?.nama || '-'}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{t.jumlah_qty} {t.Layanan?.tipe_satuan}</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>{rupiah(t.total_harga)}</td>
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
                    <div className="flex items-center gap-1 flex-wrap">
                      {t.status === 'diterima' && <button onClick={() => handleStatus(t.id, { status: 'diproses' })} className="px-2 py-1 rounded-md text-xs font-medium text-white" style={{ background: 'var(--color-accent-orange)' }}>Proses</button>}
                      {t.status === 'diproses' && <button onClick={() => handleStatus(t.id, { status: 'selesai' })} className="px-2 py-1 rounded-md text-xs font-medium text-white" style={{ background: 'var(--color-accent-green)' }}>Selesai</button>}
                      {t.status === 'selesai' && <button onClick={() => handleStatus(t.id, { status: 'diambil' })} className="px-2 py-1 rounded-md text-xs font-medium text-white" style={{ background: 'var(--color-accent-blue)' }}>Diambil</button>}
                      {t.status_bayar !== 'lunas' && (
                        <button onClick={() => handleStatus(t.id, { status_bayar: 'lunas' })} className="px-2 py-1 rounded-md text-xs font-medium" style={{ background: 'rgba(52,211,153,.15)', color: '#34d399' }}>Lunas</button>
                      )}
                      {t.no_hp_pelanggan && (
                        <a href={`https://wa.me/${toWaNumber(t.no_hp_pelanggan)}?text=${encodeURIComponent(`Halo ${t.nama_pelanggan}, laundry Anda (${t.Layanan?.nama || 'pesanan'}) sudah ${t.status}. Total ${rupiah(t.total_harga)}. Terima kasih!`)}`} target="_blank" rel="noopener noreferrer"
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
