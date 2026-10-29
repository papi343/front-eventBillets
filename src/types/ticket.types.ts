import type { User } from "./user.types";
import type { EventItem } from "./event.types";
import type { Order } from "./order.types";

export type TicketStatus = "used" | "unused";

export interface Ticket {
  id: number;
  ticket_number: string | number;
  event_id: number;
  user_id: number;
  order_id: number;
  price: string | number;
  qr_code: string | null;
  qr_data?: string | null;
  status: TicketStatus;
  used_at: string | null;
  event?: EventItem;
  user?: User;
  order?: Order;
  created_at?: string;
}