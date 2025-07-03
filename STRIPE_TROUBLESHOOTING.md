
# Stripe Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**What it means:** The API is returning an HTML error page instead of JSON.

**Causes:**
1. Missing environment variables
2. Server-side errors in the API endpoint
3. TypeScript compilation errors

**Solutions:**

#### 1. Check Environment Variables
Make sure your `.env.local` file has:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### 2. Verify API Endpoint
Test the API directly:
```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "activityId": 123,
    "providerId": "test_provider",
    "amount": 100,
    "participants": 2,
    "successUrl": "http://localhost:3000/booking/success",
    "cancelUrl": "http://localhost:3000/booking/cancelled"
  }'
```

#### 3. Check Server Logs
Look for errors in your terminal where Next.js is running.

#### 4. Browser Developer Tools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click the checkout button
4. Check the API request response

### Issue: Stripe API Version Errors

**Solution:** Update Stripe API version in your code:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use this version
});
```

### Issue: Database Table Not Found

**Error:** `relation "stripe_checkout_sessions" does not exist`

**Solution:** Create the required tables in Supabase:

```sql
-- Create stripe_checkout_sessions table
CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
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

-- Create stripe_transfers table
CREATE TABLE IF NOT EXISTS stripe_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id UUID REFERENCES stripe_checkout_sessions(id),
  stripe_transfer_id TEXT,
  recipient_type TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stripe_webhook_events table
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
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

### Issue: TypeScript Compilation Errors

**Solution:** Fix type issues:

1. **Metadata Type Error:**
```typescript
// ❌ Wrong
const metadata: StripeCheckoutMetadata = { ... };

// ✅ Correct
const metadata: Record<string, string> = { ... };
```

2. **API Version Error:**
```typescript
// ✅ Use supported API version
apiVersion: "2023-10-16"
```

### Issue: Webhook Signature Verification Failed

**Causes:**
1. Wrong webhook secret
2. Body parsing issues
3. Missing raw body

**Solution:**
1. Verify webhook secret in Stripe Dashboard
2. Ensure raw body parsing is disabled:
```typescript
export const config = {
  api: {
    bodyParser: false,
  },
};
```

### Issue: CORS Errors

**Solution:** Add CORS headers if needed:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

## 🔧 Testing Steps

### 1. Basic API Test
```bash
# Test if API is responding
curl http://localhost:3000/api/stripe/create-checkout-session
```

### 2. Environment Variables Test
```javascript
// Add this to your API endpoint temporarily
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY starts with sk_:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_'));
```

### 3. Stripe Connection Test
```javascript
// Test Stripe initialization
try {
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
  });
  console.log('Stripe initialized successfully');
} catch (error) {
  console.error('Stripe initialization failed:', error);
}
```

## 📋 Debugging Checklist

- [ ] Environment variables are set correctly
- [ ] Stripe API keys are valid and start with `sk_test_`
- [ ] API endpoint returns JSON (not HTML)
- [ ] No TypeScript compilation errors
- [ ] Database tables exist in Supabase
- [ ] Network requests are successful in browser DevTools
- [ ] Server logs show no errors

## 🆘 Quick Fixes

### 1. Restart Development Server
```bash
npm run dev
```

### 2. Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### 3. Check Package Versions
```bash
npm list stripe
npm list @types/stripe
```

### 4. Reinstall Dependencies
```bash
npm install stripe@latest
```

## 📞 Getting Help

If you're still having issues:

1. **Check the browser console** for client-side errors
2. **Check the server terminal** for server-side errors
3. **Test the API directly** with curl or Postman
4. **Verify environment variables** are loaded correctly
5. **Check Stripe Dashboard** for any account issues

Your Stripe implementation should work perfectly once these issues are resolved! 🎉
