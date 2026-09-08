# Project Charter — WIM Fleetbase

## Product, in one sentence

Deploy a self-hosted Fleetbase LSOS (Logistics Supply-Chain OS) to replace **KlikOrder** (order management) and **GooVi** (sales visit management) as the single unified operations platform for PT Wahana Inti Mas (Sanqua Group distribution arm).

## Who it's for

- **Primary:** WIM management / super admins — monitoring, reporting, analytics
- **Daily operators:** ~90+ sales reps (confirmed by live data: 90 sales involved in out-of-route orders alone) — visit check-ins, order taking, store stock tracking
- **Depot admin:** route planning, employee & vehicle management, admin order entry
- **Secondary:** WIM leadership — portfolio analytics, performance dashboards

## What problem does it solve

**Current state (the complaint):** KlikOrder and Groovi are **not synchronized**. Sales data in Groovi is untrustworthy because sales reps can misinput in one system and the data doesn't cross-validate. Key problems:

1. **Data not synced** — Groovi visit data and KlikOrder order data live in separate silos. No cross-validation that a visit's claimed order actually exists in KlikOrder.
2. **No barcode verification** — when a sales rep inputs an order > 0, KlikOrder generates a barcode but there's **no verification** that the barcode's order number matches what was actually realized. Sales can enter a fake order.
3. **Username locked** — KlikOrder doesn't let admins change usernames, forcing a hard guarantee that staff turnover doesn't compromise account access. This is a pain point for managing staff changes.
4. **No promo data in history** — KlikOrder order history shows product details but **no promo or free product data**, making it impossible to audit promotional effectiveness.
5. **Manual coordination** — route planning, stock tracking, orders, and attendance are across two separate tools with no automation bridge.
6. **Out-of-route orders bypassing the system** — live data reveals 1,365 out-of-route orders tracked, with **694 (51%) placed via WA/Telepon** instead of the app. This means reps are actively avoiding the order flow for off-route stores, defeating KlikOrder's tracking.
7. **Username/staff name cannot be changed freely** — technically the API supports PATCH `/users/{id}`, but the vendor blocks username changes for **billing reasons** (7-day minimum charge per user — changing the name resets the billing cycle). This is a vendor policy lock, not a technical limitation.

## Success metrics

| Metric | Target |
|---|---|
| Single source of truth for orders + visits | 100% — every order links to a verified visit event |
| Barcode/order verification | Every order > 0 has a verified KlikOrder-equivalent check |
| Unified reporting | All visit + order data in one exportable dashboard |
| Route-to-order audit trail | Every route waypoint → visit event → order is traceable |
| Admin overhead reduction | Eliminate dual-system data entry |

## Owner

Reinhart Tanto (Rein) — project oversight, Fleetbase deployment, data migration, integration.

## Non-goals (explicitly NOT in scope)

- Building a custom mobile app from scratch (Fleetbase Navigator + custom frontend instead)
- Replacing Sanqua Group's ERP or accounting system
- Real-time GPS fleet tracking beyond visit check-in geofencing
- Route optimization / AI dispatch (OSRM navigation between fixed ordered stops is sufficient)
- E-commerce / direct-to-consumer ordering
- Payment gateway integration (COD is the norm)

## Cost / risk motivation for self-hosting

The current GooVi + KlikOrder setup carries recurring costs and operational risks that Fleetbase eliminates:

| Item | Current cost | Fleetbase |
|---|---|---|
| OTP verification | ~Rp500 per OTP | Zero (self-hosted WhatsApp gateway or toggle) |
| Admin accounts | ~Rp50k/seat/month per user | Zero (self-hosted) |
| Driver module | Additional per-account fee | Included (Fleetbase Navigator) |
| Server SLA | None — no compensation when down | Full uptime control (own infrastructure) |
| Single-session lockout | Support intervention needed | Multi-device tolerance |
| Storage limit (photos) | Limited — auto-deletes after ~3 months | Self-managed storage |
| Two apps licensing | GooVi + KlikOrder separate | Single Fleetbase instance