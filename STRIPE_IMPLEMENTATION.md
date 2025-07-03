# Stripe Checkout Flow Implementation

## Overview
This implementation provides a complete Stripe checkout flow for Guidestination with commission splitting between providers and partners.

## Features
- ✅ Stripe Connect integration for provider payments
- ✅ Commission splitting (20% platform, 80% provider)
- ✅ Partner commission sharing (10% when QR code used)
- ✅ Webhook handling for all payment events
- ✅ Database tracking of all transactions
- ✅ Error handling and retry logic

## Environment Variables Required

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_URL=https://3000-e31f2767-d3ac-4cb2-9894-aa7d0ebe87d2.h1097.daytona.work
NEXTAUTH_SECRET=your_nextauth_secret

# Required for Stripe webhook processing
NODE_ENV=development
```

## API Endpoints

### 1. Create Checkout Session
**POST** `/api/stripe/create-checkout-session`

Creates a Stripe checkout session with commission splitting.

**Request Body:**
```json
{
  "activityId": 123,
  "providerId": "provider_123",
  "establishmentId": "est_456", // Optional - for QR code bookings
  "customerId": "customer_789", // Optional
  "amount": 100.00,
  "participants": 2,
  "commissionPercent": 20, // Optional - defaults to 20%
  "successUrl": "https://yoursite.com/booking/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://yoursite.com/booking/cancelled"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### 2. Webhook Handler
**POST** `/api/stripe/webhook`

Handles Stripe webhook events for payment processing and commission distribution.

**Supported Events:**
- `checkout.session.completed` - Confirm payment, create booking, handle payouts
- `payment_intent.payment_failed` - Log failure and notify user
- `transfer.failed` - Retry or flag failed payouts
- `account.updated` - Track provider/partner Stripe account status
- `charge.refunded` - Handle refunds

### 3. Booking Details
**GET** `/api/booking/details?session_id={CHECKOUT_SESSION_ID}`

Retrieves booking details for the success page.

## Commission Logic

### Standard Booking (No QR Code)
- **Provider**: 80% of booking amount
- **Guidestination**: 20% of booking amount

### QR Code Booking (establishment_id present)
- **Provider**: 80% of booking amount
- **Partner**: 10% of booking amount (50% of platform commission)
- **Guidestination**: 10% of booking amount (remaining 50% of platform commission)

## Database Schema

The implementation uses the following Supabase tables:

### stripe_checkout_sessions
```sql
CREATE TABLE stripe_checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  activity_id INTEGER NOT NULL,
  provider_id TEXT NOT NULL,
  establishment_id TEXT,
  customer_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  commission_percent INTEGER DEFAULT 20,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### stripe_transfers
```sql
CREATE TABLE stripe_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id UUID REFERENCES stripe_checkout_sessions(id),
  stripe_transfer_id TEXT,
  recipient_type TEXT NOT NULL, -- 'provider' or 'partner'
  recipient_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### stripe_webhook_events
```sql
CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### bookings
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id INTEGER NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  participants INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'confirmed',
  booking_source TEXT DEFAULT 'direct', -- 'direct' or 'qr_code'
  establishment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### establishment_commissions
```sql
CREATE TABLE establishment_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id TEXT NOT NULL,
  booking_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_status TEXT DEFAULT 'pending',
  booking_source TEXT DEFAULT 'qr_code',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Examples

### 1. Basic Checkout Button
```tsx
import CheckoutButton from "@/components/stripe/CheckoutButton";

<CheckoutButton
  activityId={123}
  providerId="provider_123"
  amount={100.00}
  participants={2}
>
  Book Now - $100.00
</CheckoutButton>
```

### 2. QR Code Checkout (with establishment)
```tsx
<CheckoutButton
  activityId={123}
  providerId="provider_123"
  establishmentId="est_456" // This triggers partner commission
  amount={100.00}
  participants={2}
  customerId="customer_789"
>
  Book via QR Code - $100.00
</CheckoutButton>
```

### 3. Custom Commission Rate
```tsx
<CheckoutButton
  activityId={123}
  providerId="provider_123"
  amount={100.00}
  participants={2}
  commissionPercent={15} // Custom 15% commission
>
  Book Now - $100.00
</CheckoutButton>
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Webhook Idempotency**: Prevents duplicate processing of webhook events
2. **Transfer Retry Logic**: Failed transfers are logged and can be retried
3. **Database Rollback**: Failed operations are properly logged
4. **User Notifications**: Payment failures are tracked and can trigger notifications

## Testing

### Webhook Testing with Stripe CLI
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook events
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
stripe trigger transfer.failed
```

### Test Cards
- **Success**: 4242424242424242
- **Decline**: 4000000000000002
- **Insufficient Funds**: 4000000000009995

## Security Considerations

1. **Webhook Signature Verification**: All webhooks are verified using Stripe signatures
2. **Environment Variables**: Sensitive keys are stored in environment variables
3. **Raw Body Parsing**: Webhook endpoint properly handles raw body for signature verification
4. **Database Validation**: All database operations include proper validation

## Monitoring and Logging

The implementation logs:
- All webhook events and their processing status
- Failed transfers with error messages
- Payment failures with detailed error information
- Account status updates for providers and partners

## Next Steps

1. Set up Stripe webhook endpoint in Stripe Dashboard
2. Configure provider and partner Stripe Connect accounts
3. Test the complete flow in Stripe test mode
4. Monitor webhook events and transfer success rates
5. Implement email notifications for booking confirmations
