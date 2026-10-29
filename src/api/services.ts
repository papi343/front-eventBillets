import { apiClient } from './client';
import {
  MOCK_CATEGORIES,
  MOCK_EVENTS,
  MOCK_ORDERS,
  MOCK_TICKETS,
  MOCK_USERS,
} from './mockData';
import type { Category, EventItem, Order, Ticket, User, UserRole } from '../types';

let localCategories = [...MOCK_CATEGORIES];
let localEvents = [...MOCK_EVENTS];
let localOrders = [...MOCK_ORDERS];
let localTickets = [...MOCK_TICKETS];

function unwrapCollection<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

export const eventBilletApi = {
  // AUTH
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const { data } = await apiClient.post('/login', { email, password });
      return {
        token: data.token,
        user: data.user,
      };
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        throw new Error(error.response.data?.message || 'Identifiants incorrects.');
      }
      const lower = email.toLowerCase();
      let role: UserRole = 'Participant';
      let matchedUser = MOCK_USERS[2];
      if (lower.includes('admin')) {
        role = 'Admin';
        matchedUser = MOCK_USERS[0];
      } else if (lower.includes('org')) {
        role = 'Organiser';
        matchedUser = MOCK_USERS[1];
      }
      return {
        token: `demo-sanctum-token-${role.toLowerCase()}`,
        user: { ...matchedUser, email, role },
      };
    }
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
  }): Promise<{ token: string; user: User }> {
    try {
      const { data } = await apiClient.post('/register', payload);
      return {
        token: data.token || `token-${Date.now()}`,
        user: data.user || data,
      };
    } catch (error: any) {
      if (error.response?.status === 422) {
        const msg =
          error.response.data?.message ||
          Object.values(error.response.data?.errors || {})
            .flat()
            .join(' ');
        throw new Error(msg || 'Erreur de validation.');
      }
      const created: User = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        role: payload.role,
        phone: payload.phone || null,
      };
      return {
        token: `demo-sanctum-token-${Date.now()}`,
        user: created,
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } catch {
      // ignore offline
    }
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    try {
      const { data } = await apiClient.get('/categories');
      const items = unwrapCollection<Category>(data);
      return items.length > 0 ? items : localCategories;
    } catch {
      return localCategories;
    }
  },

  async createCategory(name: string): Promise<Category> {
    try {
      const { data } = await apiClient.post('/categories', { name });
      return data.data || data;
    } catch {
      const created: Category = {
        id: Date.now(),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      };
      localCategories = [created, ...localCategories];
      return created;
    }
  },

  async deleteCategory(id: number): Promise<void> {
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch {
      localCategories = localCategories.filter((c) => c.id !== id);
    }
  },

  // EVENTS
  async getEvents(): Promise<EventItem[]> {
    try {
      const { data } = await apiClient.get('/events');
      const items = unwrapCollection<EventItem>(data);
      return items.length > 0 ? items : localEvents;
    } catch {
      return localEvents;
    }
  },

  async getEventById(id: number): Promise<EventItem | undefined> {
    try {
      const { data } = await apiClient.get(`/events/${id}`);
      return data.data || data;
    } catch {
      return localEvents.find((e) => e.id === id);
    }
  },

  async createEvent(payload: {
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    category_id: number;
    price: number;
    total_seats: number;
    image_url?: string;
    imageFile?: File | null;
  }): Promise<EventItem> {
    try {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('location', payload.location);
      formData.append('start_date', payload.start_date);
      formData.append('end_date', payload.end_date);
      formData.append('category_id', String(payload.category_id));
      formData.append('price', String(payload.price));
      formData.append('total_seats', String(payload.total_seats));
      if (payload.imageFile) {
        formData.append('image', payload.imageFile);
      }

      const { data } = await apiClient.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data || data;
    } catch {
      const category = localCategories.find((c) => c.id === Number(payload.category_id));
      const created: EventItem = {
        id: Date.now(),
        title: payload.title,
        slug: payload.title.toLowerCase().replace(/\s+/g, '-'),
        description: payload.description,
        location: payload.location,
        start_date: payload.start_date,
        end_date: payload.end_date,
        price: Number(payload.price),
        total_seats: Number(payload.total_seats),
        available_seats: Number(payload.total_seats),
        status: 'published',
        image_url:
          payload.image_url ||
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        category,
      };
      localEvents = [created, ...localEvents];
      return created;
    }
  },

  async updateEventStatus(id: number, status: EventItem['status']): Promise<EventItem> {
    try {
      const { data } = await apiClient.put(`/events/${id}`, { status });
      return data.data || data;
    } catch {
      let updated: EventItem | undefined;
      localEvents = localEvents.map((ev) => {
        if (ev.id === id) {
          updated = { ...ev, status };
          return updated;
        }
        return ev;
      });
      return updated!;
    }
  },

  async deleteEvent(id: number): Promise<void> {
    try {
      await apiClient.delete(`/events/${id}`);
    } catch {
      localEvents = localEvents.filter((e) => e.id !== id);
    }
  },

  // ORDERS & PAYMENTS
  async getOrders(): Promise<Order[]> {
    try {
      const { data } = await apiClient.get('/orders');
      const items = unwrapCollection<Order>(data);
      return items.length > 0 ? items : localOrders;
    } catch {
      return localOrders;
    }
  },

  async createOrder(eventId: number, quantity: number): Promise<Order> {
    try {
      const { data } = await apiClient.post('/orders', {
        event_id: eventId,
        quantity,
      });
      return data.order || data.data || data;
    } catch {
      const event = localEvents.find((e) => e.id === eventId) || localEvents[0];
      const newOrder: Order = {
        id: Math.floor(1000 + Math.random() * 9000),
        quantity,
        total_amount: (event?.price || 200) * quantity,
        status: 'pending',
        expire_at: new Date(Date.now() + 10 * 60000).toISOString(),
        event,
        tickets: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localOrders = [newOrder, ...localOrders];
      return newOrder;
    }
  },

  async confirmOrderPayment(orderId: number): Promise<Order> {
    try {
      const { data } = await apiClient.post(`/orders/${orderId}/confirm-payment`, {
        payment_method: 'card',
      });
      return data.order || data.data || data;
    } catch {
      let targetOrder = localOrders.find((o) => o.id === orderId);
      if (!targetOrder) {
        throw new Error('Commande introuvable');
      }
      const generatedTickets: Ticket[] = Array.from({ length: targetOrder.quantity }).map(
        (_, idx) => {
          const code = `TKT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${orderId}${idx + 1}`;
          return {
            id: Date.now() + idx,
            ticket_number: code,
            event_id: targetOrder?.event?.id || 1,
            user_id: 3,
            order_id: orderId,
            price: targetOrder?.event?.price || 250,
            qr_code: null,
            qr_data: code,
            status: 'unused',
            used_at: null,
            event: targetOrder?.event,
            created_at: new Date().toISOString(),
          };
        }
      );

      localTickets = [...generatedTickets, ...localTickets];
      const updatedOrder: Order = {
        ...targetOrder,
        status: 'paid',
        tickets: generatedTickets,
      };
      localOrders = localOrders.map((o) => (o.id === orderId ? updatedOrder : o));
      return updatedOrder;
    }
  },

  async cancelOrder(orderId: number): Promise<void> {
    try {
      await apiClient.delete(`/orders/${orderId}`);
    } catch {
      localOrders = localOrders.map((o) =>
        o.id === orderId ? { ...o, status: 'refunded' } : o
      );
    }
  },

  // TICKETS
  async getTickets(): Promise<Ticket[]> {
    try {
      const { data } = await apiClient.get('/tickets');
      const items = unwrapCollection<Ticket>(data);
      return items.length > 0 ? items : localTickets;
    } catch {
      return localTickets;
    }
  },
};
