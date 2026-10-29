import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventBilletApi } from '../../api/services';
import type { Category, EventItem } from '../../types';

export default function EventsCatalogPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [evList, catList] = await Promise.all([
        eventBilletApi.getEvents(),
        eventBilletApi.getCategories(),
      ]);
      setEvents(evList);
      setCategories(catList);
      setLoading(false);
    };
    load();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'ALL' ||
      ev.category?.name === selectedCategory ||
      String(ev.category?.id) === selectedCategory;
    return matchesSearch && matchesCat && ev.status !== 'cancelled';
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 via-violet-950/60 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-violet-300 border border-violet-500/30">
            ✨ Billetterie Instantanée & QR Sécurisé
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Réservez vos places pour les meilleurs événements
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Concerts, conférences tech, spectacles et compétitions sportives. Recevez vos billets QR chiffrés immédiatement après paiement.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un événement, une ville, une salle..."
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/90 px-5 py-3.5 text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Toutes les catégories
        </button>
        {categories.map((cat) => {
          const active = selectedCategory === cat.name;
          return (
            <button
              key={cat.id || cat.name}
              onClick={() => setSelectedCategory(active ? 'ALL' : cat.name)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                active
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Chargement des événements...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-lg font-bold text-white">Aucun événement trouvé</p>
          <p className="mt-1 text-sm text-slate-400">
            Essayez un autre mot-clé ou changez de catégorie.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const soldOut = event.available_seats <= 0;
            return (
              <div
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-950/30"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <img
                    src={
                      event.image_url ||
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80'
                    }
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {event.category && (
                      <span className="rounded-lg bg-slate-950/85 px-3 py-1 text-xs font-bold text-violet-300 backdrop-blur-sm">
                        {event.category.name}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-xl bg-slate-950/90 px-3 py-1.5 text-sm font-extrabold text-white backdrop-blur-sm">
                    {event.price > 0 ? `${event.price} MAD` : 'Gratuit'}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-violet-400">
                    <span>📅 {formatDate(event.start_date)}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">📍 {event.location}</p>
                  <p className="mt-2.5 text-sm text-slate-300 line-clamp-2 flex-1">
                    {event.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
                    <div>
                      <span className="block text-[11px] text-slate-400">Places restantes</span>
                      <span
                        className={`text-sm font-bold ${
                          soldOut ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {soldOut
                          ? 'Complet'
                          : `${event.available_seats} / ${event.total_seats}`}
                      </span>
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-500"
                    >
                      Réserver →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
