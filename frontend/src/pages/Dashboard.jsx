import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ArrowIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>;
const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>;
const ClipboardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a3 3 0 0 0 6 0M9 5a3 3 0 0 1 6 0" /></svg>;
const WalletIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" /><path strokeLinecap="round" d="M16 14h.01" /></svg>;
const BoxIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m21 8-9 5-9-5 9-5 9 5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 8v8l9 5 9-5V8M12 13v8" /></svg>;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const actions = [
    { title: 'Transaksi', description: 'Buat pesanan baru dan kelola status laundry pelanggan.', path: '/transaksi', tone: 'blue', icon: <ClipboardIcon /> },
    ...(isAdmin ? [
      { title: 'Pengeluaran', description: 'Catat biaya operasional dan pantau pengeluaran outlet.', path: '/pengeluaran', tone: 'orange', icon: <WalletIcon /> },
      { title: 'Stok Barang', description: 'Lihat ketersediaan dan perbarui persediaan barang.', path: '/stok', tone: 'purple', icon: <BoxIcon /> },
    ] : []),
  ];
  const metrics = [
    { label: 'Total Outlet', value: '2', detail: 'Outlet terhubung', tone: 'blue' },
    { label: 'Karyawan Aktif', value: '2', detail: 'Siap melayani hari ini', tone: 'green' },
    { label: 'Layanan Tersedia', value: '5', detail: 'Jenis layanan aktif', tone: 'purple' },
  ];

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Selamat datang, {user?.nama}</h1>
          <p className="hero-description">{isAdmin ? 'Pantau aktivitas dan operasional seluruh outlet dalam satu tempat.' : 'Kelola transaksi laundry dengan lebih cepat dan terorganisir.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={() => navigate('/transaksi')}><PlusIcon /> Buat transaksi</button>
      </header>

      <section className="dashboard-section" aria-labelledby="quick-actions-title">
        <div className="section-heading"><div><p className="eyebrow">Operasional</p><h2 id="quick-actions-title">Akses cepat</h2><p>Pilih tugas yang ingin Anda kerjakan sekarang.</p></div></div>
        <div className="quick-actions-grid">
          {actions.map((action) => <button className={`quick-card quick-card--${action.tone}`} type="button" key={action.path} onClick={() => navigate(action.path)}>
            <span className="quick-card-icon">{action.icon}</span>
            <span className="quick-card-content"><span className="quick-card-title">{action.title}</span><span className="quick-card-description">{action.description}</span></span>
            <span className="quick-card-arrow"><ArrowIcon /></span>
          </button>)}
        </div>
      </section>

      {isAdmin && <section className="metrics-panel" aria-labelledby="metrics-title">
        <div className="section-heading section-heading--row"><div><p className="eyebrow">Ringkasan</p><h2 id="metrics-title">Operasional hari ini</h2></div><span className="status-pill"><i /> Sistem aktif</span></div>
        <div className="metrics-grid">{metrics.map((metric) => <div className="metric" key={metric.label}><span className={`metric-value metric-value--${metric.tone}`}>{metric.value}</span><div><p className="metric-label">{metric.label}</p><p className="metric-detail">{metric.detail}</p></div></div>)}</div>
      </section>}

      <section className="dashboard-bottom-grid">
        <div className="next-step-panel"><div className="next-step-icon"><PlusIcon /></div><div><p className="eyebrow">Mulai sekarang</p><h2>Siap menerima pesanan baru?</h2><p>Buat transaksi untuk mencatat layanan, pembayaran, dan status pengerjaan pelanggan.</p></div><button type="button" onClick={() => navigate('/transaksi')}>Mulai transaksi <ArrowIcon /></button></div>
        <div className="system-panel"><p className="eyebrow">Status sistem</p><div><span className="system-dot" /><div><h2>Semua sistem normal</h2><p>Data outlet siap dikelola.</p></div></div></div>
      </section>
    </div>
  );
};

export default Dashboard;