import React, { useEffect, useState } from 'react';
import { eventBilletApi } from '../../api/services';
import type { Ticket } from '../../types';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await eventBilletApi.getTickets();
      setTickets(list);
      setLoading(false);
    };
    load();
  }, []);

  const copyPayload = (ticket: Ticket) => {
    const payload = ticket.qr_data || String(ticket.ticket_number);
    navigator.clipboard.writeText(payload);
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mes Billets & QR Codes</h1>
        <p className="mt-1 text-sm text-slate-400">
          Présentez ce QR Code à l'entrée de l'événement pour le contrôle d'accès par l'application mobile Videur
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Chargement de vos billets...</div>
      ) : tickets.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <p className="text-lg font-bold text-white">Vous n'avez aucun billet actif</p>
          <p className="mt-1 text-sm text-slate-400">
            Vos billets apparaissent automatiquement ici dès que votre commande est payée.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {tickets.map((ticket) => {
            const qrPayload = ticket.qr_data || String(ticket.ticket_number);
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
              qrPayload
            )}`;
            const isUsed = ticket.status === 'used';

            return (
              <div
                key={ticket.id}
                className="flex flex-col sm:flex-row overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl"
              >
                {/* QR Section */}
                <div className="flex flex-col items-center justify-center bg-white p-6 sm:w-52 shrink-0">
                  <img
                    src={qrImageUrl}
                    alt={`QR Ticket ${ticket.ticket_number}`}
                    className={`h-36 w-36 object-contain ${isUsed ? 'opacity-35 grayscale' : ''}`}
                  />
                  <span className="mt-3 font-mono text-[11px] font-bold text-slate-800">
                    #{ticket.ticket_number}
                  </span>
                </div>

                {/* Ticket Details */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                          isUsed
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {isUsed ? 'Déjà Scanné / Utilisé' : 'Valide — Prêt à scanner'}
                      </span>
                      <span className="text-sm font-extrabold text-violet-400">
                        {ticket.price} MAD
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-white">
                      {ticket.event?.title || `Événement #${ticket.event_id}`}
                    </h3>
                    {ticket.event?.location && (
                      <p className="mt-1 text-xs text-slate-400">📍 {ticket.event.location}</p>
                    )}
                    {ticket.event?.start_date && (
                      <p className="mt-1 text-xs text-slate-400">
                        📅 {new Date(ticket.event.start_date).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-800 pt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => copyPayload(ticket)}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-violet-500 hover:text-white cursor-pointer"
                    >
                      {copiedId === ticket.id
                        ? '✓ Code QR copié !'
                        : '📋 Copier code pour test Videur'}
                    </button>
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
