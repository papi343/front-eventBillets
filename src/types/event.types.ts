
import type { User } from "./user.types";
import type { Category } from "./category.types";

export type EventStatus = "draft" | "pending" | "published" | "cancelled";

export interface EventItem {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date: string;
  image_url?: string | null;
  price: number;
  total_seats: number;
  available_seats: number;
  status: EventStatus;
  organizer?: User;
  category?: Category;
  created_at?: string | null;
  updated_at?: string | null;
}