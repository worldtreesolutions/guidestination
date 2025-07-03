export interface StripeCheckoutMetadata {
  activity_id: string;
  provider_id: string;
  establishment_id?: string;
  commission_percent: string;
  customer_id?: string;
  participants: string;
}

export interface CheckoutSessionData {
  activityId: number;
  providerId: string;
  establishmentId?: string;
  customerId?: string;
  amount: number;
  participants: number;
  commissionPercent?: number;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeTransfer {
  id: string;
  checkoutSessionId: string;
  stripeTransferId?: string;
  recipientType: 'provider' | 'partner';
  recipientId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StripeCheckoutSession {
  id: string;
  stripeSessionId: string;
  activityId: number;
  providerId: string;
  establishmentId?: string;
  customerId?: string;
  amount: number;
  commissionPercent: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEventData {
  id: string;
  stripeEventId: string;
  eventType: string;
  processed: boolean;
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}