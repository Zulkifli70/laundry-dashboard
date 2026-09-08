import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    }
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-page)' }}>
      <div className="login-panel w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'var(--color-accent-blue)' }}>
            <span className="text-white text-base font-bold">L</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Laundry Dashboard</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Masuk untuk melanjutkan</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-7" style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--color-accent-red)' }}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-base outline-none transition-colors"
                style={{ background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-card-border)'}
                placeholder="admin@laundry.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-base outline-none transition-colors"
                style={{ background: 'var(--color-sidebar)', color: 'var(--color-text-primary)', border: '1px solid var(--color-card-border)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-card-border)'}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-accent-blue)' }}
            >
              Masuk
            </button>
          </form>

          <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid var(--color-divider)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Demo: admin@laundry.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;