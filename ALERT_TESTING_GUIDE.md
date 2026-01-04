# Alert Testing Guide

This document lists all situations where Alert messages are displayed in the LOOMI PMS application.

## ✅ Currently Implemented with Alert Component

### 1. **New Property Form** (`/properties/new`)
**Location:** `apps/web/src/app/properties/new/new-property-client.tsx`

#### Success Alerts:
- **"Property created successfully!"**
  - **Trigger:** Property is successfully created
  - **Test:** Go to `/properties/new`, fill in all fields, click "Create Property"
  - **Expected:** Green success alert appears, then redirects to `/properties` after 1.5 seconds

#### Error Alerts:
- **"Failed to create property"**
  - **Trigger:** API call fails when creating property
  - **Test:** Simulate API failure or network error
  - **Expected:** Red destructive alert appears

---

### 2. **New Contact Form** (`/people/new`)
**Location:** `apps/web/src/app/people/new/new-contact-client.tsx`

#### Success Alerts:
- **"Contact created successfully!"**
  - **Trigger:** Contact is successfully created
  - **Test:** Go to `/people/new`, fill in required fields, click "Create Contact"
  - **Expected:** Green success alert appears, then redirects to `/people` after 1.5 seconds

#### Error Alerts:
- **"Failed to create contact"**
  - **Trigger:** API call fails when creating contact
  - **Test:** Simulate API failure or network error
  - **Expected:** Red destructive alert appears

---

### 3. **New Charge Form** (`/charges/new`)
**Location:** `apps/web/src/app/charges/new/new-charge-client.tsx`

#### Success Alerts:
- **"Charge created successfully!"**
  - **Trigger:** Charge is successfully created
  - **Test:** Go to `/charges/new`, fill in all fields, click "Create Charge"
  - **Expected:** Green success alert appears, then redirects to `/charges` after 1.5 seconds

#### Error Alerts:
- **"Failed to create charge. Please try again."**
  - **Trigger:** API call fails when creating charge
  - **Test:** Simulate API failure or network error
  - **Expected:** Red destructive alert appears

---

### 4. **Resident Portal** (`/resident`)
**Location:** `apps/web/src/app/resident/resident-portal-client.tsx`

#### Error Alerts:
- **"No outstanding charges to pay"**
  - **Trigger:** Click "Pay Now" button when there are no charges
  - **Test:** Go to `/resident`, click "Pay Now" button without any charges
  - **Expected:** Red destructive alert appears at top of page

- **"Failed to process payment. Please try again."**
  - **Trigger:** Payment processing fails (API error)
  - **Test:** Simulate API failure or network error during payment
  - **Expected:** Red destructive alert appears

#### Success Alerts:
- **"Payment processing would be handled by PaymentProvider integration"**
  - **Trigger:** Payment processing succeeds
  - **Test:** Go to `/resident`, click "Pay Now" with charges present
  - **Expected:** Green success alert appears at top of page

**Auto-dismiss:** All alerts auto-dismiss after 5 seconds

---

### 5. **Webhooks Settings** (`/settings/webhooks`)
**Location:** `apps/web/src/app/settings/webhooks/webhooks-client.tsx`

#### Error Alerts:
- **"Please enter a webhook URL"**
  - **Trigger:** Click "Create Webhook" without entering a URL
  - **Test:** Go to `/settings/webhooks`, click "Create Webhook" with empty URL field
  - **Expected:** Red destructive alert appears

- **"Please select at least one event"**
  - **Trigger:** Click "Create Webhook" without selecting any events
  - **Test:** Enter a URL but don't select any events, then click "Create Webhook"
  - **Expected:** Red destructive alert appears

- **"Failed to create webhook. Please try again."**
  - **Trigger:** API call fails when creating webhook
  - **Test:** Simulate API failure (disconnect network, wrong endpoint, etc.)
  - **Expected:** Red destructive alert appears

#### Success Alerts:
- **"Webhook created successfully"**
  - **Trigger:** Webhook is successfully created
  - **Test:** Fill in URL, select events, click "Create Webhook" (if API is working)
  - **Expected:** Green success alert appears

**Auto-dismiss:** All alerts auto-dismiss after 5 seconds

---

## ⚠️ Currently Using `alert()` (Needs Migration)

### 6. **Sign In Page** (`/auth/signin`)
**Location:** `apps/web/src/app/auth/signin/page.tsx`

