# Scope — WIM Fleetbase V1

## In scope for V1

### GooVi Replacement (Sales Visit Management)

| Feature | Fleetbase Primitive | Notes |
|---|---|---|
| **Sales check-in/check-out** | Driver tracking + geofence events | Rep tracks position at depot; geofence fires `entered`/`exited` events |
| **Depot photo on arrival/departure** | Custom attachment on driver tracking event | Photo field attached to position/track payload |
| **Visit card (route-based)** | Route with waypoints (Places) | Daily route = Fleetbase Route; waypoints = stores in visit order |
| **In-route / out-route selection** | Route assignment + ad-hoc Place creation | Out-route = new Place + zone, flagged as off-route |
| **Route presets by day & week** | Route schedule (4-week cycle, 5-day week) | Import route plans; Fleetbase stores Routes by date |
| **NOO (New Outlet Opening)** | Place creation via API | Lat/lng, name, owner, channel, category, contact person, vehicle type, postal code, NIK, NPWP |
| **10m geofence check-in** | Zone (circular polygon, 10m radius) | `trigger_on_entry: true`, `trigger_on_exit: true` |
| **OTP verification (optional)** | WhatsApp-based OTP to store owner's WA | External integration — Fleetbase webhook → WhatsApp gateway |
| **Visit reason (no order)** | Order `status = "no-order"` with reason field | Meta field on order payload: `reason` |
| **3-minute minimum before submit** | Frontend-enforced timer | Fleetbase Navigator doesn't support this natively — custom frontend logic |
| **Visit completion enforcement** | Explicit "Selesai Kunjungan" button; pending orders survive timeout/crash | Orders must NEVER be silently deleted on incomplete visit (GooVi deletes forgot-checkout visits — a core pain) |
| **Barcode scan from KlikOrder** | Custom QR code on order creation | Fleetbase generates order reference; QR encodes order ID |
| **Store stock tracking** | Custom entity or meta on Place | Per-SKU stock remaining, recorded during visit — **simple one-tap UX required** (current GooVi UX too cramped → reps skip it, stock analysis unusable) |
| **Selfie photo (attendance)** | Attachment on tracking event | Front/back camera option, linked to check-in event |
| **Additional visit photos (spanduk/flyer)** | Multi-attachment on visit event | Photos with description field |
| **Route map for sales** | Navigator view / Fleetbase map | Show store locations on a map interface |

### KlikOrder Replacement (Order Management)

| Feature | Fleetbase Primitive | Notes |
|---|---|---|
| **Product catalog** | Product/Entity catalog | Import Sanqua product list into Fleetbase Entities |
| **Brand-based store pages** | Product categories + brands | Filter products by brand (Sanqua, etc.) |
| **Cart with bundling programs** | Order entity line items | Bundling = auto-add free entity when quantity threshold met |
| **Promo visibility** | Product meta: `promo_price`, `promo_period` | Promo data visible to sales rep during order creation |
| **Checkout process** | Order creation (`status: pending`) | Customer = Contact (store owner), payload = order items |
| **Payment (COD)** | Order `payment_method = "cod"` | Meta field |
| **Barcode generation** | Order `public_id` as QR code | QR encodes order reference for warehouse scanning |
| **Order history** | Order query (GET /v1/orders) | Full order details including promo/free items |
| **Export to Excel** | API → CSV/XLSX export | Custom export script |
| **Out-of-route ordering** | Order with `meta.off_route_reason` | QR code generation for out-route orders requires reason |
| **Admin order creation** | Direct order creation via API or console | Scan store barcode, same workflow as sales |
| **Packing list** | Route → Payload → Entity aggregation | Invoice/vehicle-level packing list |
| **Delivery note / invoice PDF** | Custom PDF export per order | Mass PDF download (multiple orders) |

### GooVi Super Admin Features

| Feature | Fleetbase Equivalent |
|---|---|
| Dashboard statistics | Fleetbase console dashboard |
| Visit monitoring (daily/monthly export) | Geofence events log + custom report |
| Visit recap per sales member | Route/visit query grouped by driver |
| Attendance & photo check-in | Event log with photo attachments |
| Visit gallery | Event attachments browser |
| Activity recap | Event log |
| Store stock tracking | Per-store entity stock query |
| Out-of-route orders | Orders with `meta.off_route` flag |
| Route visualization (map) | Fleetbase map with route waypoints overlay |
| Sales portfolio analysis | Driver → Places → Orders aggregation |
| Depot performance analysis | Group by depot → sales metrics |
| Store stock performance (order vs stock) | Order quantity vs stock quantity per store |
| Employee data management | User + Driver model |
| Vehicle data management | Vehicle model in Fleetbase |
| Route plan import & management | Route import (CSV) + schedule |
| User session tracking | Fleetbase auth logs |
| Depot brand access | Company → depot → brand permission model |

### KlikOrder Super Admin Features

| Feature | Fleetbase Equivalent |
|---|---|
| Order data export | Order API → CSV/XLSX |
| Mass PDF download (surat jalan) | Custom PDF generation per order |
| Admin order entry | Fleetbase console order creation |
| Promo settings | Custom Promo model or meta field |
| Catalog promo download | Product catalog with promo prices |
| **Packing list download** | Route → payload → entity aggregation |
| **Promo config self-service** | Custom Promo model (WIM sets programs in-app) | Currently vendor-controlled; WIM wants full control |
| **Clean promo/bonus export** | Entity lines tagged `is_bonus`, promo name + ref | Product lines and bonus lines exported separately with readable promo names |

## Out of scope for V1

- Real-time GPS fleet tracking (beyond visit check-in)
- Route optimization / AI dispatch (OSRM handles navigation between fixed stops)
- Payroll / commission calculation from sales data
- Accounting / ERP integration
- Direct-to-consumer e-commerce
- Multi-language support (all in Bahasa Indonesia)
- Native mobile app development (Fleetbase Navigator + custom web frontend)
- 3rd-party logistics integration (courier, shipping)

## Future / later

- Commission/incentive auto-calculation from visit + order data
- ERP integration (Xero, Jurnal, or Sanqua's accounting system)
- Mobile app deep-linking / attendance via NFC
- Sales target assignment & tracking
- Real-time stock level sync with warehouse
- Automated WhatsApp order confirmation to store owners
- Photo/video evidence for proof-of-delivery (Navigator already supports this)