
# 🚨 Quick Fix for Stripe Checkout Error

## The Problem
You're getting "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" when testing Stripe checkout.

## The Solution
This error means the API is returning an HTML error page instead of JSON. Here's how to fix it:

### Step 1: Add Stripe API Keys
1. **Create `.env.local` file** in your project root (if it doesn't exist)
2. **Add your Stripe test keys**:

```env
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 2: Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to **Developers > API Keys**
4. Copy your **Secret Key** (starts with `sk_test_`)
5. Paste it in your `.env.local` file

### Step 3: Test the Fix
1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Go to the test page**: `/test/stripe-checkout`

3. **Click "Test Checkout"** with these settings:
   - Amount: $100.00
   - Provider ID: test_provider_123
   - Leave establishment ID empty for now

4. **Use test card**: `4242424242424242`

### Step 4: Verify It's Working
✅ You should be redirected to Stripe's checkout page  
✅ After payment, you'll see the success page  
✅ Check `/test/transaction-monitor` to see the transaction  

## Still Having Issues?

### Check Your Browser Console
1. Press F12 to open DevTools
2. Go to Network tab
3. Click checkout button
4. Look for the API request to see the actual error

### Check Your Terminal
Look for error messages in your terminal where `npm run dev` is running.

### Common Issues:
- **Missing .env.local file**: Create it in your project root
- **Wrong API key**: Make sure it starts with `sk_test_`
- **Server not restarted**: Always restart after changing .env.local

## Test Cards for Different Scenarios
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`

Your Stripe checkout should work perfectly after adding the API keys! 🎉
