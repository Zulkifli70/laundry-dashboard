import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { pelangganAPI, outletAPI } from "../services/api";
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

const emptyForm = {
  outlet_id: "",
  nama: "",
  no_hp: "",
  alamat: "",
  catatan: "",
};

const Pelanggan = () => {
  const { user, isAdmin } = useAuth();
  const [pelanggan, setPelanggan] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterLoading, setMasterLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  // Sinkron outlet karyawan begitu user tersedia
  useEffect(() => {
    if (!isAdmin && user?.outlet_id) {
      setForm((f) => ({ ...f, outlet_id: String(user.outlet_id) }));
    }
  }, [isAdmin, user]);

  // Master data: outlets hanya admin
  useEffect(() => {
    let alive = true;
    const loadMaster = async () => {
      setMasterLoading(true);
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
      } finally {
        if (alive) setMasterLoading(false);
      }
    };
    if (user !== null || !isAdmin) loadMaster();
    else if (user === null) {
      const t = setTimeout(loadMaster, 300);
      return () => {
        alive = false;
        clearTimeout(t);
      };
    }
    return () => {
      alive = false;
    };
  }, [isAdmin, user?.id]);

  const fetchPelanggan = async () => {
    try {
      const params = {};
      if (!isAdmin) {
        params.outlet_id = user?.outlet_id;
      } else if (form.outlet_id) {
        params.outlet_id = form.outlet_id;
      }
      if (search) params.search = search;
      const pRes = await pelangganAPI.getAll(params);
      setPelanggan(toArray(pRes));
    } catch (e) {
      console.error("Gagal load pelanggan:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPelanggan();
  }, [search, isAdmin, user?.outlet_id, form.outlet_id]);

  const handleForm = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

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
      nama: item.nama || "",
      no_hp: item.no_hp || "",
      alamat: item.alamat || "",
      catatan: item.catatan || "",
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
    if (!form.nama.trim()) return setFormError("Nama pelanggan wajib diisi.");
    if (!form.no_hp.trim()) return setFormError("No HP pelanggan wajib diisi.");
    setSubmitting(true);
    try {
      const payload = {
        outlet_id: isAdmin ? parseInt(form.outlet_id) : user.outlet_id,
        nama: form.nama.trim(),
        no_hp: form.no_hp.trim(),
        alamat: form.alamat.trim(),
        catatan: form.catatan.trim(),
      };
      if (editing) {
        await pelangganAPI.update(editing.id, payload);
      } else {
        await pelangganAPI.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        ...emptyForm,
        outlet_id: isAdmin ? "" : String(user?.outlet_id || ""),
      });
      fetchPelanggan();
    } catch (e) {
      setFormError(
        e.response?.data?.message || "Gagal menyimpan pelanggan. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus pelanggan ini?")) return;
    try {
      await pelangganAPI.delete(id);
      fetchPelanggan();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Gagal menghapus pelanggan");
    }
  };

  const SearchInput = ({ value, onChange, placeholder }) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-blue)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--color-card-border)")}
    />
  );

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
    multiline,
  }) => (
    multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-blue)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-card-border)")}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-blue)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-card-border)")}
      />
    )
  );

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
            Pelanggan
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Kelola data pelanggan laundry
            {!isAdmin && user?.outlet_id ? " outlet Anda" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-3.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--color-accent-blue)" }}
        >
          + Pelanggan Baru
        </button>
      </div>

      {/* Search & Filter */}
      <div className="workspace-filter rounded-2xl p-6" style={cardStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Cari Pelanggan
            </label>
            <SearchInput
              placeholder="Cari nama atau no HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Filter Outlet
              </label>
              <Select
                name="outlet_id"
                value={form.outlet_id}
                onChange={handleForm}
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
        </div>
      </div>

      {/* Modal form */}
      <Modal
        open={showForm}
        onClose={() => !submitting && setShowForm(false)}
        title={editing ? `Edit Pelanggan #${editing.id}` : "Pelanggan Baru"}
        subtitle={
          isAdmin
            ? editing
              ? "Perbarui data pelanggan."
              : "Pilih outlet dan isi data pelanggan."
            : editing
            ? "Perbarui data pelanggan outlet Anda."
            : "Pelanggan otomatis tercatat di outlet Anda."
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
            <div className="modal-field" style={{ gridColumn: "1 / -1" }}>
              <label>Nama Pelanggan *</label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleForm}
                placeholder="Nama pelanggan"
                required
              />
            </div>
            <div className="modal-field" style={{ gridColumn: "1 / -1" }}>
              <label>No HP / WA *</label>
              <input
                name="no_hp"
                value={form.no_hp}
                onChange={handleForm}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
            <div className="modal-field" style={{ gridColumn: "1 / -1" }}>
              <label>Alamat</label>
              <Input
                name="alamat"
                value={form.alamat}
                onChange={handleForm}
                placeholder="Alamat lengkap pelanggan"
                multiline
              />
            </div>
            <div className="modal-field" style={{ gridColumn: "1 / -1" }}>
              <label>Catatan</label>
              <Input
                name="catatan"
                value={form.catatan}
                onChange={handleForm}
                placeholder="Catatan tambahan (misal: preferensi setrika, dll)"
                multiline
              />
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
              {submitting ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Pelanggan"}
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
                  "Nama",
                  "No HP / WA",
                  "Alamat",
                  "Outlet",
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
              {pelanggan.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Belum ada pelanggan
                  </td>
                </tr>
              ) : (
                pelanggan.map((p) => (
                  <tr
                    key={p.id}
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
                      {p.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {p.nama}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`https://wa.me/${p.no_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#25d366", textDecoration: "none" }}
                      >
                        {p.no_hp}
                      </a>
                    </td>
                    <td
                      className="px-5 py-3.5 max-w-xs truncate"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {p.alamat || "-"}
                    </td>
                    <td
                      className="px-5 py-3.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {p.Outlet?.nama || "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          title="Edit pelanggan"
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
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="Hapus pelanggan"
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

export default Pelanggan;