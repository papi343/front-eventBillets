import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventBilletApi } from '../../api/services';
import { useAuthStore } from '../../store/useAuthStore';
import type { EventItem } from '../../types';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [bookingStep, setBookingStep] = useState<'SELECT' | 'CHECKOUT' | 'PROCESSING'>('SELECT');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const found = await eventBilletApi.getEventById(Number(id));
      setEvent(found || null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Chargement de l'événement...</div>;
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Événement introuvable</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white cursor-pointer"
        >
          Retour au catalogue
        </button>
      </div>
    );
  }

  const totalAmount = event.price * quantity;

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingStep('CHECKOUT');
  };

  const handleConfirmAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setBookingStep('PROCESSING');
    try {
      const order = await eventBilletApi.createOrder(event.id, quantity);
      await eventBilletApi.confirmOrderPayment(order.id);
      navigate('/my-tickets');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors du paiement de la commande.');
      setBookingStep('CHECKOUT');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white cursor-pointer"
      >
        ← Retour aux événements
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Event details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <img
              src={
                event.image_url ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
              }
              alt={event.title}
              className="h-72 sm:h-96 w-full object-cover"
            />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                {event.category && (
                  <span className="rounded-full bg-violet-600/20 px-3 py-1 text-xs font-bold text-violet-300">
                    {event.category.name}
                  </span>
                )}
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                  {event.available_seats} places disponibles
                </span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-white">
                {event.title}
              </h1>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <div>
                  <span className="block text-xs text-slate-400">Date & Heure de début</span>
                  <span className="text-sm font-semibold text-white">
                    📅 {new Date(event.start_date).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Lieu</span>
                  <span className="text-sm font-semibold text-white">📍 {event.location}</span>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-bold text-white">À propos de l'événement</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Ticket reservation & Stripe checkout */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Billetterie Officielle</h2>
            <p className="mt-1 text-xs text-slate-400">
              Billets électroniques nominatifs avec QR Code chiffré anti-fraude
            </p>

            {errorMsg && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Prix unitaire</span>
                <span className="text-lg font-extrabold text-white">{event.price} MAD</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-400">Quantité de billets</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-lg border border-slate-700 bg-slate-900 font-bold text-white cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(Math.min(event.available_seats || 10, quantity + 1))
                    }
                    className="h-8 w-8 rounded-lg border border-slate-700 bg-slate-900 font-bold text-white cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-sm font-semibold text-slate-300">Total à payer</span>
                <span className="text-2xl font-extrabold text-violet-400">
                  {totalAmount} MAD
                </span>
              </div>
            </div>

            {bookingStep === 'SELECT' && (
              <button
                type="button"
                disabled={event.available_seats <= 0}
                onClick={handleProceedToCheckout}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                {event.available_seats <= 0
                  ? 'Événement Complet'
                  : 'Procéder au paiement sécurisé'}
              </button>
            )}

            {(bookingStep === 'CHECKOUT' || bookingStep === 'PROCESSING') && (
              <form onSubmit={handleConfirmAndPay} className="mt-6 space-y-4 border-t border-slate-800 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                    💳 Paiement Carte / Stripe
                  </span>
                  <span className="text-[11px] text-emerald-400">🔒 SSL 256-bit</span>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Titulaire de la carte</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Nom complet"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Numéro de carte</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Expiration</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">CVC</label>
                    <input
                      type="text"
                      defaultValue="842"
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingStep === 'PROCESSING'}
                  className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                >
                  {bookingStep === 'PROCESSING'
                    ? 'Validation & génération des QR Codes...'
                    : `Payer ${totalAmount} MAD & Obtenir mes billets`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
