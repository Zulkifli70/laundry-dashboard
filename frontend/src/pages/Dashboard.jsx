import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Laundry Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>{user?.nama} ({user?.role})</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Selamat Datang, {user?.nama}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Transaksi</h3>
            <p className="text-gray-600">Kelola transaksi laundry</p>
            <button
              onClick={() => navigate('/transaksi')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Lihat
            </button>
          </div>
          {user?.role === 'admin' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Pengeluaran</h3>
                <p className="text-gray-600">Catat pengeluaran</p>
                <button
                  onClick={() => navigate('/pengeluaran')}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                >
                  Lihat
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Stok</h3>
                <p className="text-gray-600">Kelola stok barang</p>
                <button
                  onClick={() => navigate('/stok')}
                  className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Lihat
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
