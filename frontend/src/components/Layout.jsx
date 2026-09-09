import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
          />
        </svg>
      ),
    },
    {
      path: "/transaksi",
      label: "Transaksi",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    ...(isAdmin
      ? [
          {
            path: "/pengeluaran",
            label: "Pengeluaran",
            icon: (
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            ),
          },
          {
            path: "/stok",
            label: "Stok Barang",
            icon: (
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            ),
          },
        ]
      : []),
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
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              Laundry
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              Multi-Outlet
            </p>
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
              className={`sidebar-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "sidebar-nav-link--active text-white font-semibold"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              {item.icon}
              <span className="hidden md:block">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-profile">
        <div className="profile-avatar">
          {user?.nama?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-copy">
          <strong>{user?.nama}</strong>
          <span>{user?.role === "admin" ? "Administrator" : user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="profile-logout"
          type="button"
          title="Keluar"
          aria-label="Keluar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16 17 5-5-5-5M21 12H9m4 7v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"
            />
          </svg>
        </button>
      </div>{" "}
    </div>
  );

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      {/* Desktop sidebar - lebar lebih optimal */}
      <aside className="app-sidebar hidden lg:flex flex-col w-64 shrink-0 bg-[var(--color-sidebar)] border border-[var(--color-sidebar-border)]">
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="app-topbar hidden lg:flex">
          <label className="topbar-search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="6" />
              <path strokeLinecap="round" d="m16 16 4 4" />
            </svg>
            <input
              aria-label="Cari"
              placeholder="Cari transaksi, pelanggan, atau stok"
            />
          </label>
          <div className="topbar-spacer" />
          <button className="topbar-icon" type="button" aria-label="Notifikasi">
            &#128276;
          </button>
          <div className="topbar-user">
            <span>{user?.nama?.charAt(0).toUpperCase()}</span>
            <div>
              <b>{user?.nama}</b>
              <small>{user?.role}</small>
            </div>
          </div>
        </header>{" "}
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center h-12 px-3 bg-[var(--color-sidebar)] border-b border-[var(--color-sidebar-border)] shrink-0">
          <label
            htmlFor="mobile-drawer"
            className="p-1 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-nav-hover)] cursor-pointer"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <span className="ml-2 text-sm font-semibold text-[var(--color-text-primary)] hidden lg:block">
            Laundry
          </span>
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