- **Error States:** 
  - "Invalid email or password"
  - "An error occurred. Please try again."
- **Trigger:** Wrong credentials or API error
- **Test:** Try to sign in with wrong credentials
- **Status:** Uses `error` state but may not use Alert component

---

### 7. **Onboarding Page** (`/onboarding`)
**Location:** `apps/web/src/app/onboarding/page.tsx`

- **Error:** "Failed to create organization. Please try again."
- **Trigger:** Failed to create organization during onboarding
- **Test:** Try to create organization with invalid data
- **Status:** Uses `error` state but may not use Alert component

---

## 📋 Quick Test Checklist

### ✅ Test These (Currently Working):

1. **New Property - Success**
   - Navigate to `/properties/new`
   - Fill in all fields (name, address, city, state, zip, type)
   - Click "Create Property"
   - ✅ Should see green alert: "Property created successfully!"
   - ✅ Should redirect to `/properties` after 1.5 seconds

2. **New Property - Error**
   - Navigate to `/properties/new`
   - Try to create property with invalid data or simulate API failure
   - ✅ Should see red alert: "Failed to create property"

3. **New Contact - Success**
   - Navigate to `/people/new`
   - Fill in required fields (type, first name, last name)
   - Click "Create Contact"
   - ✅ Should see green alert: "Contact created successfully!"
   - ✅ Should redirect to `/people` after 1.5 seconds

4. **New Contact - Error**
   - Navigate to `/people/new`
   - Try to create contact with invalid data or simulate API failure
   - ✅ Should see red alert: "Failed to create contact"

5. **New Charge - Success**
   - Navigate to `/charges/new`
   - Fill in all fields (property, type, description, amount, due date)
   - Click "Create Charge"
   - ✅ Should see green alert: "Charge created successfully!"
   - ✅ Should redirect to `/charges` after 1.5 seconds

6. **New Charge - Error**
   - Navigate to `/charges/new`
   - Try to create charge with invalid data or simulate API failure
   - ✅ Should see red alert: "Failed to create charge. Please try again."

7. **Resident Portal - No Charges Error**
   - Navigate to `/resident`
   - Click "Pay Now" button
   - ✅ Should see red alert: "No outstanding charges to pay"

2. **Resident Portal - Payment Success**
   - Navigate to `/resident` (with charges)
   - Click "Pay Now" button
   - ✅ Should see green alert: "Payment processing would be handled..."

3. **Webhooks - Empty URL Error**
   - Navigate to `/settings/webhooks`
   - Click "Create Webhook" without URL
   - ✅ Should see red alert: "Please enter a webhook URL"

10. **Webhooks - No Events Error**
   - Navigate to `/settings/webhooks`
   - Enter URL but don't select events
   - Click "Create Webhook"
   - ✅ Should see red alert: "Please select at least one event"

11. **Webhooks - Success**
   - Navigate to `/settings/webhooks`
   - Enter valid URL: `https://example.com/webhook`
   - Select at least one event
   - Click "Create Webhook"
   - ✅ Should see green alert: "Webhook created successfully" (if API works)

### 🔄 Test These (May Need Migration):

12. **Sign In - Error**
   - Navigate to `/auth/signin`
   - Enter wrong credentials
   - Check if error alert appears

13. **Onboarding - Error**
    - Navigate to `/onboarding`
    - Try to create organization with invalid data
    - Check if error alert appears

---

## 🎨 Alert Variants Available

1. **Default (Info)** - Blue/neutral styling
2. **Destructive (Error)** - Red styling with `variant="destructive"`
3. **Success** - Green styling (custom className)
4. **Warning** - Yellow styling (custom className)
5. **Info** - Blue styling (custom className)

---

## 📝 Notes

- All alerts in Resident Portal and Webhooks auto-dismiss after 5 seconds
- Alerts appear at the top of the page content area
- Error alerts use red destructive variant
- Success alerts use custom green styling
- Icons are included (AlertCircle, CheckCircle, etc.)

---

## 🔧 To Add More Alerts

1. Import Alert components:
```tsx
import { Alert, AlertTitle, AlertDescription } from '@loomi/ui';
import { AlertCircle } from 'lucide-react';
```

2. Add state:
```tsx
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);
```

3. Display in JSX:
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

4. Set error/success:
```tsx
setError('Your error message');
setTimeout(() => setError(null), 5000); // Auto-dismiss
```

