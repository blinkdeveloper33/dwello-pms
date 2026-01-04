# Original Requirements Checklist - Complete Review

Based on the original prompt requirements, here's a comprehensive checklist of what was requested and current status:

---

## PHASE 3 — Money In (AR light + Resident Portal)

### ✅ API Complete:
1. ✅ Charges posting wizard (rent/dues/assessments) + recurring schedules
   - API: `POST /api/charges` with `recurringSchedule` support
   - API: `POST /api/charges/:id/generate-recurring` to generate instances
   - **MISSING:** UI wizard page (`/charges/new`)

2. ✅ Resident portal (web/PWA shell):
   - **MISSING:** `/resident` or `/portal` page
   - **MISSING:** Balance view (API exists: `GET /api/charges/resident/:contactId/balance`)
   - **MISSING:** Pay now button (PaymentProvider stub)
   - **MISSING:** Receipts list
   - **MISSING:** Documents access
   - **MISSING:** Submit maintenance request

3. ✅ Payments recorded + receipt PDF generation
   - API: `POST /api/payments` with transaction boundaries
   - API: `GET /api/payments/:id/receipt` (stub - returns PDF URL)
   - **MISSING:** Actual PDF generation (currently stub)

### Acceptance Criteria:
- ✅ Post charges to a unit → resident sees balance → payment recorded → receipt downloadable
  - **API:** ✅ Complete
  - **UI:** ❌ Missing resident portal

---

## PHASE 4 — Maintenance + Inbox

### ✅ API Complete:
1. ✅ Work orders end-to-end:
   - ✅ Resident submits request with photos + permission to enter (API supports `attachmentIds` and `permissionToEnter`)
   - ✅ PM triage (board/kanban), assign vendor, schedule, status updates, closeout
   - **MISSING:** UI triage board/kanban (`/maintenance` - basic list exists, needs kanban)
   - **MISSING:** UI work order submission form (for residents)

2. ✅ Unified Inbox:
   - ✅ New work order creates inbox item (API: `GET /api/communications/inbox`)
   - ✅ SLA overdue creates escalation item (logic exists in inbox-client.tsx)
   - ✅ UI: `/inbox` page created ✅

3. ⚠️ Notifications (provider stub ok):
   - **MISSING:** Notification service stub
   - **MISSING:** Status updates send resident notifications

### Acceptance Criteria:
- ✅ Resident submits WO → PM assigns vendor → resident receives update → timeline + audit entries visible
  - **API:** ✅ Complete
  - **UI:** ⚠️ Partial (list exists, needs detail page with timeline)

---

## PHASE 5 — Communications Hub

### ✅ API Complete:
1. ✅ Announcement composer (rich text) + templates
   - API: `POST /api/communications/templates`
   - API: `POST /api/communications`
   - **MISSING:** UI composer (`/communications/new`)
   - **MISSING:** Rich text editor integration

2. ✅ Audience targeting (property, building, unit tags, role types)
   - API supports `propertyId` and `contactIds` array
   - **MISSING:** UI targeting interface

3. ✅ Scheduled sends + delivery logs + unsubscribes
   - API: `scheduledAt` field supported
   - API: Delivery tracking via `deliveries` relation
   - **MISSING:** UI delivery logs viewer
   - **MISSING:** UI unsubscribe management

### Acceptance Criteria:
- ✅ Send announcement to one property → delivery logs recorded → opt-out respected
  - **API:** ✅ Complete
  - **UI:** ⚠️ Partial (list exists, needs composer)

---

## PHASE 6 — HOA/Condo Pack (feature-flagged)

### ✅ API Complete:
1. ✅ Violations:
   - ✅ Log violation, attach proof, send notice, apply fine, progressive enforcement
   - API: `POST /api/hoa/violations`
   - API: `POST /api/hoa/violations/:id/steps` (progressive steps)
   - API: `POST /api/hoa/violations/:id/fines`
   - **MISSING:** UI violations management (`/hoa/violations`)

2. ✅ ARC:
   - ✅ Resident submission, board approval queue, request-changes, decision letter generator
   - API: `POST /api/hoa/architectural-requests`
   - API: `POST /api/hoa/architectural-requests/:id/approvals`
   - **MISSING:** UI ARC submission form
   - **MISSING:** UI board approval queue (`/hoa/arc`)

3. ✅ Amenities:
   - ✅ Reservation calendar + rules (blackouts, max duration, deposit rules)
   - API: `POST /api/hoa/amenities` with `rules` JSON field
   - API: `POST /api/hoa/reservations`
   - **MISSING:** UI amenities calendar (`/hoa/amenities`)

### Acceptance Criteria:
- ✅ Board member can approve ARC with full audit trail
  - **API:** ✅ Complete (approvals tracked)
  - **UI:** ❌ Missing
- ✅ Violation can progress warning→fine→escalation based on rules
  - **API:** ✅ Complete (steps system)
  - **UI:** ❌ Missing

---

## PHASE 7 — Accounting Pro Pack (feature-flagged)

