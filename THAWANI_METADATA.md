# Customer Metadata Implementation - Rayan Design

## Overview
We are passing all required customer information (name, email, phone) in the `metadata` field when creating Thawani checkout sessions.

## Implementation Details

### API Endpoint
```
POST https://uatcheckout.thawani.om/api/v1/checkout/session
```

### Request Headers
```
Content-Type: application/json
thawani-api-key: <SECRET_KEY>
```

### Request Body Structure
```json
{
  "client_reference_id": "67a1b2c3d4e5f6g7h8i9j0k1",
  "mode": "payment",
  "products": [
    {
      "name": "Product Name",
      "unit_amount": 5000,
      "quantity": 1
    }
  ],
  "success_url": "https://www.rayiandesign.com/ar/payment/success?order_id=...",
  "cancel_url": "https://www.rayiandesign.com/ar/payment/cancel?order_id=...",
  "metadata": {
    "Customer name": "Omar",
    "Customer email": "customer@example.com",
    "Customer phone": "+96812345678",
    "order_id": "67a1b2c3d4e5f6g7h8i9j0k1"
  }
}
```

## Code Implementation

### File: `app/api/thawani/create-session/route.ts` (Lines 76-81)
```typescript
metadata: {
    'Customer name': customerInfo.name,
    'Customer email': customerInfo.email,
    'Customer phone': customerInfo.phone,
    'order_id': order._id.toString(),
}
```

### File: `lib/thawani.ts` (Lines 70-94)
```typescript
export async function createCheckoutSession(
    payload: CreateCheckoutSessionPayload
): Promise<CheckoutSessionResponse> {
    try {
        const response = await fetch(`${THAWANI_API_BASE_URL}/checkout/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'thawani-api-key': THAWANI_SECRET_KEY,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.description || 'Failed to create checkout session');
        }

        return data;
    } catch (error) {
        console.error('Thawani checkout session creation error:', error);
        throw error;
    }
}
```

## Customer Metadata Fields

As required by Thawani production checklist, we pass:

1. ✅ **Customer name** - `metadata['Customer name']`
2. ✅ **Contact number** - `metadata['Customer phone']`
3. ✅ **Email address** - `metadata['Customer email']`

Additional field for internal tracking:
- **Order ID** - `metadata['order_id']`

## Validation

Customer information is validated before creating the session:

```typescript
// Validation check (Lines 18-20)
if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
    return errorResponse('Missing required customer info: name, email, phone', 400);
}
```

## Example Request Log
```javascript
{
  orderId: "679abc123def456ghi789jkl",
  totalOMR: 5.000,
  totalBaisa: 5000,
  products: [
    {
      name: "Educational Template - Arabic Version",
      unit_amount: 5000,
      quantity: 1
    }
  ],
  metadata: {
    "Customer name": "Omar Al-Kindi",
    "Customer email": "Omar@example.com",
    "Customer phone": "+96899999999",
    "order_id": "679abc123def456ghi789jkl"
  }
}
```

## Production Checklist Compliance

-  SSL Certificate: Active on rayiandesign.com
-  Customer metadata: Implemented as shown above
-  Payment display: Shows "Accepts card payments" message

---

**Website:** https://www.rayiandesign.com
**Webhook URL:** https://www.rayiandesign.com/api/thawani/webhook
**Environment:** UAT (Testing) - Ready to move to Production