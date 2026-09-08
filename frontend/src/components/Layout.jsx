import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: (
      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
    )},
    { path: '/transaksi', label: 'Transaksi', icon: (
      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    )},
    ...(isAdmin ? [
      { path: '/pengeluaran', label: 'Pengeluaran', icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      )},
      { path: '/stok', label: 'Stok Barang', icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      )},
    ] : []),
  ];

  const sidebarContent = (
    <div className="flex flex-col min-h-[360px]">
      {/* Logo - kecil tapi jelas */}
      <div className="px-5 pt-5 pb-4 border-b border-[var(--color-sidebar-border)]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-blue)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">L</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">Laundry</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">Multi-Outlet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Menu
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[rgba(79,140,255,0.12)] text-[var(--color-accent-blue)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {item.icon}
              <span className="hidden md:block">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User info - dipisah dari nav dengan jarak */}
      <div className="mt-5 border-t border-[var(--color-sidebar-border)] pt-4">
        <div className="flex items-center gap-3 px-3 py-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent-blue)] flex items-center justify-center flex-shrink-0">
            <span className="font-semibold text-[var(--color-accent-blue)] opacity-80">
              {user?.nama?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span>
            <span className="font-medium text-[var(--color-text-primary)]">{user?.nama}</span>
            <span className="ml-1 text-[var(--color-text-muted)] capitalize">{user?.role}</span>
          </span>
        </div>
        <button
          onClick={logout}
          className="mt-2 w-full py-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-sm"
          title="Keluar"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar - lebar lebih optimal */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[var(--color-sidebar)] app-sidebar border-r border-[var(--color-sidebar-border)]">
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center h-12 px-3 bg-[var(--color-sidebar)] border-b border-[var(--color-sidebar-border)] shrink-0">
          <label htmlFor="mobile-drawer" className="p-1 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-nav-hover)] cursor-pointer">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </label>
          <span className="ml-2 text-sm font-semibold text-[var(--color-text-primary)] hidden lg:block">Laundry</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      <input id="mobile-drawer" type="checkbox" className="peer sr-only" />
      <div className="fixed inset-0 z-50 lg:hidden pointer-events-none peer-checked:pointer-events-auto">
        <div className="absolute inset-0 bg-black/50 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"></div>
        <aside className="absolute left-0 top-0 bottom-0 w-56 bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] -translate-x-full peer-checked:translate-x-0 transition-transform duration-200">
          {sidebarContent}
        </aside>
      </div>
    </div>
  );
};

export default Layout;