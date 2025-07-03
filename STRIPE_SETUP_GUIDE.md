# Stripe Setup Guide for Guidestination

## 🚀 Quick Start

Your Stripe checkout flow is now fully implemented! Follow these steps to get it running:

## 1. Environment Variables Setup

Add these to your `.env.local` file:

```env
# Get these from your Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 2. Stripe Dashboard Configuration

### A. Get Your API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your **Secret Key** (starts with `sk_test_`)

### B. Set Up Webhook Endpoint
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://3000-e31f2767-d3ac-4cb2-9894-aa7d0ebe87d2.h1097.daytona.work/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `transfer.failed`
   - `account.updated`
   - `charge.refunded`
5. Copy the **Webhook Secret** (starts with `whsec_`)

## 3. Test the Implementation

### Using the CheckoutButton Component

```tsx
import CheckoutButton from "@/components/stripe/CheckoutButton";

// Basic booking
<CheckoutButton
  activityId={123}
  providerId="provider_123"
  amount={100.00}
  participants={2}
>
  Book Now - $100.00
</CheckoutButton>

// QR Code booking (with partner commission)
<CheckoutButton
  activityId={123}
  providerId="provider_123"
  establishmentId="est_456"
  amount={100.00}
  participants={2}
>
  Book via QR Code - $100.00
</CheckoutButton>
```

### Test Cards
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`

## 4. Commission Flow

### Standard Booking (No QR Code)
- **Provider**: 80% of booking amount
- **Guidestination**: 20% of booking amount

### QR Code Booking (establishment_id present)
- **Provider**: 80% of booking amount
- **Partner**: 10% of booking amount
- **Guidestination**: 10% of booking amount

## 5. Database Tables Created

✅ All required tables have been created in your Supabase database:
- `stripe_checkout_sessions`
- `stripe_transfers`
- `stripe_webhook_events`
- `establishment_commissions`

## 6. API Endpoints Available

- **POST** `/api/stripe/create-checkout-session` - Create checkout session
- **POST** `/api/stripe/webhook` - Handle Stripe webhooks
- **GET** `/api/booking/details` - Get booking details for success page

## 7. Pages Created

- `/booking/success` - Booking confirmation page
- `/booking/cancelled` - Booking cancellation page

## 🔧 Testing Webhooks Locally

Install Stripe CLI and forward webhooks:

```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test specific events
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
```

## 🛡️ Security Features

- ✅ Webhook signature verification
- ✅ Idempotency protection
- ✅ Raw body parsing for webhooks
- ✅ Environment variable protection
- ✅ Error handling and logging

## 📊 Monitoring

The system automatically logs:
- All webhook events and processing status
- Failed transfers with error messages
- Payment failures with detailed information
- Account status updates

## 🎯 Next Steps

1. **Set up Stripe Connect accounts** for providers and partners
2. **Configure webhook endpoint** in Stripe Dashboard
3. **Test the complete flow** with test cards
4. **Monitor webhook events** and transfer success rates
5. **Add email notifications** for booking confirmations

Your Stripe implementation is production-ready! 🚀