### ✅ API Complete:
1. ✅ COA editor + journals + AP bills approvals
   - API: `GET /api/accounting/accounts` (COA)
   - API: `POST /api/accounting/journals` (double-entry validated)
   - API: `PUT /api/accounting/ap-bills/:id` (approval workflow)
   - **MISSING:** UI COA editor (`/accounting/accounts`)
   - **MISSING:** UI journal entry form (`/accounting/journals/new`)
   - **MISSING:** UI AP bills approval queue

2. ✅ Bank import CSV + reconciliation workspace (match/approve)
   - API: `POST /api/accounting/bank-accounts/:id/transactions` (ready for CSV parsing)
   - API: `POST /api/accounting/reconciliations` (reconciliation workspace)
   - API: `POST /api/accounting/reconciliations/:id/lines` (match transactions)
   - **MISSING:** CSV parsing logic in API
   - **MISSING:** UI bank CSV import (`/accounting/bank-accounts/:id/import`)
   - **MISSING:** UI reconciliation workspace (`/accounting/reconciliations/:id`)

3. ✅ Owner statements + payout batches (optional MVP)
   - API: `POST /api/accounting/owner-statements`
   - API: `POST /api/accounting/payout-batches`
   - **MISSING:** UI owner statements view
   - **MISSING:** UI payout batches management

### Acceptance Criteria:
- ✅ Import bank CSV → match transactions → finalize reconciliation session → audit logged
  - **API:** ⚠️ Partial (CSV parsing missing)
  - **UI:** ❌ Missing

---

## ENTERPRISE FOUNDATION (stubs early, full later)

### ✅ API Complete:
- ✅ API keys + rate limits per plan
  - API: `POST /api/enterprise/api-keys` (returns key once)
  - **MISSING:** UI API keys management (`/settings/api-keys`)
- ✅ Webhooks outbox with retries
  - API: `GET /api/enterprise/webhooks/outbox`
  - **MISSING:** UI webhook outbox viewer
- ⚠️ IP allowlist settings (enforced on API)
  - **MISSING:** API enforcement logic
  - **MISSING:** UI IP allowlist settings
- ✅ Audit export endpoint (CSV)
  - API: `GET /api/enterprise/audit-logs` (can be extended for CSV export)
  - **MISSING:** CSV export endpoint

### Acceptance Criteria:
- ✅ API key can be created; calls rate-limited; webhook retries visible in admin UI
  - **API:** ✅ Complete
  - **UI:** ❌ Missing

---

## QUALITY / PERFORMANCE / DX REQUIREMENTS

### ✅ Completed:
- ✅ Transaction boundaries for financial writes (payments use Prisma transactions)
- ✅ Index critical DB columns (org_id, property_id, status, created_at) - all indexed in schema

### ❌ Missing:
1. ❌ Server-side pagination on all grids
   - ✅ Charges endpoint has pagination
   - ❌ All other endpoints need pagination (work-orders, payments, communications, etc.)

2. ❌ Structured logs with correlation IDs
   - **MISSING:** Correlation ID middleware
   - **MISSING:** Structured logging setup

3. ❌ Seed script: demo org with 2 properties (rental + HOA), 20 units, sample residents/board/vendors, sample charges + work orders + violations
   - ✅ Has 2 properties (rental + HOA)
   - ✅ Has 20 units
   - ⚠️ Has some contacts but needs more (residents/board/vendors)
   - ❌ Missing sample charges
   - ❌ Missing sample work orders
   - ❌ Missing sample violations

4. ❌ Tests: auth, RBAC, quota enforcement, post charges, create work order, ARC approval
   - **MISSING:** All tests

---

## DELIVERABLES

### ✅ Completed:
- ✅ Working web app + API with Swagger
- ✅ README: local dev, env vars, seed (in docs/)
- ✅ Seed data (partial - needs enhancement)

### ❌ Missing:
- ❌ Minimal critical tests
- ❌ After each Phase: checklist of DONE / NEXT and show key URLs/routes to verify

---

## SUMMARY OF MISSING ITEMS

### Critical UI Pages Missing:
1. `/charges/new` - Charges posting wizard
2. `/resident` or `/portal` - Resident portal (balance, pay, receipts, documents, maintenance)
3. `/maintenance/[id]` - Work order detail page with timeline
4. `/communications/new` - Announcement composer with rich text editor
5. `/hoa/violations` - Violations management
6. `/hoa/arc` - ARC board approval queue
7. `/hoa/amenities` - Amenities reservation calendar
8. `/accounting/accounts` - COA editor
9. `/accounting/journals/new` - Journal entry form
10. `/accounting/bank-accounts/:id/import` - Bank CSV import
11. `/accounting/reconciliations/:id` - Reconciliation workspace
12. `/settings/api-keys` - API keys management
13. `/settings/webhooks` - Webhooks configuration

### Quality Requirements Missing:
1. Pagination on all list endpoints
2. Structured logging with correlation IDs
3. Enhanced seed script (charges, work orders, violations)
4. Critical tests (auth, RBAC, quotas, charges, work orders, ARC)

### Features Missing:
1. PDF receipt generation (currently stub)
2. CSV parsing for bank imports
3. Notification service stub
4. IP allowlist enforcement
5. Audit log CSV export endpoint

