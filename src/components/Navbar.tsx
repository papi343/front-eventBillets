import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xl shadow-lg shadow-violet-600/30">
            🎟️
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Event<span className="text-violet-400">Billet</span>
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Billetterie Officielle
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive('/')
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            Événements
          </Link>

          {user && (
            <>
              <Link
                to="/my-orders"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive('/my-orders')
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                Mes Commandes
              </Link>
              <Link
                to="/my-tickets"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive('/my-tickets')
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                Mes Billets QR
              </Link>
            </>
          )}

          {(user?.role === 'Admin' || user?.role === 'Organiser') && (
            <Link
              to="/admin"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                location.pathname.startsWith('/admin')
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              ⚡ Dashboard {user.role === 'Admin' ? 'Admin' : 'Organisateur'}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <span className="inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
