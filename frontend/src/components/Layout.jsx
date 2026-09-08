import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/transaksi', label: 'Transaksi', icon: '📋' },
    ...(isAdmin ? [
      { path: '/pengeluaran', label: 'Pengeluaran', icon: '💸' },
      { path: '/stok', label: 'Stok', icon: '📦' },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Sidebar */}
      <aside className="drawer drawer-end lg:drawer-open">
        <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <div className="flex-1 p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
        <div className="drawer-side w-64 lg:w-64">
          <div className="p-4 lg:p-6 space-y-2">
            {/* Logo */}
            <div className="text-center py-4 border-b border-base-300">
              <h1 className="text-xl font-bold text-base-content">Laundry</h1>
              <p className="text-xs text-base-content/60 mt-1">Dashboard Multi-Outlet</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-content'
                        : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User info */}
            <div className="pt-4 border-t border-base-300 mt-auto">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-base-content truncate">
                    {user?.nama}
                  </p>
                  <p className="text-xs text-base-content/50 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer toggle */}
      <label htmlFor="drawer-toggle" className="drawer-button lg:hidden fixed top-4 right-4 z-50 btn btn-square btn-primary">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </label>
    </div>
  );
};

export default Layout;