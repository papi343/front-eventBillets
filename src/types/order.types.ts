
import type {User} from './user.types';
import type { EventItem } from './event.types';
import type { Ticket } from "./ticket.types";
import type { Payment } from "./payment.types";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: number;
  quantity: number;
  total_amount: string | number;
  status: OrderStatus;
  expire_in?: string | null;
  expire_at?: string | null;
  user?: User;
  event?: EventItem;
  tickets?: Ticket[];
  payment?: Payment;
  created_at: string;
  updated_at: string;
}