import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventBilletApi } from '../../api/services';
import type { Order } from '../../types';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const list = await eventBilletApi.getOrders();
    setOrders(list);
    setLoading(false);
  };

  const handlePayNow = async (orderId: number) => {
    setProcessingId(orderId);
    await eventBilletApi.confirmOrderPayment(orderId);
    await loadOrders();
    setProcessingId(null);
  };

  const handleCancelOrder = async (orderId: number) => {
    setProcessingId(orderId);
    await eventBilletApi.cancelOrder(orderId);
    await loadOrders();
    setProcessingId(null);
  };

  const statusBadge = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
            Payée ✓
          </span>
        );
      case 'pending':
        return (
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
            En attente de paiement
          </span>
        );
      case 'refunded':
        return (
          <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
            Remboursée / Annulée
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300">
            Échouée
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mes Commandes</h1>
          <p className="mt-1 text-sm text-slate-400">
            Suivez l'état de vos réservations et téléchargez vos billets
          </p>
        </div>
        <Link
          to="/my-tickets"
          className="rounded-xl bg-violet-600/20 border border-violet-500/30 px-4 py-2.5 text-xs font-bold text-violet-300 hover:bg-violet-600/30"
        >
          🎟️ Voir mes Billets QR
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Chargement de vos commandes...</div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <p className="text-lg font-bold text-white">Aucune commande enregistrée</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Découvrir les événements
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400">Commande #{order.id}</span>
                  {statusBadge(order.status)}
                </div>
                <h3 className="mt-2 text-lg font-bold text-white">
                  {order.event?.title || 'Événement'}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Quantité : <strong className="text-white">{order.quantity} billet(s)</strong> • Total :{' '}
                  <strong className="text-violet-400">{order.total_amount} MAD</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handlePayNow(order.id)}
                      disabled={processingId === order.id}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      Payer maintenant
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={processingId === order.id}
                      className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                    >
                      Annuler
                    </button>
                  </>
                )}

                {order.status === 'paid' && (
                  <Link
                    to="/my-tickets"
                    className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500"
                  >
                    Afficher les QR Codes →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
