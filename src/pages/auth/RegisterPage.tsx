import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Participant');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      password,
    });
    if (ok) {
      navigate(role === 'Participant' ? '/' : '/admin');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="mt-1 text-sm text-slate-400">
            Rejoignez EventBillet en tant que participant ou organisateur
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
              Nom complet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                clearError();
                setName(e.target.value);
              }}
              placeholder="Youssef Benali"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

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
              placeholder="youssef@email.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+212 6 00 00 00 00"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Type de compte
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Participant')}
                className={`rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                  role === 'Participant'
                    ? 'border-violet-500 bg-violet-600/20 text-violet-300'
                    : 'border-slate-700 bg-slate-950 text-slate-400'
                }`}
              >
                🎟️ Client (Participant)
              </button>
              <button
                type="button"
                onClick={() => setRole('Organiser')}
                className={`rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                  role === 'Organiser'
                    ? 'border-violet-500 bg-violet-600/20 text-violet-300'
                    : 'border-slate-700 bg-slate-950 text-slate-400'
                }`}
              >
                🎤 Organisateur
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              placeholder="Minimum 6 caractères"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Création en cours...' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-semibold text-violet-400 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
