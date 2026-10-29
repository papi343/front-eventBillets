import type { Category, EventItem, Order, Ticket, User } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Concerts & Festivals', slug: 'concerts-festivals' },
  { id: 2, name: 'Tech & Conférences', slug: 'tech-conferences' },
  { id: 3, name: 'Sport & Compétitions', slug: 'sport-competitions' },
  { id: 4, name: 'Théâtre & Humour', slug: 'theatre-humour' },
  { id: 5, name: 'Gala & Networking', slug: 'gala-networking' },
];

export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Sarah Mansouri (Admin)',
    email: 'admin@eventbillet.ma',
    role: 'Admin',
    phone: '+212 6 00 11 22 33',
  },
  {
    id: 2,
    name: 'Karim Tazi (Organisateur)',
    email: 'organiser@eventbillet.ma',
    role: 'Organiser',
    phone: '+212 6 44 55 66 77',
  },
  {
    id: 3,
    name: 'Youssef Benali (Client)',
    email: 'client@eventbillet.ma',
    role: 'Participant',
    phone: '+212 6 88 99 00 11',
  },
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'Casablanca Jazz & Electronic Night 2026',
    slug: 'casablanca-jazz-electronic-night-2026',
    description:
      'Une soirée immersive exceptionnelle réunissant les meilleurs artistes internationaux de Jazz Fusion et de musique électronique sous les étoiles de Casablanca.',
    location: 'Anfa Park, Casablanca',
    start_date: '2026-11-15T20:00:00.000Z',
    end_date: '2026-11-16T02:00:00.000Z',
    image_url:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    price: 350,
    total_seats: 500,
    available_seats: 142,
    status: 'published',
    organizer: MOCK_USERS[1],
    category: MOCK_CATEGORIES[0],
  },
  {
    id: 2,
    title: 'Morocco AI & Cloud Summit 2026',
    slug: 'morocco-ai-cloud-summit-2026',
    description:
      'Le plus grand rassemblement de développeurs, architectes Cloud et leaders IA en Afrique du Nord. Keynotes, ateliers pratiques et networking.',
    location: 'Palais des Congrès, Rabat',
    start_date: '2026-11-22T09:00:00.000Z',
    end_date: '2026-11-22T18:30:00.000Z',
    image_url:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    price: 500,
    total_seats: 300,
    available_seats: 68,
    status: 'published',
    organizer: MOCK_USERS[1],
    category: MOCK_CATEGORIES[1],
  },
  {
    id: 3,
    title: 'Marrakech Stand-Up Comedy Gala',
    slug: 'marrakech-stand-up-comedy-gala',
    description:
      '2 heures de rires non-stop avec la nouvelle génération des humoristes francophones et marocains au Théâtre Royal.',
    location: 'Théâtre Royal, Marrakech',
    start_date: '2026-12-05T20:30:00.000Z',
    end_date: '2026-12-05T23:00:00.000Z',
    image_url:
      'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    price: 220,
    total_seats: 400,
    available_seats: 215,
    status: 'published',
    organizer: MOCK_USERS[1],
    category: MOCK_CATEGORIES[3],
  },
  {
    id: 4,
    title: 'Finale Masters Padel Cup',
    slug: 'finale-masters-padel-cup',
    description:
      'Assistez aux demi-finales et à la grande finale du tournoi international de Padel avec accès village VIP et animations.',
    location: 'Oasis Sports Club, Casablanca',
    start_date: '2026-12-12T14:00:00.000Z',
    end_date: '2026-12-12T21:00:00.000Z',
    image_url:
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
    price: 180,
    total_seats: 250,
    available_seats: 85,
    status: 'published',
    organizer: MOCK_USERS[1],
    category: MOCK_CATEGORIES[2],
  },
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 101,
    ticket_number: 'TKT202610282300ab12cd',
    event_id: 1,
    user_id: 3,
    order_id: 501,
    price: 350,
    qr_code: null,
    qr_data: 'TKT202610282300ab12cd',
    status: 'unused',
    used_at: null,
    event: MOCK_EVENTS[0],
    user: MOCK_USERS[2],
    created_at: new Date().toISOString(),
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 501,
    quantity: 1,
    total_amount: 350,
    status: 'paid',
    expire_at: null,
    user: MOCK_USERS[2],
    event: MOCK_EVENTS[0],
    tickets: MOCK_TICKETS,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
