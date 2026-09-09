import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { transaksiAPI, layananAPI, outletAPI, pelangganAPI } from "../services/api";
import Modal from "../components/Modal";

const cardStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-card-border)",
};
const inputStyle = {
  background: "var(--color-sidebar)",
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-card-border)",
};
const selectStyle = {
  background: "var(--color-sidebar)",
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-card-border)",
};

const toArray = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const toWaNumber = (hp = "") => {
  let x = String(hp).replace(/[^0-9]/g, "");
  if (x.startsWith("0")) x = "62" + x.slice(1);
  return x;
};

const emptyForm = {
  outlet_id: "",
  layanan_id: "",
  pelanggan_id: "",
  nama_pelanggan: "",
  no_hp_pelanggan: "",
  jumlah_qty: "",
  status_bayar: "belum_bayar",
};

const Transaksi = () => {
  const { user, isAdmin } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [layanan, setLayanan] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [pelanggan, setPelanggan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterLoading, setMasterLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [filters, setFilters] = useState({
    outlet_id: "",
    status: "",
    status_bayar: "",
    tanggal_mulai: "",
    tanggal_akhir: "",
  });
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
      } catch (e) {
        console.error("Gagal load layanan:", e);
      }
      try {
        if (isAdmin) {
          const oRes = await outletAPI.getAll();
          if (alive) setOutlets(toArray(oRes));
        } else {
          if (alive) setOutlets([]);
        }
      } catch (e) {
        console.error("Gagal load outlet:", e);
        if (alive) setOutlets([]);
      }
      try {
        const pRes = await pelangganAPI.getAll({ outlet_id: isAdmin ? "" : user?.outlet_id });
        if (alive) setPelanggan(toArray(pRes));
      } catch (e) {
        console.error("Gagal load pelanggan:", e);
        if (alive) setPelanggan([]);
      } finally {
        if (alive) setMasterLoading(false);
      }
    };
    // Tunggu auth selesai (user sudah ada atau dipastikan tidak login -> ProtectedRoute handle)
    if (user !== null || !isAdmin) loadMaster();
    else if (user === null) {
      // user masih loading awal: coba juga agar admin tidak stuck, efek akan jalan lagi saat user terisi
      const t = setTimeout(loadMaster, 300);
      return () => {
        alive = false;
        clearTimeout(t);
      };
    }
    return () => {
      alive = false;
    };
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
    } catch (e) {
      console.error("Gagal load transaksi:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, [filters, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
    [layanan, form.layanan_id],
  );
  const previewTotal = useMemo(() => {
    const qty = parseFloat(form.jumlah_qty);
    if (!selectedLayanan || isNaN(qty) || qty <= 0) return 0;
    return Number(selectedLayanan.harga) * qty;
  }, [selectedLayanan, form.jumlah_qty]);

  // Auto-fill nama & no_hp when pelanggan is selected
  useEffect(() => {
    if (form.pelanggan_id) {
      const selected = pelanggan.find((p) => String(p.id) === String(form.pelanggan_id));
      if (selected) {
        setForm((f) => ({
          ...f,
          nama_pelanggan: selected.nama,
          no_hp_pelanggan: selected.no_hp,
        }));
      }
    }
  }, [form.pelanggan_id, pelanggan]);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setForm({
      ...emptyForm,
      outlet_id: isAdmin ? "" : String(user?.outlet_id || ""),
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormError("");
    setForm({
      outlet_id: String(item.outlet_id || ""),
      layanan_id: String(item.layanan_id || ""),
      pelanggan_id: item.pelanggan_id ? String(item.pelanggan_id) : "",
      nama_pelanggan: item.nama_pelanggan || "",
      no_hp_pelanggan: item.no_hp_pelanggan || "",
      jumlah_qty: String(item.jumlah_qty || ""),
      status_bayar: item.status_bayar || "belum_bayar",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (isAdmin && !form.outlet_id)
      return setFormError("Outlet wajib dipilih.");
    if (!isAdmin && !user?.outlet_id)
      return setFormError("Akun karyawan belum terhubung ke outlet.");
    if (!form.layanan_id) return setFormError("Jenis layanan wajib dipilih.");
    if (parseFloat(form.jumlah_qty) <= 0 || isNaN(parseFloat(form.jumlah_qty)))
      return setFormError("Jumlah harus lebih dari 0.");
    setSubmitting(true);
    try {
      const payload = {
        outlet_id: isAdmin ? parseInt(form.outlet_id) : user.outlet_id,
        layanan_id: parseInt(form.layanan_id),
        pelanggan_id: form.pelanggan_id ? parseInt(form.pelanggan_id) : null,
        nama_pelanggan: form.nama_pelanggan.trim(),
        no_hp_pelanggan: form.no_hp_pelanggan.trim(),
        jumlah_qty: parseFloat(form.jumlah_qty),
        total_harga: previewTotal,
        status_bayar: form.status_bayar,
      };
      if (editing) {
        await transaksiAPI.update(editing.id, payload);
      } else {
        await transaksiAPI.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        ...emptyForm,
        outlet_id: isAdmin ? "" : String(user?.outlet_id || ""),
      });
      fetchTransaksi();
    } catch (e) {
      setFormError(
        e.response?.data?.message || "Gagal menyimpan transaksi. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await transaksiAPI.export(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "transaksi.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Gagal export");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      await transaksiAPI.delete(id);
      fetchTransaksi();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Gagal menghapus transaksi");
    }
  };

  const handleStatus = async (id, patch) => {
    try {
      await transaksiAPI.update(id, patch);
      fetchTransaksi();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Gagal update status");
    }
  };

  const Select = ({ name, value, onChange, children, required, disabled }) => (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none disabled:opacity-60"
      style={selectStyle}
      onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-blue)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--color-card-border)")}
    >
      {children}
    </select>
  );

  const Input = ({
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    required,
    min,
    step,
  }) => (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      step={step}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-blue)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--color-card-border)")}
    />
  );

  const statusColor = (s) => {
    const map = {
      diterima: "#4f8cff",
      diproses: "#fb923c",
      selesai: "#34d399",
      diambil: "#a78bfa",
    };
    return map[s] || "#8492a6";
  };
  const bayarColor = (s) => (s === "lunas" ? "#34d399" : "#f87171");

  // Status flow configuration
  const STATUS_FLOW = [
    { key: "diterima", label: "Diterima", icon: "📥" },
    { key: "diproses", label: "Diproses", icon: "⚙️" },
    { key: "selesai", label: "Selesai", icon: "✅" },
    { key: "diambil", label: "Diambil", icon: "📤" },
  ];

  const getNextAction = (currentStatus, statusBayar) => {
    const currentIndex = STATUS_FLOW.findIndex((s) => s.key === currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return null;
    const next = STATUS_FLOW[currentIndex + 1];
    return { ...next, currentIndex };
  };

  const renderStatusStepper = (currentStatus) => {
    const currentIndex = STATUS_FLOW.findIndex((s) => s.key === currentStatus);
    return (
      <div className="status-stepper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {STATUS_FLOW.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;
          const color = isCompleted || isCurrent ? statusColor(step.key) : "var(--color-divider)";
          const textColor = isCompleted || isCurrent ? statusColor(step.key) : "var(--color-text-muted)";
          
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isCompleted ? 12 : 10,
                  background: isCompleted ? color : (isCurrent ? `${color}20` : "transparent"),
                  color: isCompleted ? "white" : textColor,
                  border: isCurrent && !isCompleted ? `2px solid ${color}` : "none",
                  fontWeight: isCurrent ? 700 : 500,
                  transition: "all 0.2s",
                }}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                ) : (
                  step.icon
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: isCurrent ? 600 : 400, color: textColor, whiteSpace: "nowrap" }}>
                {step.label}
              </span>
              {idx < STATUS_FLOW.length - 1 && (
                <div style={{ flex: 1, height: 2, maxWidth: 40, background: idx < currentIndex ? color : "var(--color-divider)", borderRadius: 1 }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-40">
        <div
          className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: "var(--color-accent-blue)",
            borderTopColor: "transparent",
          }}
        ></div>
      </div>
    );

  return (
    <div className="page-stack workspace-page">
      <div className="workspace-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Transaksi
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Kelola transaksi laundry
            {!isAdmin && user?.outlet_id ? " outlet Anda" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openCreate}
            className="px-5 py-3.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--color-accent-blue)" }}
          >
            + Transaksi Baru
          </button>
          {isAdmin && (
            <button
              onClick={handleExport}
              className="px-5 py-3.5 rounded-lg text-sm font-semibold"
              style={{ ...cardStyle, color: "var(--color-text-secondary)" }}
            >
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
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Outlet
              </label>
              <Select
                name="outlet_id"
                value={filters.outlet_id}
                onChange={handleFilter}
              >
                <option value="">Semua Outlet</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nama}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Status
            </label>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilter}
            >
              <option value="">Semua</option>
              <option value="diterima">Diterima</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="diambil">Diambil</option>
            </Select>
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Pembayaran
            </label>
            <Select
              name="status_bayar"
              value={filters.status_bayar}
              onChange={handleFilter}
            >
              <option value="">Semua</option>
              <option value="belum_bayar">Belum Bayar</option>
              <option value="lunas">Lunas</option>
            </Select>
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Dari
            </label>
            <Input
              type="date"
              name="tanggal_mulai"
              value={filters.tanggal_mulai}
              onChange={handleFilter}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Sampai
            </label>
            <Input
              type="date"
              name="tanggal_akhir"
              value={filters.tanggal_akhir}
              onChange={handleFilter}
            />
          </div>
        </div>
      </div>

      {/* Modal form */}
      <Modal
        open={showForm}
        onClose={() => !submitting && setShowForm(false)}
        title={editing ? `Edit Transaksi #${editing.id}` : "Transaksi Baru"}
        subtitle={
          isAdmin
            ? editing
              ? "Perbarui data transaksi."
              : "Pilih outlet, layanan, dan data pelanggan."
            : editing
              ? "Perbarui data transaksi outlet Anda."
              : "Transaksi otomatis tercatat di outlet Anda."
        }
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-grid modal-grid--2">
            {isAdmin ? (
              <div className="modal-field">
                <label>Outlet *</label>
                <select
                  name="outlet_id"
                  value={form.outlet_id}
                  onChange={handleForm}
                  required
                >
                  <option value="">
                    {masterLoading
                      ? "Memuat outlet..."
                      : outlets.length
                        ? "Pilih Outlet"
                        : "Belum ada outlet"}
                  </option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nama}
                    </option>
                  ))}
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
              <select
                name="status_bayar"
                value={form.status_bayar}
                onChange={handleForm}
                required
              >
                <option value="belum_bayar">Belum Bayar</option>
                <option value="lunas">Lunas</option>
              </select>
            </div>
