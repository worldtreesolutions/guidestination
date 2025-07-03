export interface StripeCheckoutMetadata {
  activity_id: string;
  provider_id: string;
  establishment_id?: string;
  commission_percent: string;
  customer_id?: string;
  participants: string;
  base_amount: string;
  stripe_fee: string;
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
  recipientType: 'provider' | 'partner' | 'activity_owner';
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

export interface StripeFeesCalculation {
  baseAmount: number;
  stripeFee: number;
  totalAmount: number;
  platformCommission: number;
  providerAmount: number;
  partnerCommission?: number;
  guidestinationCommission: number;
}

export interface StripePayout {
  id: string;
  recipientType: 'partner' | 'activity_owner';
  recipientId: string;
  stripePayoutId: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate?: string;
  createdAt: string;
  updatedAt: string;
}
