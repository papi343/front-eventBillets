import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email.trim(), password);
    if (ok) {
      navigate('/');
    }
  };

  const handleQuickDemo = async (demoEmail: string, targetPath: string) => {
    clearError();
    setEmail(demoEmail);
    setPassword('password123');
    const ok = await login(demoEmail, 'password123');
    if (ok) {
      navigate(targetPath);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20 text-2xl">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-white">Connexion à EventBillet</h1>
          <p className="mt-1 text-sm text-slate-400">
            Accédez à vos billets QR ou à votre espace de gestion
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Adresse Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                clearError();
                setEmail(e.target.value);
              }}
              placeholder="vous@exemple.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs font-medium text-slate-500">Accès rapide démonstration</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('client@eventbillet.ma', '/')}
            className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-center transition hover:border-violet-500/50 hover:bg-violet-500/10 cursor-pointer"
          >
            <span className="block text-base">🎟️</span>
            <span className="mt-1 block text-xs font-bold text-white">Client</span>
            <span className="block text-[10px] text-slate-400">Participant</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('organiser@eventbillet.ma', '/admin')}
            className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-center transition hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer"
          >
            <span className="block text-base">🎤</span>
            <span className="mt-1 block text-xs font-bold text-white">Organisateur</span>
            <span className="block text-[10px] text-slate-400">Événements</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('admin@eventbillet.ma', '/admin')}
            className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-center transition hover:border-amber-500/50 hover:bg-amber-500/10 cursor-pointer"
          >
            <span className="block text-base">⚡</span>
            <span className="mt-1 block text-xs font-bold text-white">Admin</span>
            <span className="block text-[10px] text-slate-400">Backoffice</span>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-violet-400 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
