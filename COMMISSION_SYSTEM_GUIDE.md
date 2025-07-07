
# 🏆 Commission System Implementation Guide

## Overview
Your Guidestination platform now has a complete commission tracking and invoicing system designed for multi-vendor booking operations in Thailand and France using Stripe Standard Connect.

## 🎯 System Features

### Core Functionality
- **20% Platform Commission** on all bookings
- **50% Partner Share** for QR code bookings (hotels/establishments)
- **Automatic Invoice Generation** after successful payments
- **Stripe Payment Links** for easy commission payments
- **Admin Dashboard** for complete system management
- **QR Code Tracking** for hotel/establishment partnerships

### Payment Flow
1. **Customer Books** → Payment goes directly to activity provider's Stripe account
2. **Webhook Triggers** → Commission invoice automatically created
3. **Provider Notified** → Email with invoice and Stripe Payment Link
4. **Provider Pays** → Via Stripe Payment Link or bank transfer
5. **Admin Tracks** → All payments and statuses in dashboard

## 📊 Commission Calculation

### Regular Booking (€1000)
- Platform Commission: €200 (20%)
- Provider Receives: €800 (80%)

### QR Code Booking (€1000)
- Platform Commission: €200 (20%)
- Partner Share: €100 (50% of platform commission)
- Platform Net: €100
- Provider Receives: €800 (80%)

## 🔧 Technical Implementation

### Database Tables Created
- `commission_invoices` - Invoice records
- `commission_payments` - Payment tracking
- `stripe_webhook_events` - Webhook logging

### API Endpoints
- `/api/stripe/create-commission-payment-link` - Generate payment links
- `/api/stripe/commission-webhook` - Handle Stripe webhooks

### Services
- `commissionService.ts` - Core commission logic
- `invoiceService.ts` - Invoice and payment processing

## 🎮 Admin Dashboard

### Access
Navigate to `/admin/commission` for the complete admin interface.

### Features
- View all commission invoices
- Filter by provider, status, establishment
- Generate Stripe Payment Links
- Mark invoices as paid manually
- View commission statistics
- Track overdue payments

## 🔗 Integration Points

### Booking Process
When a booking is made, include these metadata fields:
```javascript
{
  type: "booking_payment",
  booking_id: "12345",
  provider_id: "provider-uuid",
  establishment_id: "hotel-uuid", // Optional, for QR bookings
  is_qr_booking: "true" // String boolean
}
```

### Webhook Configuration
Set up Stripe webhooks to point to:
```
https://your-domain.com/api/stripe/commission-webhook
```

Required events:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## 🧪 Testing

### Test Dashboard
Visit `/test/commission-system` to test the system functionality.

### Test Functions
- Commission calculation testing
- Invoice generation logic
- System status monitoring

## 🌍 Multi-Country Support

### Currency Handling
- France: EUR (Euro)
- Thailand: THB (Thai Baht)
- Configurable in payment link creation

### Stripe Connect
- Uses Stripe Standard Connect
- Direct payments to provider accounts
- Platform commission collected separately

## 📧 Email Integration

### Invoice Emails
Providers receive emails with:
- Invoice details
- Payment due date
- Stripe Payment Link
- Payment instructions

### Implementation Notes
Email service integration ready for:
- SendGrid
- Mailgun
- Supabase Edge Functions

## 🔐 Security Features

### Webhook Security
- Stripe signature verification
- Event deduplication
- Error logging and monitoring

### Payment Security
- Secure Stripe Payment Links
- Metadata validation
- Payment intent tracking

## 📈 Monitoring & Analytics

### Commission Statistics
- Total invoices and amounts
- Paid vs pending breakdown
- Overdue invoice tracking
- Provider-specific metrics

### Webhook Logging
All webhook events logged with:
- Event type and ID
- Processing status
- Error messages
- Full payload data

## 🚀 Production Deployment

### Environment Variables Required
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_COMMISSION_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Database Setup
All required tables are automatically created via Supabase migrations.

### Webhook Endpoints
Configure in Stripe Dashboard:
- Endpoint URL: `https://your-domain.com/api/stripe/commission-webhook`
- Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🎯 Usage Examples

### Create Commission Invoice (Automatic)
```typescript
// Triggered by webhook after successful booking payment
await commissionService.createCommissionInvoice({
  bookingId: 12345,
  providerId: "provider-uuid",
  totalAmount: 500,
  isQrBooking: true,
  establishmentId: "hotel-uuid"
});
```

### Generate Payment Link
```typescript
// Create Stripe Payment Link for commission
const paymentLink = await invoiceService.createStripePaymentLink(invoice);
```

### Process Payment
```typescript
// Handle successful commission payment
await invoiceService.processCommissionPayment({
  invoiceId: "invoice-uuid",
  paymentAmount: 100,
  paymentMethod: "stripe_payment_link",
  stripePaymentIntentId: "pi_..."
});
```

## 🎉 System Status: PRODUCTION READY

Your commission system is fully implemented and ready for production use with:
- ✅ Automatic commission tracking
- ✅ Invoice generation and management
- ✅ Stripe payment processing
- ✅ Admin dashboard
- ✅ QR code integration
- ✅ Multi-country support
- ✅ Comprehensive error handling
- ✅ Security and monitoring

The system handles all your requirements for Thailand and France operations with Stripe Standard Connect!
