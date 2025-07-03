# Stripe Testing Guide for Guidestination

## 🧪 Complete Testing Strategy

This guide will help you thoroughly test your Stripe implementation and commission splitting before going live.

## 1. 🚀 Quick Testing Setup

### A. Access Test Pages
- **Checkout Testing**: `/test/stripe-checkout`
- **Transaction Monitor**: `/test/transaction-monitor`

### B. Environment Setup
Ensure your `.env.local` has test keys:
```env
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 2. 🎯 Test Scenarios

### Scenario 1: Standard Booking (No QR Code)
**Expected Commission Split:**
- Provider: 80% ($80.00)
- Guidestination: 20% ($20.00)

**Test Steps:**
1. Go to `/test/stripe-checkout`
2. Load "Standard Booking" scenario
3. Click "Test Checkout"
4. Use test card: `4242424242424242`
5. Complete payment
6. Verify in `/test/transaction-monitor`

### Scenario 2: QR Code Booking (With Partner)
**Expected Commission Split:**
- Provider: 80% ($80.00)
- Partner: 10% ($10.00)
- Guidestination: 10% ($10.00)

**Test Steps:**
1. Load "QR Code Booking" scenario
2. Ensure `establishmentId` is filled
3. Complete checkout process
4. Verify partner commission transfer

### Scenario 3: Failed Payment
**Test Steps:**
1. Use decline card: `4000000000000002`
2. Verify session status updates to "failed"
3. Check webhook events are logged

### Scenario 4: Custom Commission Rate
**Test Steps:**
1. Load "Custom Commission" scenario (15%)
2. Verify commission calculations
3. Complete payment and verify splits

## 3. 🔍 Verification Checklist

### Database Verification
Check these tables in Supabase:

#### stripe_checkout_sessions
```sql
SELECT 
  stripe_session_id,
  amount,
  commission_percent,
  status,
  establishment_id,
  created_at
FROM stripe_checkout_sessions
ORDER BY created_at DESC;
```

#### stripe_transfers
```sql
SELECT 
  recipient_type,
  recipient_id,
  amount,
  status,
  error_message,
  created_at
FROM stripe_transfers
ORDER BY created_at DESC;
```

#### stripe_webhook_events
```sql
SELECT 
  event_type,
  processed,
  error_message,
  created_at
FROM stripe_webhook_events
ORDER BY created_at DESC;
```

### Commission Calculation Verification
For a $100 booking with 20% commission:

**Standard Booking:**
- Total: $100.00
- Provider: $80.00 (80%)
- Platform: $20.00 (20%)

**QR Code Booking:**
- Total: $100.00
- Provider: $80.00 (80%)
- Partner: $10.00 (10% - half of platform commission)
- Platform: $10.00 (10% - remaining half)

## 4. 🛠️ Webhook Testing

### Using Stripe CLI
```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test specific events
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
stripe trigger transfer.failed
```

### Manual Webhook Testing
1. Complete a test checkout
2. Check `/test/transaction-monitor` for webhook events
3. Verify all events are marked as "processed"
4. Check for any error messages

## 5. 🧮 Commission Calculation Testing

### Test Different Amounts
Test with various amounts to ensure calculations are correct:

| Amount | Commission % | Provider | Partner (QR) | Platform (QR) | Platform (Standard) |
|--------|-------------|----------|--------------|---------------|-------------------|
| $50.00 | 20% | $40.00 | $5.00 | $5.00 | $10.00 |
| $100.00 | 20% | $80.00 | $10.00 | $10.00 | $20.00 |
| $250.00 | 15% | $212.50 | $18.75 | $18.75 | $37.50 |
| $500.00 | 25% | $375.00 | $62.50 | $62.50 | $125.00 |

### Verify Calculations
Use the commission calculator on `/test/stripe-checkout` to verify:
1. Enter test amount and commission percentage
2. Click "Calculate Commission Breakdown"
3. Verify amounts match expected values
4. Test both with and without establishment ID

## 6. 🔄 End-to-End Testing Flow

### Complete Test Flow
1. **Setup**: Configure test data on `/test/stripe-checkout`
2. **Calculate**: Verify commission breakdown
3. **Checkout**: Complete Stripe checkout process
4. **Webhook**: Verify webhook processing
5. **Database**: Check data in `/test/transaction-monitor`
6. **Transfers**: Verify partner transfers (if applicable)

### Success Criteria
✅ Checkout session created successfully
✅ Payment processed correctly
✅ Webhook events received and processed
✅ Commission calculations are accurate
✅ Database records are created
✅ Partner transfers initiated (for QR bookings)
✅ No error messages in logs

## 7. 🚨 Error Testing

### Test Error Scenarios
1. **Invalid Provider**: Use non-existent provider ID
2. **Declined Card**: Use `4000000000000002`
3. **Insufficient Funds**: Use `4000000000009995`
4. **Network Issues**: Disconnect internet during checkout

### Expected Behaviors
- Graceful error handling
- Proper error messages to users
- Failed transactions logged correctly
- No partial commission splits on failed payments

## 8. 📊 Monitoring & Logging

### What to Monitor
- Checkout session success rate
- Webhook processing success rate
- Transfer success rate
- Commission calculation accuracy
- Error rates and types

### Key Metrics
- Total transaction volume
- Commission amounts by type
- Failed payment rate
- Partner commission distribution
- Processing time for webhooks

## 9. 🔐 Security Testing

### Webhook Security
1. Verify webhook signature validation
2. Test with invalid signatures
3. Ensure idempotency protection works
4. Test duplicate event handling

### Data Protection
1. Verify sensitive data is not logged
2. Check environment variable protection
3. Ensure proper error message sanitization

## 10. 🚀 Pre-Production Checklist

Before going live:
- [ ] All test scenarios pass
- [ ] Commission calculations verified
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Production API keys configured
- [ ] Error handling tested
- [ ] Monitoring dashboard functional
- [ ] Database backups configured
- [ ] Support team trained on transaction monitoring

## 11. 📞 Troubleshooting

### Common Issues
1. **Webhook not received**: Check endpoint URL and Stripe dashboard
2. **Commission incorrect**: Verify calculation logic and test data
3. **Transfer failed**: Check partner Stripe account setup
4. **Session not found**: Verify database connection and table structure

### Debug Tools
- Use `/test/transaction-monitor` for real-time monitoring
- Check browser console for client-side errors
- Review server logs for API errors
- Use Stripe Dashboard for payment details

Your Stripe implementation is now ready for comprehensive testing! 🎉