<div className="modal-field" style={{ gridColumn: "1 / -1" }}>
              <label>Jenis Layanan *</label>
              <select
                name="layanan_id"
                value={form.layanan_id}
                onChange={handleForm}
                required
              >
                <option value="">
                  {masterLoading
                    ? "Memuat layanan..."
                    : layanan.length
                    ? "Pilih Layanan"
                    : "Belum ada layanan"}
                </option>
                {layanan.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama} — {rupiah(l.harga)}/{l.tipe_satuan}
                  </option>
                ))}
              </select>
              {!masterLoading && layanan.length === 0 && (
                <small style={{ color: "var(--color-text-muted)" }}>
                  Data layanan kosong. Minta admin menambahkannya dulu.
                </small>
              )}
            </div>
            <div className="modal-field" style={{ gridColumn: "1 / -1" }}>
              <label>Pelanggan (Pilih dari daftar)</label>
              <select
                name="pelanggan_id"
                value={form.pelanggan_id}
                onChange={handleForm}
              >
                <option value="">-- Pilih pelanggan (atau isi manual di bawah) --</option>
                {pelanggan.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} — {p.no_hp}
                  </option>
                ))}
              </select>
              {!masterLoading && pelanggan.length === 0 && (
                <small style={{ color: "var(--color-text-muted)" }}>
                  Belum ada pelanggan. Tambahkan di menu Pelanggan atau isi manual.
                </small>
              )}
            </div>
            <div className="modal-field">
              <label>Nama Pelanggan *</label>
              <input
                name="nama_pelanggan"
                value={form.nama_pelanggan}
                onChange={handleForm}
                placeholder="Nama pelanggan"
                required
              />
            </div>
            <div className="modal-field">
              <label>No HP / WA *</label>
              <input
                name="no_hp_pelanggan"
                value={form.no_hp_pelanggan}
                onChange={handleForm}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
            <div className="modal-field">
              <label>
                Jumlah{" "}
                {selectedLayanan
                  ? `(${selectedLayanan.tipe_satuan})`
                  : "(kg/item)"}{" "}
                *
              </label>
              <input
                type="number"
                name="jumlah_qty"
                value={form.jumlah_qty}
                onChange={handleForm}
                placeholder={
                  selectedLayanan?.tipe_satuan === "item"
                    ? "Contoh: 3"
                    : "Contoh: 2.5"
                }
                min="0.1"
                step="0.1"
                required
              />
              {selectedLayanan && (
                <small style={{ color: "var(--color-text-muted)" }}>
                  {selectedLayanan.nama} · {rupiah(selectedLayanan.harga)} per{" "}
                  {selectedLayanan.tipe_satuan}
                </small>
              )}
            </div>
            <div className="modal-field">
              <label>Estimasi Total</label>
              <div className="modal-total">
                <div>
                  <small>Total otomatis (harga × jumlah)</small>
                  <strong>{rupiah(previewTotal)}</strong>
                </div>
              </div>
            </div>
          </div>

          {formError && (
            <div className="modal-error" style={{ marginTop: 14 }}>
              {formError}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn--ghost"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn--primary"
              disabled={submitting || masterLoading}
            >
              {submitting ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Table */}
      <div
        className="workspace-table rounded-2xl overflow-hidden"
        style={cardStyle}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-sidebar)" }}>
                {[
                  "ID",
                  "Pelanggan",
                  "Layanan",
                  "Qty",
                  "Total",
                  "Status",
                  "Bayar",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transaksi.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                transaksi.map((t) => (
                  <tr
                    key={t.id}
                    style={{ borderTop: "1px solid var(--color-divider)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--color-nav-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      className="px-5 py-3.5 font-mono text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {t.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {t.nama_pelanggan}
                      </p>
                      {t.no_hp_pelanggan && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {t.no_hp_pelanggan}
                        </p>
                      )}
                    </td>
                    <td
                      className="px-5 py-3.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {t.Layanan?.nama || t.layanan?.nama || "-"}
                    </td>
                    <td
                      className="px-5 py-3.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {t.jumlah_qty} {t.Layanan?.tipe_satuan}
                    </td>
                    <td
                      className="px-5 py-3.5 font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {rupiah(t.total_harga)}
                    </td>
                    <td className="px-5 py-3.5" style={{ minWidth: 280 }}>
                      {renderStatusStepper(t.status)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        style={{
                          background: `${bayarColor(t.status_bayar)}20`,
                          color: bayarColor(t.status_bayar),
                          borderRadius: 9999,
                          padding: "1.5px 8px",
                          fontSize: "10px",
                          fontWeight: 500,
                        }}
                      >
                        {t.status_bayar === "lunas" ? "Lunas" : "Belum Bayar"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Primary Next Action Button */}
                        {getNextAction(t.status, t.status_bayar) && (
                          <button
                            onClick={() =>
                              handleStatus(t.id, { status: getNextAction(t.status, t.status_bayar).key })
                            }
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                            style={{
                              background: `linear-gradient(135deg, ${statusColor(getNextAction(t.status, t.status_bayar).key)}, ${statusColor(getNextAction(t.status, t.status_bayar).key)}dd)`,
                              boxShadow: `0 2px 8px ${statusColor(getNextAction(t.status, t.status_bayar).key)}40`,
                            }}
                            title={`Klik untuk memindahkan ke ${getNextAction(t.status, t.status_bayar).label}`}
                          >
                            {getNextAction(t.status, t.status_bayar).icon} {getNextAction(t.status, t.status_bayar).label}
                          </button>
                        )}
                        {/* Lunas button - always available if not paid */}
                        {t.status_bayar !== "lunas" && (
                          <button
                            onClick={() =>
                              handleStatus(t.id, { status_bayar: "lunas" })
                            }
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                              background: "rgba(52,211,153,.12)",
                              color: "#34d399",
                              border: "1px solid rgba(52,211,153,.3)",
                            }}
                            title="Tandai sebagai Lunas"
                          >
                            💰 Lunas
                          </button>
                        )}
                        {/* WhatsApp button */}
                        {t.no_hp_pelanggan && (
                          <a
                            href={`https://wa.me/${toWaNumber(t.no_hp_pelanggan)}?text=${encodeURIComponent(`Halo ${t.nama_pelanggan}, laundry Anda (${t.Layanan?.nama || "pesanan"}) sudah ${t.status}. Total ${rupiah(t.total_harga)}. Terima kasih!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg text-sm font-medium text-white transition-all"
                            style={{ background: "#25d366" }}
                            title="Kirim notifikasi WhatsApp"
                          >
                            💬 WA
                          </a>
                        )}
                        {/* Admin actions: Edit & Delete */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEdit(t)}
                              title="Edit transaksi"
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "var(--color-text-muted)" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--color-accent-blue)";
                                e.currentTarget.style.background = "rgba(79,140,255,0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--color-text-muted)";
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              title="Hapus transaksi"
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "var(--color-text-muted)" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--color-accent-red)";
                                e.currentTarget.style.background = "rgba(248,113,113,0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--color-text-muted)";
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
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
