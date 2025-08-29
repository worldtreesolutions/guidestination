# Commission Payout Alternatives for Thailand

## Problem
Stripe Express Connect accounts are not available in Thailand, which affects our automatic commission payout system for establishment referrals.

## Current Commission Structure (✅ Working)
- **Platform Fee**: 20% of booking total
- **Provider Amount**: 80% of booking total (unchanged)
- **Referral Commission**: 10% of booking total (50% of platform fee when booking comes from QR referral)
- **Platform Net**: 10% of booking total (when referral exists) or 20% (when no referral)

## Alternative Solutions

### Option 1: Manual Commission Dashboard (Recommended for MVP)

**How it works:**
1. Keep existing commission calculation API
2. Store commission data in database 
3. Create admin dashboard for manual payouts
4. Generate monthly commission reports
5. Process payouts via bank transfer/local payment methods

**Advantages:**
- No dependency on Stripe Connect
- Full control over payout timing
- Works with local Thai banking
- Simpler compliance requirements
- Can batch payments monthly

**Implementation:**
- ✅ Commission calculation already implemented
- 📋 Need: Admin dashboard for commission tracking
- 📋 Need: Monthly payout reports
- 📋 Need: Commission status tracking (pending/paid)

### Option 2: Local Thai Payment Gateway

**Options:**
- **2C2P**: Thai payment gateway with marketplace features
- **OmiseGO**: Thai-based payment platform
- **SCB Easy**: Siam Commercial Bank's payment solution
- **PromptPay**: Thailand's instant payment system

**Implementation complexity:** High
**Timeline:** 2-3 months integration

### Option 3: Cryptocurrency/Stablecoin Payouts

**How it works:**
- Calculate commissions in THB
- Convert to USDC/USDT
- Send to establishment crypto wallets
- Establishments can convert to THB locally

**Advantages:**
- Instant payouts
- Lower fees than traditional banking
- Works globally

**Disadvantages:**
- Requires crypto adoption by establishments
- Regulatory uncertainty in Thailand
- Technical complexity

### Option 4: Manual Bank Transfers (Simplest)

**How it works:**
1. Generate monthly commission reports
2. Admin manually processes bank transfers
3. Update commission status in database
4. Send confirmation to establishments

**Advantages:**
- No technical integration needed
- Works with any Thai bank
- Full control and transparency

**Disadvantages:**
- Manual process
- Slower payouts
- Requires admin time

## Recommended Implementation Plan

### Phase 1: Manual Commission System (Week 1)
1. ✅ Keep existing commission calculation
2. 📋 Create commission tracking dashboard
3. 📋 Add commission status fields to database
4. 📋 Generate monthly payout reports

### Phase 2: Automation (Month 2-3)
1. Integrate with Thai payment gateway (2C2P or OmiseGO)
2. Automate monthly payout processing
3. Add email notifications for payouts

### Phase 3: Optimization (Month 4+)
1. Real-time payout options
2. Multi-currency support
3. Advanced reporting and analytics

## Database Schema Updates Needed

```sql
-- Add commission tracking fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_amount DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS referral_commission DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS referred_by_establishment TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS has_referral BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_calculated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_paid_at TIMESTAMP WITH TIME ZONE;

-- Create establishment payouts tracking table
CREATE TABLE IF NOT EXISTS establishment_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id TEXT NOT NULL,
  payout_period TEXT NOT NULL, -- '2024-01', '2024-02', etc.
  total_bookings INTEGER DEFAULT 0,
  total_commission_amount DECIMAL(10,2) DEFAULT 0,
  payout_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed'
  payout_method TEXT DEFAULT 'bank_transfer',
  payout_reference TEXT, -- Bank reference number
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);
```

## Immediate Action Items

1. **Update Stripe service** to remove Connect dependencies
2. **Create commission dashboard** for manual tracking
3. **Add payout status tracking** to bookings
4. **Generate monthly reports** for establishments
5. **Set up manual payout workflow**

This approach maintains all the referral tracking and commission calculation logic we've built while providing a practical payout solution for the Thai market.
