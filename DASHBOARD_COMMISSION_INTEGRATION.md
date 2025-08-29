# Dashboard Application - Commission Payout Integration for Thailand

## Overview
Since Stripe Connect accounts are not available in Thailand, this system implements a manual commission payout workflow where:
1. **Main Application** tracks QR referrals and calculates commissions
2. **Dashboard Application** processes manual payouts via Thai banking system

## Current API Endpoints Available

### 1. GET `/api/commissions/report?period=YYYY-MM`
**Purpose**: Fetch commission data for dashboard processing

**Response Format**:
```typescript
interface CommissionReport {
  reportPeriod: string;
  totalEstablishments: number;
  totalCommissionsPending: number;
  totalCommissionsPaid: number;
  establishments: {
    establishmentId: string;
    establishmentName: string;
    totalBookings: number;
    totalCommissionAmount: number;
    bookingDetails: {
      bookingId: string;
      bookingDate: string;
      bookingAmount: number;
      commissionAmount: number;
      commissionStatus: string;
    }[];
  }[];
  generatedAt: string;
}
```

**Example API Call**:
```bash
curl -X GET "https://your-app.com/api/commissions/report?period=2025-01"
```

### 2. POST `/api/commissions/mark-paid`
**Purpose**: Mark commissions as paid after bank transfer

**Request Format**:
```typescript
interface MarkCommissionPaidRequest {
  establishmentId: string;
  bookingIds: string[];
  payoutReference: string; // Bank transfer reference
  payoutAmount: number;
  payoutDate: string;
  payoutMethod: 'bank_transfer' | 'promptpay' | 'check';
  notes?: string;
}
```

**Example API Call**:
```bash
curl -X POST "https://your-app.com/api/commissions/mark-paid" \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "est_123",
    "bookingIds": ["booking_1", "booking_2"],
    "payoutReference": "TXN202501140001",
    "payoutAmount": 1500.00,
    "payoutDate": "2025-01-14",
    "payoutMethod": "bank_transfer",
    "notes": "Monthly commission payout - January 2025"
  }'
```

## Dashboard Application Requirements

### 1. Commission Overview Page
```typescript
// Dashboard component example
import React, { useState, useEffect } from 'react';

const CommissionOverview = () => {
  const [report, setReport] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');

  const fetchReport = async (period) => {
    const response = await fetch(`https://main-app.com/api/commissions/report?period=${period}`);
    const data = await response.json();
    setReport(data);
  };

  const processPayouts = async (establishment) => {
    const payoutData = {
      establishmentId: establishment.establishmentId,
      bookingIds: establishment.bookingDetails.map(b => b.bookingId),
      payoutReference: generateBankReference(),
      payoutAmount: establishment.totalCommissionAmount,
      payoutDate: new Date().toISOString().split('T')[0],
      payoutMethod: 'bank_transfer'
    };

    const response = await fetch('https://main-app.com/api/commissions/mark-paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payoutData)
    });

    if (response.ok) {
      alert('Payout processed successfully!');
      fetchReport(selectedPeriod); // Refresh data
    }
  };

  return (
    <div>
      <h1>Commission Payouts - Thailand</h1>
      <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
        <option value="2025-01">January 2025</option>
        <option value="2024-12">December 2024</option>
      </select>
      
      {report?.establishments.map(establishment => (
        <div key={establishment.establishmentId}>
          <h3>{establishment.establishmentName}</h3>
          <p>Commission: ฿{establishment.totalCommissionAmount.toLocaleString()}</p>
          <button onClick={() => processPayouts(establishment)}>
            Process Bank Transfer
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 2. Thai Banking Integration Options

#### Option A: Manual Bank Transfer (Current)
```typescript
const generateBankReference = () => {
  return `TXN${Date.now()}`;
};

const processBankTransfer = async (establishment, amount) => {
  // Manual process:
  // 1. Admin logs into bank portal
  // 2. Creates transfer to establishment account
  // 3. Gets reference number
  // 4. Updates system via API
  
  const reference = prompt('Enter bank transfer reference:');
  if (reference) {
    await markCommissionPaid(establishment.id, reference, amount);
  }
};
```

#### Option B: SCB Easy API Integration
```typescript
const scbTransfer = async (establishment, amount) => {
  const transferData = {
    accountFrom: 'YOUR_BUSINESS_ACCOUNT',
    accountTo: establishment.bankAccount,
    amount: amount,
    currency: 'THB',
    reference: `Commission-${establishment.id}-${Date.now()}`
  };

  const response = await fetch('https://api.scbeasy.com/v1/transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transferData)
  });

  return response.json();
};
```

#### Option C: PromptPay Integration
```typescript
const promptPayTransfer = async (establishment, amount) => {
  const promptPayData = {
    receiverPromptPayId: establishment.promptPayId,
    amount: amount,
    reference: `Commission-${establishment.id}`
  };

  // Use PromptPay API or QR code generation
  const qrCode = generatePromptPayQR(promptPayData);
  return qrCode;
};
```

### 3. Database Schema Updates Required

Before full implementation, update the main application database:

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
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payout_reference TEXT;

-- Create establishment bank details table
CREATE TABLE IF NOT EXISTS establishment_bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  bank_code TEXT,
  branch_code TEXT,
  promptpay_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commission payouts tracking table
CREATE TABLE IF NOT EXISTS commission_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id TEXT NOT NULL,
  booking_ids TEXT[] NOT NULL,
  payout_reference TEXT NOT NULL,
  payout_amount DECIMAL(10,2) NOT NULL,
  payout_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payout_method TEXT NOT NULL,
  status TEXT DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Commission Calculation Logic (Already Implemented)

The main application already has the commission calculation:

```typescript
// 20% platform fee, 10% goes to establishment if booking from QR referral
const calculateCommissionBreakdown = (bookingTotal, referralData) => {
  const platformFee = bookingTotal * 0.20; // 20% platform fee
  const hasReferral = !!referralData;
  
  let referralCommission = 0;
  let platformNet = platformFee;
  
  if (hasReferral) {
    referralCommission = platformFee * 0.50; // 50% of platform fee = 10% of booking
    platformNet = platformFee - referralCommission; // Platform keeps 10% net
  }
  
  const providerAmount = bookingTotal - platformFee; // Provider gets 80%
  
  return {
    bookingTotal,
    platformFee,
    platformNet,
    referralCommission,
    providerAmount,
    referredByEstablishment: referralData?.establishmentId,
    hasReferral
  };
};
```

## Implementation Steps for Dashboard

1. **Phase 1: Basic Dashboard** (Week 1)
   - Create commission overview page
   - Integrate with existing APIs
   - Manual payout recording

2. **Phase 2: Bank Integration** (Week 2-3)
   - Add establishment bank details management
   - Integrate with Thai banking APIs
   - Automated transfer processing

3. **Phase 3: Advanced Features** (Week 4+)
   - Bulk payout processing
   - Email notifications
   - Audit reports
   - Tax documentation

## Testing the Integration

```bash
# Test commission report API
curl -X GET "http://localhost:3003/api/commissions/report?period=2025-01"

# Test mark-paid API
curl -X POST "http://localhost:3003/api/commissions/mark-paid" \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "test_est_123",
    "bookingIds": ["booking_1"],
    "payoutReference": "TEST_TXN_001",
    "payoutAmount": 100.00,
    "payoutDate": "2025-01-14",
    "payoutMethod": "bank_transfer"
  }'
```

This integration approach allows your dashboard application to handle commission payouts manually while maintaining the referral tracking and commission calculation in the main application.
