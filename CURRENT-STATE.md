# Current State — WIM Fleetbase

> Ledger of project progress. Updated after each feature addition.

## Status: AUTH SYSTEM LIVE

**Last updated:** 2026-09-08

### Gates

| Gate | Status | Started | Completed |
|---|---|---|---|
| G0 — Foundation & Infrastructure | ✅ COMPLETE | 2026-09-01 | 2026-09-07 |
| G1 — Core Data Setup | ✅ COMPLETE | 2026-09-07 | 2026-09-07 |
| G2 — Route & Visit Workflow | ✅ COMPLETE | 2026-09-07 | 2026-09-08 |
| G3 — Order Management | 🔴 NOT STARTED | — | — |
| G4 — Reporting & Admin | ✅ COMPLETE | 2026-09-08 | 2026-09-08 |
| G5 — Go-Live & Migration | 🔴 NOT STARTED | — | — |

### Auth System (NEW)

Sales reps log into WIM Online with **email + password**. API keys are stored server-side and injected into Fleetbase API calls automatically.

| Component | Details |
|---|---|
| **Database** | WIM Auth tables (`wim_auth.users`, `wim_auth.sessions`) inside Fleetbase's existing MySQL |
| **Auth endpoints** | `POST /api/auth/login` → returns session cookie + user info |
| | `GET /api/auth/session` → validates cookie, returns user |
| | `POST /api/auth/logout` → destroys session |
| **Password hashing** | SHA256 (password + salt) |
| **Session lifetime** | 7 days |
| **API key injection** | Server injects user's `fleetbase_api_key` into Authorization header on `/v1/*` proxy calls |
| **Admin user** | `reinharttanto@gmail.com` / `wimadmin2026` (role: admin) |

### G0 — Infrastructure

| Checklist | Status |
|---|---|
| Proxmox LXC 106 (4C/6GB/24GB, privileged, nest=1) | ✅ Running |
| Docker Compose (8 services: API, Console, MySQL, Redis, Socket, Queue, Scheduler, HTTPD) | ✅ All up |
| Console (:4200) | ✅ HTTP 200 |
| API (:8000) | ✅ Responding |
| API Proxy (port 8080 → `/v1/*` → localhost:8000) | ✅ Working |
| WIM Auth (MySQL `wim_auth.*` tables) | ✅ Seeded with admin user |
| Domain: fleet.sqa.web.id | ⏳ DNS not yet pointed |

### G1 — Core Data

| Item | Count | Details |
|---|---|---|
| Stores | 5 | TOKO BERKAH, JAYA, MAKMUR, SEJAHTERA, BARU |
| Geofence Zones | 3 | 10m radius circle polygons, active |
| Products | 8 | SANQUA (5), LEVONTE (1), BATAVIA (2) |
| Driver | 1 | Andi Sales (active, slug: andi-sales) |
| Vehicle | 1 | Motor Andi (B 1234 ABC) |
| Contacts | 4 | Linked to store owners |
| Orders | 3 | Test orders with various statuses |

### G2 — Frontend Pages Deployed

All custom frontend served at **http://192.168.6.223:8080**

| Page | URL | Features |
|---|---|---|
| **Login** | `/index.html` | Email + password auth against WIM Auth DB. No API key management needed |
| **Dashboard** | `/dashboard.html` | Stats grid, today's date, store list, session-based auth redirect |
| **Absensi** | `/absensi.html` | Clock in/out with GPS, duration tracking |
| **Kunjungan** | `/visit-card.html` | In-Rute / Luar-Rute filter, store detail modal, 3-min timer, check-in, selfie (wajib) + extra photos, stock, order, no-order with Lainnya text input. Tambah Toko Luar Rute search modal |
| **NOO** | `/noo.html` | 14+ field form, GPS auto-detect, creates Place + Contact via Fleetbase API |
| **Admin** | `/admin.html` | Manage stores, pengguna, orders, products |
| **Laporan** | `/report.html` | KPIs, period selector, 4 export buttons (JSON + CSV) |

### G2 — Frontend Architecture

| File | Purpose |
|---|---|
| `js/config.js` | Centralized config: auth endpoints, app name, feature flags |
| `js/api.js` | Fleetbase API client + `WIM_LOGGER` (browser console + server log) |
| `js/app.js` | Session helpers (checkOrRedirect, login, logout), VisitTimer, camera, download utils |
| `css/app.css` | Mobile-first responsive design system (WIM brand colors) |
| `serve.py` | HTTP server: static files + API proxy + **auth endpoints** + server-side logging |

### G2 — Auth Flow

```
Browser                         Server(:8080)                   Fleetbase API(:8000)
  │                                  │                              │
  │ POST /api/auth/login             │                              │
  │ {email, password}                │                              │
  │ ───────────────────────────────► │                              │
  │                                  │ Verify against               │
  │                                  │ wim_auth.users (MySQL)       │
  │                                  │                              │
  │ ◄── Set-Cookie: wim_session=xxx  │                              │
  │     {user, role, driver_id}      │                              │
  │                                  │                              │
  │ GET /dashboard.html              │                              │
  │ ───────────────────────────────► │                              │
  │                                  │                              │
  │ GET /api/auth/session            │                              │
  │ Cookie: wim_session=xxx          │                              │
  │ ───────────────────────────────► │                              │
  │ ◄── {user, role, driver_id}     │                              │
  │                                  │                              │
  │ GET /v1/places                   │                              │
  │ Cookie: wim_session=xxx          │                              │
  │ ───────────────────────────────► │                              │
  │                                  │ Forward + inject API key     │
  │                                  │ Authorization: Bearer flb_…  │
  │                                  │ ───────────────────────────► │
  │                                  │ ◄── [stores data]           │
  │ ◄── [stores data]               │                              │
```

### Git History

| Commit | Description |
|---|---|
| Next | Server-side auth: email/password login, session management, API key injection via MySQL |
| `e69bad9` | Add absensi page + luar rute store adding + bottom nav fix + docs update |
| `5c77d81` | Fix API resilience: Promise.allSettled, geofence pagination |
| `e8dde7c` | Create central config.js for all API keys |
| `c2c6200` | Add WIM_LOGGER: browser console + server-side log file |
| `ba1513f` | Fix: bottom nav, WIM Online, photo flow, alasan lainnya, API key login |
| `5226d29` | Build custom frontend: 7 responsive HTML pages |
| `af543b2` | Add scaling section for 200+ concurrent users |
| `067b404` | Add QA Testing Guidebook PDF (19 pages) |
| `6088d5f` | Mark G0 and G1 complete |
| `ca4f5a9` | Initial commit — WIM constitution pack |