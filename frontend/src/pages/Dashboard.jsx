import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Transaksi',
      desc: 'Kelola transaksi laundry',
      icon: '📋',
      color: 'bg-primary/10 text-primary',
      path: '/transaksi',
    },
    ...(user?.role === 'admin' ? [
      {
        title: 'Pengeluaran',
        desc: 'Catat pengeluaran outlet',
        icon: '💸',
        color: 'bg-secondary/10 text-secondary',
        path: '/pengeluaran',
      },
      {
        title: 'Stok',
        desc: 'Kelola stok barang',
        icon: '📦',
        color: 'bg-accent/10 text-accent',
        path: '/stok',
      },
    ] : []),
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
            Selamat Datang, {user?.nama}
          </h1>
          <p className="text-base-content/60 mt-1">Pilih menu untuk memulai</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.path}
            onClick={() => navigate(card.path)}
            className="card bg-base-100 shadow-sm hover:shadow-lg transition-shadow cursor-pointer border border-base-200"
          >
            <div className="card-body text-center py-8">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${card.color} mb-4`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <h3 className="card-title text-base-content">{card.title}</h3>
              <p className="text-sm text-base-content/60">{card.desc}</p>
              <div className="mt-4 flex justify-center">
                <span className="btn btn-ghost btn-sm btn-circle">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats for admin */}
      {user?.role === 'admin' && (
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content">Ringkasan Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title text-base-content/60">Total Outlet</div>
                  <div className="stat-value text-2xl font-bold text-base-content">2</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title text-base-content/60">Karyawan Aktif</div>
                  <div className="stat-value text-2xl font-bold text-base-content">2</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title text-base-content/60">Jenis Layanan</div>
                  <div className="stat-value text-2xl font-bold text-base-content">5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;