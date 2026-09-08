# Data Model — WIM Fleetbase

## Core Entities

### Company (Fleetbase\Models\Company)
- WIM as a single company
- Contains all depots, users, drivers, places, orders

### Depot (custom or via Company segmentation)
- Physical distribution center (e.g., Depo Tapos, Depo Bintaro)
- Linked to users, drivers, vehicles, routes
- **Depots may be split by program type** (TO vs SPC same city = separate depots) so promo programs don't clash
- **Per-depot brand access** — a depot's sales reps only see brands/products the depot is authorized for

### User (Fleetbase\Models\User)
- Super admin (WIM management) — full console access
- Depot admin — limited to their depot's data
- Driver/sales rep — no console access, authenticated via API

### Roles (GooVi/KlikOrder taxonomy)
- **Role types:** Sales, Driver, Helper, Kepala Depo, Kepala Gudang, Admin Depo, Admin Wilayah
- **Jenis sales** (sub-type filter): SPG, TO (Trade Outlet), Motoris, SMD, SPC, Kanvaser
- All personnel have Fleetbase User accounts; order-writing permissions limited to roles that place orders

### Driver (Fleetbase\FleetOps\Models\Driver)
- Each sales rep is a Driver
- Linked to a User account
- Assigned to a Depot
- Tracking: GPS position via `POST /v1/drivers/{id}/track`

### Place (Fleetbase\FleetOps\Models\Place)
- **Store** (customer location) — lat/lng, address, city, country
- Attributes: name, owner name, channel, category, contact person, vehicle type, postal code, NIK, NPWP
- `type: "store"` for retail outlets

### Contact (Fleetbase\FleetOps\Models\Contact)
- Store owner / PIC
- Linked to Place via `place_uuid`
- Phone number (for OTP via WhatsApp)
- `type: "customer"`

### Zone (Fleetbase\FleetOps\Models\Zone) / ServiceArea
- **Geofence** — circular polygon (10m radius for check-in)
- `trigger_on_entry: true`, `trigger_on_exit: true`
- Linked to Place (store)

### Route (Fleetbase\FleetOps\Models\Route)
- Daily visit plan
- Waypoints = Places (stores) in visit order
- Assigned to a Driver + Vehicle
- 4-week cycle, 5 days/week — 20 route presets per depot

### Order (Fleetbase\FleetOps\Models\Order)
| Field | Value |
|---|---|
| `customer_uuid` | Contact UUID (store owner) |
| `customer_type` | `"contact"` |
| `payload_uuid` | Payload UUID (contains entities + dropoff place) |
| `status` | `"pending"` / `"on-hold"` / `"no-order"` / `"completed"` / `"cancelled"` |
| `type` | `"delivery"` |
| `meta.payment_method` | `"cod"` |
| `meta.off_route` | `true` / `false` |
| `meta.off_route_reason` | String (required if off_route) |
| `meta.sales_rep` | Driver public_id |
| `meta.store` | Place public_id |

### Payload (Fleetbase\FleetOps\Models\Payload)
- Container for order line items
- `dropoff_uuid` = store Place UUID
- `type: "order"`

### Entity (Fleetbase\FleetOps\Models\Entity)
- Order line item (product)
- Fields: `name`, `sku`, `price`, `quantity`, `meta.promo_type`, `meta.free_quantity`

### Vehicle (Fleetbase\FleetOps\Models\Vehicle)
- Depot vehicle
- Fields: code, plate number, type, cubic capacity, load type

### Geofence Events Log (geofence_events_log table)
- Auto-created when driver enters/exits a Zone
- Captures: driver, zone, event type (entered/exited), timestamp, position

## Key Relationships

```
Company
  ├── Depot (custom grouping)
  │   ├── User (depot admin)
  │   ├── Driver (sales rep)
  │   │   ├── Route (daily visit plan)
  │   │   │   └── Place (store waypoint)
  │   │   │       ├── Zone (geofence, 10m radius)
  │   │   │       └── Contact (store owner)
  │   │   ├── Order (via meta.sales_rep)
  │   │   └── GeofenceEvent (tracking)
  │   ├── Vehicle
  │   │   └── Route (delivery assignment)
  │   └── Place (stores in this depot)
  ├── Order
  │   ├── Payload
  │   │   ├── Entity (line item / product)
  │   │   └── Place (dropoff store)
  │   └── Contact (customer)
  └── Product (via Entity catalog)
```

## Product catalog

Products (Entities used as catalog items) will be imported from Sanqua's current product list:

| Attribute | Example |
|---|---|
| `name` | Aqua 600ml |
| `sku` | AQ-600 |
| `price` | 4000 |
| `meta.brand` | Sanqua |
| `meta.category` | Galon / Botol / Kardus |
| `meta.promo_price` | 3800 (if promo active) |
| `meta.promo_period_start` | ISO timestamp |
| `meta.promo_period_end` | ISO timestamp |

## Promo / bundling model

Bundling programs (e.g., "mix 30 carton get free 1 220ml") — stored as metadata on relevant entities:

```json
{
  "bundling": {
    "type": "mix_free",
    "trigger_quantity": 30,
    "free_sku": "AQ-220",
    "free_quantity": 1,
    "description": "Mix 30 carton get free 1 220ml"
  }
}
```

Since KlikOrder's promo system is not self-service (KlikOrder sets promos), Fleetbase will store promos in custom meta and allow WIM admins to manage them directly.