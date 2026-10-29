import React, { useEffect, useState } from 'react';
import { eventBilletApi } from '../../api/services';
import { useAuthStore } from '../../store/useAuthStore';
import type { Category, EventItem, Ticket } from '../../types';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'CATEGORIES' | 'TICKETS'>('EVENTS');

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('2026-11-30T20:00');
  const [endDate, setEndDate] = useState('2026-11-30T23:30');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [price, setPrice] = useState('250');
  const [totalSeats, setTotalSeats] = useState('200');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create Category state
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [evList, catList, tktList] = await Promise.all([
      eventBilletApi.getEvents(),
      eventBilletApi.getCategories(),
      eventBilletApi.getTickets(),
    ]);
    setEvents(evList);
    setCategories(catList);
    if (catList.length > 0 && catList[0].id) {
      setCategoryId(catList[0].id);
    }
    setTickets(tktList);
    setLoading(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await eventBilletApi.createEvent({
      title,
      description,
      location,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      category_id: categoryId,
      price: Number(price),
      total_seats: Number(totalSeats),
      image_url: imageUrl.trim() || undefined,
      imageFile,
    });
    setSubmitting(false);
    setShowEventModal(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setImageUrl('');
    setImageFile(null);
    loadAll();
  };

  const handleDeleteEvent = async (id: number) => {
    await eventBilletApi.deleteEvent(id);
    loadAll();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await eventBilletApi.createCategory(newCategoryName.trim());
    setNewCategoryName('');
    loadAll();
  };

  const handleDeleteCategory = async (id?: number) => {
    if (!id) return;
    await eventBilletApi.deleteCategory(id);
    loadAll();
  };

  const totalSeatsCount = events.reduce((acc, ev) => acc + Number(ev.total_seats || 0), 0);
  const availableSeatsCount = events.reduce((acc, ev) => acc + Number(ev.available_seats || 0), 0);
  const soldTicketsCount = Math.max(totalSeatsCount - availableSeatsCount, tickets.length);
  const estimatedRevenue = events.reduce(
    (acc, ev) => acc + (Number(ev.total_seats) - Number(ev.available_seats)) * Number(ev.price),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            Backoffice {user?.role || 'Admin'}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            Tableau de Bord & Gestion Billetterie
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Pilotez vos événements, catégories, ventes et contrôle des billets scannés
          </p>
        </div>

        <button
          onClick={() => setShowEventModal(true)}
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:opacity-95 cursor-pointer"
        >
          + Nouvel Événement
        </button>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Événements Actifs
          </span>
          <p className="mt-2 text-3xl font-extrabold text-white">{events.length}</p>
          <span className="mt-1 block text-xs text-emerald-400">Catalogue en ligne</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Places Vendues
          </span>
          <p className="mt-2 text-3xl font-extrabold text-violet-400">{soldTicketsCount}</p>
          <span className="mt-1 block text-xs text-slate-400">
            Sur {totalSeatsCount} places totales
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Chiffre d'Affaires Estimé
          </span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-400">
            {estimatedRevenue.toLocaleString('fr-FR')} MAD
          </p>
          <span className="mt-1 block text-xs text-slate-400">Paiements validés</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Billets Scannés (Videurs)
          </span>
          <p className="mt-2 text-3xl font-extrabold text-amber-400">
            {tickets.filter((t) => t.status === 'used').length} / {tickets.length}
          </p>
          <span className="mt-1 block text-xs text-slate-400">Contrôle d'accès mobile</span>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="mt-8 flex gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'EVENTS'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          🎤 Gestion des Événements ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'CATEGORIES'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          🏷️ Catégories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('TICKETS')}
          className={`rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'TICKETS'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          🎟️ Billets Émis & Statut Scan ({tickets.length})
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Chargement des données...</div>
      ) : activeTab === 'EVENTS' ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-4">Événement</th>
                  <th className="px-5 py-4">Catégorie</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Prix</th>
                  <th className="px-5 py-4">Places Dispo</th>
                  <th className="px-5 py-4">Statut</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{ev.title}</p>
                      <p className="text-xs text-slate-400">📍 {ev.location}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-300">
                        {ev.category?.name || 'Général'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300">
                      {new Date(ev.start_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4 font-bold text-white">{ev.price} MAD</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-emerald-400">
                        {ev.available_seats}
                      </span>{' '}
                      <span className="text-xs text-slate-500">/ {ev.total_seats}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 uppercase">
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'CATEGORIES' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleCreateCategory}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 h-fit"
          >
            <h3 className="text-lg font-bold text-white">Ajouter une Catégorie</h3>
            <p className="mt-1 text-xs text-slate-400">
              Créez une nouvelle thématique d'événements
            </p>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Humour & Stand-up"
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-500 cursor-pointer"
            >
              Créer la catégorie
            </button>
          </form>

          <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
            {categories.map((cat) => (
              <div
                key={cat.id || cat.name}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4"
              >
                <div>
                  <p className="font-bold text-white">{cat.name}</p>
                  <p className="text-xs text-slate-500">Slug: {cat.slug || cat.name.toLowerCase()}</p>
                </div>
                {cat.id && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-4">N° Billet</th>
                  <th className="px-5 py-4">Événement</th>
                  <th className="px-5 py-4">Prix</th>
                  <th className="px-5 py-4">Statut Entrée (Scan Videur)</th>
                  <th className="px-5 py-4">Heure de Scan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-violet-300">
                      {t.ticket_number}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {t.event?.title || `Événement #${t.event_id}`}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{t.price} MAD</td>
                    <td className="px-5 py-4">
                      {t.status === 'used' ? (
                        <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300">
                          Scanné / Utilisé
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                          Non utilisé (Valide)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {t.used_at ? new Date(t.used_at).toLocaleString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Création Événement */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Créer un Nouvel Événement</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  Titre de l'événement
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Festival Gnaoua Casablanca"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    Catégorie
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    Lieu / Salle
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Complexe Mohammed V, Casablanca"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    Date & Heure Début
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    Date & Heure Fin
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    Prix du Billet (MAD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    Nombre Total de Places
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  Image de couverture (Fichier ou URL)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="mb-2 w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-violet-300"
                />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ou URL d'image (https://...)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  Description détaillée
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Programme, artistes invités, informations d'accès..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500 cursor-pointer"
                >
                  {submitting ? 'Publication...' : "Publier l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
