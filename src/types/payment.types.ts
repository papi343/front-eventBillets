
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Payment {
  id: number;
  order_id: number;
  stripe_payment_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method: string;
  currency: string;
  created_at: string;
  updated_at: string;
}