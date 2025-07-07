
# Admin Portal API Integration Guide

This guide explains how to connect your external admin portal to this Guidestination system to access commission tracking data.

## Overview

The Guidestination system exposes REST API endpoints that your external admin portal can call to:
- Retrieve commission invoices with detailed information
- Get commission statistics and analytics
- Update invoice payment statuses
- Manage provider commission data

## Authentication

All admin API endpoints require an API key for authentication:

```
Header: X-API-Key: your-secret-api-key
```

### Setup API Key

1. Add the API key to your environment variables in this system:
```env
ADMIN_API_KEY=your-super-secret-admin-api-key-here
```

2. Use the same API key in your external admin portal when making requests.

## Available API Endpoints

### 1. Get Commission Invoices
**Endpoint:** `GET /api/admin/commission/invoices`

**Query Parameters:**
- `provider_id` (optional): Filter by specific provider
- `status` (optional): Filter by status (pending, paid, overdue, cancelled)
- `establishment_id` (optional): Filter by establishment (for QR bookings)
- `start_date` (optional): Filter from date (ISO format)
- `end_date` (optional): Filter to date (ISO format)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```javascript
const response = await fetch('https://your-guidestination-domain.com/api/admin/commission/invoices?status=pending&limit=20', {
  headers: {
    'X-API-Key': 'your-secret-api-key'
  }
});

const data = await response.json();
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "uuid",
        "invoice_number": "INV-202501-0001",
        "booking_id": 123,
        "provider_id": "uuid",
        "total_booking_amount": 1000,
        "platform_commission_amount": 200,
        "partner_commission_amount": 100,
        "invoice_status": "pending",
        "due_date": "2025-01-21T00:00:00Z",
        "is_qr_booking": true,
        "provider": {
          "business_name": "Adventure Tours Co",
          "email": "provider@example.com",
          "phone": "+66123456789"
        },
        "establishment": {
          "name": "Luxury Hotel Bangkok",
          "email": "hotel@example.com"
        },
        "booking": {
          "customer_email": "customer@example.com",
          "booking_date": "2025-01-07T10:00:00Z"
        },
        "activity": {
          "title": "Bangkok City Tour",
          "location": "Bangkok, Thailand"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### 2. Get Commission Statistics
**Endpoint:** `GET /api/admin/commission/stats`

**Query Parameters:**
- `start_date` (optional): Statistics from date
- `end_date` (optional): Statistics to date
- `provider_id` (optional): Stats for specific provider

**Example Request:**
```javascript
const response = await fetch('https://your-guidestination-domain.com/api/admin/commission/stats?start_date=2025-01-01', {
  headers: {
    'X-API-Key': 'your-secret-api-key'
  }
});
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalInvoices": 150,
    "totalCommissionAmount": 45000,
    "paidInvoices": 120,
    "pendingInvoices": 25,
    "overdueInvoices": 5,
    "totalPaidAmount": 36000,
    "totalPendingAmount": 9000
  }
}
```

### 3. Update Invoice Status
**Endpoint:** `PUT /api/admin/commission/update-status`

**Request Body:**
```json
{
  "invoice_id": "uuid",
  "status": "paid",
  "payment_data": {
    "amount": 200,
    "method": "bank_transfer",
    "reference": "TXN123456789",
    "stripe_payment_intent_id": "pi_xxx" // optional
  }
}
```

**Example Request:**
```javascript
const response = await fetch('https://your-guidestination-domain.com/api/admin/commission/update-status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-secret-api-key'
  },
  body: JSON.stringify({
    invoice_id: 'invoice-uuid-here',
    status: 'paid',
    payment_data: {
      amount: 200,
      method: 'bank_transfer',
      reference: 'BANK_TXN_123456'
    }
  })
});
```

### 4. Get Providers with Commission Data
**Endpoint:** `GET /api/admin/commission/providers`

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_name": "Adventure Tours Co",
      "email": "provider@example.com",
      "phone": "+66123456789",
      "created_at": "2024-01-01T00:00:00Z",
      "commission_stats": {
        "total_invoices": 25,
        "total_commission": 5000,
        "paid_commission": 4000,
        "pending_commission": 1000,
        "paid_invoices": 20,
        "pending_invoices": 5
      }
    }
  ]
}
```

## Integration Steps for Your Admin Portal

### 1. Environment Setup
Add these environment variables to your admin portal:

```env
GUIDESTINATION_API_URL=https://your-guidestination-domain.com
GUIDESTINATION_API_KEY=your-super-secret-admin-api-key-here
```

### 2. Create API Service
Create a service in your admin portal to handle API calls:

```javascript
// services/guidestinationApi.js
class GuidestinationAPI {
  constructor() {
    this.baseURL = process.env.GUIDESTINATION_API_URL;
    this.apiKey = process.env.GUIDESTINATION_API_KEY;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get commission invoices
  async getCommissionInvoices(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/admin/commission/invoices?${params}`);
  }

  // Get commission statistics
  async getCommissionStats(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/admin/commission/stats?${params}`);
  }

  // Update invoice status
  async updateInvoiceStatus(invoiceId, status, paymentData = null) {
    return this.request('/api/admin/commission/update-status', {
      method: 'PUT',
      body: JSON.stringify({
        invoice_id: invoiceId,
        status,
        payment_data: paymentData
      })
    });
  }

  // Get providers
  async getProviders() {
    return this.request('/api/admin/commission/providers');
  }
}

export default new GuidestinationAPI();
```

### 3. Usage Examples in Your Admin Portal

```javascript
// In your admin portal components
import guidestinationAPI from './services/guidestinationApi';

// Get pending invoices
const pendingInvoices = await guidestinationAPI.getCommissionInvoices({
  status: 'pending',
  limit: 50
});

// Mark invoice as paid
await guidestinationAPI.updateInvoiceStatus(
  'invoice-uuid',
  'paid',
  {
    amount: 200,
    method: 'bank_transfer',
    reference: 'BANK_TXN_123'
  }
);

// Get commission statistics
const stats = await guidestinationAPI.getCommissionStats({
  start_date: '2025-01-01',
  end_date: '2025-01-31'
});
```

## Security Considerations

1. **API Key Security**: Store the API key securely and never expose it in client-side code
2. **HTTPS Only**: Always use HTTPS for API communications
3. **Rate Limiting**: Consider implementing rate limiting on both sides
4. **IP Whitelisting**: Consider restricting API access to specific IP addresses
5. **Audit Logging**: Log all admin API access for security auditing

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (invalid API key)
- `405`: Method Not Allowed
- `500`: Internal Server Error

## Testing the Integration

1. Set up the API key in both systems
2. Test each endpoint using curl or Postman
3. Implement error handling in your admin portal
4. Test the full workflow: fetch invoices → update status → verify changes

This integration allows your external admin portal to have full control over the commission system while keeping the data synchronized with the main Guidestination platform.
