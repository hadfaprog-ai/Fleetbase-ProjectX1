# Application Mapping — GooVi + KlikOrder → Fleetbase

> Mapped via reverse-engineering the Nuxt SPA bundles and live API probing (2026-09-07). 
> Credentials: dummy-neg / Sales role.

## GooVi — Sales Visit App

**API Base:** `https://api-cloud.goovi.satriamitra.website/api`
**App Base:** `https://app.satriamitra.website`

### Authentication
- `POST /api/login` → returns `access_token` (Bearer), `user` (id, username, id_karyawan, role, jenis_sales), `session_id`
- Requires field: `device_info` (unique device identifier, enforces single-session)
- `DELETE /api/user-sessions/reset/session/{session_id}` — clears active session on another device
- `POST /api/logout` — ends session

### Sales Panel API — Visit Card (chunk 973)
The visit card flow is the core sales workflow.

| Nuxt Route | API Endpoint(s) | Description |
|---|---|---|
| `/sales/visitCard` | **`GET /api/rencana-kunjungan/kunjungan-hari-ini/pilihan?id_karyawan=X`** | Today's visit plan: list of stores with `is_dalam_rute` (in-route flag), `prioritas_kunjungan`, `pelanggan` (nested store data) |
| `/sales/visitCard` | **`POST /api/rencana-kunjungan-driver/kanvas/on-the-fly`** | Add an ad-hoc (kanvas/on-the-fly) store to today's route |
| `/sales/visitCard` | **`POST /api/rencana-kunjungan/kunjungan-hari-ini/set-prioritas`** | Set priority/order of today's planned visits |
| `/sales/visitCard` | **`GET /api/konfirm-kunjungan?visitID=X`** | Load confirmation data for a specific scheduled visit (visitID from the plan) |
| `/sales/visitCard` | **`POST /api/kunjungan-harian`** | Submit a completed daily visit (check-in + order data) |
| `/sales/visitCard` | **`POST /api/log-order-luar-rute`** | Log an order that was placed outside the planned route |

### Sales Panel API — NOO (New Outlet Opening)

| Nuxt Route | API Endpoint(s) | Description |
|---|---|---|
| `/sales/complete-noo` | **`POST /api/pelanggans/`** | Create or update a customer/store record |
| `/sales/complete-noo` | **`POST /api/pelanggans/noo/draft`** | Save NOO as draft |
| `/sales/complete-noo` | **`POST /api/pelanggans/noo/`** | Submit complete NOO with all data |
| `/sales/complete-noo` | **`DELETE /api/pelanggans/{id}`** | Delete a customer record |
| NOO flow | **`GET /api/channels`** | Channel dropdowns (GT, MT, Institutional, etc.) |
| NOO flow | **`GET /api/kategori-pelanggan`** | Customer categories with icons |
| NOO flow | **`GET /api/otp-whatsapp/check-kadepo`** | Check if OTP sent to depo PIC |
| NOO flow | **`POST /api/otp-whatsapp/request-kadepo`** | Request OTP via WhatsApp to depo PIC |
| NOO flow | **`POST /api/otp-whatsapp/verify-kadepo`** | Verify OTP from depo PIC |
| NOO flow | **`POST /api/otp/request`** | Request OTP for phone verification |

### Sales Panel API — Products & References

| Endpoint | Description |
|---|---|
| **`GET /api/produk`** | Full product catalog (multi-brand — SQA, KAP, WIN, etc.) |
| **`GET /api/produk/brands-auth`** | Brands the sales rep is authorized to sell (dummy-neg: SANQUA only) |
| **`GET /api/channels`** | Channel data with linked categories |
| **`GET /api/kategori-pelanggan`** | All customer categories with channel info |

### Sales Panel API — Stock Check & History

| Endpoint | Description |
|---|---|
| **`GET /api/kunjungan-cek-stok-brand/order-terakhir-pelanggan`** | Last order per customer (for stock check context) |
| **`POST /api/pesanan-detail/surat-tugas/history`** | Order history for a specific surat tugas (task document) |

### Sales Panel — Other Nuxt Routes

| Nuxt Route | API Association | Description |
|---|---|---|
| `/sales/dashboard` | (data from visit plan + counts) | Sales dashboard with visit summary |
| `/sales/route` | `rencana-kunjungan` | Route map view |
| `/sales/presensi` | `.presensi` | Attendance/selfie check-in |
| `/sales/report` | `.report` | Visit history reporting |
| `/sales/reportKlikOrder` | (links to KlikOrder) | Sales report via KlikOrder data |
| `/sales/edit-no-hp` | `.pelanggans` | Edit customer phone number |

### Super Admin Panel API (Admin_Wilayah role)

> Mapped from JS chunks and confirmed with live API probing (read-only, no data modified).
> Admin role: "Admin_Wilayah" — highest level regional admin.

### Dashboard
| Endpoint | Method | Description |
|---|---|---|
| `/depos` | GET | List/query depots (requires `kode`, `nama`) |
| `/karyawans/{id}` | GET | Single employee details |

### Master Data — Depo (chunk 82)
| Endpoint | Method | Description |
|---|---|---|
| `/depos` | GET | List depots (with page/per_page/filters) |
| `/depos` | POST | Create depot (fields: `kode`, `nama`, ...) |
| `/depos/{id}` | PUT | Update depot |
| `/depos/{id}` | DELETE | Delete depot |
| `/import-depo` | POST | Import depots via Excel/CSV |

### Master Data — Karyawan (Employee) (chunk 84)
| Endpoint | Method | Description |
|---|---|---|
| `/karyawans` | GET | List employees (requires: `nama`, `id_depo`) |
| `/karyawans` | POST | Create employee |
| `/karyawans/{id}` | PUT | Update employee |
| `/karyawans/{id}` | DELETE | Delete employee |
| `/karyawan-jenis-sales` | GET | List sales sub-types (TO, SPC, Motoris, etc.) |
| `/import-karyawan` | POST | Import employees via file |

### Master Data — User (chunk 91)
| Endpoint | Method | Description |
|---|---|---|
| `/users-filtered` | GET | List users with filters |
| `/users` | POST | Create user |
| `/users/{id}` | PUT | Update user |
| `/users/{id}` | DELETE | Delete user |
| `/users/{id}` | PATCH | Partial update (e.g., change username) |
| `/users/import-update` | POST | Bulk import/update users |

### Master Data — Pelanggan (Customer/Store) (chunk 87)
| Endpoint | Method | Description |
|---|---|---|
| `/pelanggans-filtered` | GET | List customers with filters |
| `/pelanggans/{id}` | PUT | Update customer |
| `/pelanggans/{id}` | DELETE | Delete customer |
| `/import-pelanggan` | POST | Import customers from file |
| `/import-update-pelanggan` | POST | Update customers from file |

### Master Data — Produk (Product) (chunk 88)
| Endpoint | Method | Description |
|---|---|---|
| `/produk` | GET | List/query products |
| `/produk/{id}` | PUT | Update product (price, name, etc.) |
| `/produk/brands` | GET/PUT | Manage product brands |
| `/produk/sync` | POST | Sync products (from external source) |
| `/channels` | GET | List channels (GT, MT, Horeka, Institutional) |

### Master Data — Rencana Kunjungan (Visit Plan) (chunk 89)
| Endpoint | Method | Description |
|---|---|---|
| `/rencana-kunjungan` | GET | List visit plans |
| `/rencana-kunjungan/{id}` | DELETE | Delete visit plan entry |
| `/import-rencana-kunjungan` | POST | Import route plans (4-week × 5-day Excel) |

### Master Data — Other
| Endpoint | Category | Description |
|---|---|---|
| `/kendaraans` | CRUD | Vehicle management |
| `/suppliers` | CRUD | Supplier management |
| `/kategori-pelanggan` | CRUD | Customer categories (per channel) |
| `/kategori-pelanggan/import` | POST | Import categories |

### Reporting — Visit Monitoring
| Endpoint | Method | Description |
|---|---|---|
| `/kunjungan-harian/all` | GET | All daily visit data with filters (date range, depo, karyawan) |
| `/kunjungan-harian/export` | GET | Export visits to CSV/XLSX |
| `/kunjungan-harian/report-foto` | GET | Photo gallery (visit photos with descriptions) |
| `/kunjungan-harian/export-foto` | GET | Export photo report |
| `/kunjungan-harian/detail-penggunaan-aplikasi` | GET | App activity log |
| `/kunjungan-harian/export-detail-penggunaan-aplikasi` | GET | Export activity log |
| `/kunjungan-harian/report-harian` | GET | Daily recap (per-sales summary) |
| `/kunjungan-harian/export-rekap` | GET | Export recap |
| `/absensi` | GET | Attendance records (with export) |
| `/absensi/export` | GET | Export attendance |
| `/kunjungan-cek-stok-brand/report/all` | GET | Store stock check report |
| `/kunjungan-cek-stok-brand/export` | GET | Export stock check report |
| `/kunjungan-cek-stok-brand/{id}` | DELETE | Delete stock check entry |
| `/report-order-luar-rute` | GET | Out-of-route order report |
| `/kunjungan-harian/report-order-pelanggan` | GET | Customer order report (settings context) |

### Reporting — Order & Invoice
| Endpoint | Method | Description |
|---|---|---|
| `/pesanan-detail-terkirim` | GET | Shipped order detail |
| `/pesanan-detail-terkirim/export` | GET | Export shipped orders |
| `/pesanan/surat-tugas` | GET | Task document (surat tugas) list |
| `/pesanan/surat-tugas/export` | GET | Export surat tugas |
| `/pesanan-detail/surat-tugas/history` | GET/POST | Order history per surat tugas |
| `/report/analisa-order-vs-stok` | GET | Order vs stock analysis |
| `/report/analisa-order-vs-stok/export` | GET | Export analysis |
| `/report/analisa-order-vs-stok/rekap` | GET | Recap of analysis |
| `/report/analisa-order-vs-stok/rekap/export` | GET | Export analysis recap |
| `/kunjungan-harian/allConfirm` | GET | Confirmed visits for analytics |

### Reporting — Visualisasi / Route Maps
| Endpoint | Method | Description |
|---|---|---|
| `/report-visualisasi/performa-sales-depo` | GET | Sales performance per depot |
| `/report-visualisasi/performa-sales-depo-harian` | GET | Daily sales performance |
| `/rencana-kunjungan/pelanggan-unik` | GET | Unique customers for map visualization |
| `/kunjungan-harian/report-order-pelanggan` | GET | Customer order data for route maps |

### Settings
| Endpoint | Method | Description |
|---|---|---|
| `/user-sessions` | GET | All active user sessions |
| `/user-sessions/reset/{session_id}` | DELETE | Force-reset a session |
| `/user-sessions/import-reset-session` | POST | Bulk session reset |
| `/depo/brands-bulk` | PUT | Bulk-update depot brand access (the "Update AksesBrand" feature) |
| `/depo/{id}/brand?brands=X` | — | Per-depot brand access toggle |
| `/surat-jalan-driver/by-kode` | GET | Lookup surat jalan by code |
| `/surat-jalan-driver/{id}` | DELETE | Delete surat jalan |
| `/depo-configurations` | GET/POST | Depot configuration CRUD |
| `/depo-otp-pic` | GET/POST | OTP PIC per depot |
| `/whatsapp-accounts` | CRUD | WhatsApp account management for OTP |

### Admin Wilayah (AdminDepo / Visualisasi)
| Endpoint | Method | Description |
|---|---|---|
| `/admin-wilayah/{id}` | GET | Admin wilayah detail |
| `/admin-wilayah` | POST | Create admin wilayah assignment |
| `/admin-wilayah/depos/assign/import` | POST | Bulk assign depots to admin wilayah |

## GooVi Data Model (from API validation errors)

These field schemas are directly relevant to Fleetbase migration:

### Depo
`kode`, `nama` (required on create)

### Karyawan (Employee)
`nama`, `id_depo` (required on create)

### Pelanggan (Customer/Store) — full schema
`id`, `kode`, `nama`, `longitude`, `latitude`, `id_depo`, `nama_pemilik`, `kontak_person`, `alamat_lengkap`, `kecamatan`, `kelurahan`, `kota`, `provinsi`, `jenis_kendaraan`, `no_hp`, `kode_pos`, `nik`, `npwp`, `nama_npwp`, `status_pelanggan`, `status_otp_kadepo`, `id_kategori_pelanggan`

### Absensi (Attendance)
`id_karyawan`, `waktu`, `jenis` (checkin/checkout), `latitude`, `longitude`, `foto_absensi`

### Kategori Pelanggan
`kode`, `kategori`, `channel_id`

### Jenis Sales
TO (Trade Outlet), SPC, SPG, Motoris, SMD, Kanvaser

---

## KlikOrder Super Admin Panel (Admin_Wilayah role)

> Mapped via browser (live dashboard view) + API probing (read-only, no data modified).
> User: super-admin-wim1 (Admin_Wilayah), dashboard alias: "WIM (PAK EDI)".

### Navigation Menu Structure
From the admin dashboard snapshot:

| Menu Item | Sub-items | Description |
|---|---|---|
| **Home** | — | Dashboard with KPIs and charts |
| **Master Data User & Pelanggan** | Data Karyawan, Data User | Employee and user account management |
| **Master Data Toko Order GooMart** | (unexplored) | Store/product master data for the GooMart ordering app |
| **Report** | (unexplored) | Reporting and analytics |
| **Setting Toko** | (unexplored) | Store/settings configuration |

### Admin Dashboard KPIs (from live view, date range 2026-08-07 to 2026-09-07)
| Metric | Value | Context |
|---|---|---|
| Total Omset | Rp 4,316,138,114 | ~Rp 149K avg per invoice |
| Total Invoice | 28,959 | Across all depots, ~1 month |
| Total Qty | 179,313 | Cartons/packs |
| Total Pelanggan | 21,298 | Unique customer accounts |
| Avg Order | Rp 149,043.06 | Average invoice value |

### Dashboard Widgets
1. **Trend Penjualan Harian** — Daily sales trend (omset + qty line graph)
2. **Order Source** — Donut chart: sales vs admin vs pelanggan
3. **Penjualan Per Depo** — Sales by depot bar chart (WIM depots listed)
4. **Status Pesanan** — Donut: Batal, Dikirim, Dipesan, Pending, Selesai
5. **Penjualan Per Sales** — Sales per salesperson line chart
6. **Top Produk** — Top 10 products by qty (horizontal bar)
7. **Distribusi Produk Per Depo** — Stacked bar, product distribution by depot

### Admin API Endpoints (confirmed via API probing)

| Endpoint | Method | Description | Notes |
|---|---|---|---|
| `/toko-order/promos` | GET/POST | Promo management CRUD | Fields: `nama_promo`, `jenis_promo`, `status`, `periode` |
| `/toko-order/pesanan-pelanggans` | GET | Order history listing | Per-store order history |
| `/toko-order/produk-baru` | GET | New products list | |
| `/toko-order/sku-produks` | GET | SKU product listing | Multi-brand product catalog |

### Admin API Endpoints (inferred from JS, likely CRUD — not probeable without data modification)

| Endpoint | Likely Purpose | Evidence |
|---|---|---|
| `/toko-order/users` | User account CRUD | Menu item "Data User" |
| `/toko-order/karyawan` | Employee CRUD | Menu item "Data Karyawan" |
| `/toko-order/pelanggan` | Customer store CRUD | Menu item contains "Data Pelanggan" |
| `/toko-order/pesanan/admin` | Admin order entry | "Order By Admin" from meeting notes |
| `/toko-order/dashboard-summary` | Dashboard KPIs | Dashboard widgets load via API |
| `/toko-order/packing-list` | Packing list download | "Packing list" from meeting notes |
| `/toko-order/invoices/export` | Invoice PDF export | Mass PDF download feature |
| `/toko-order/catalog/download` | Catalog promo export | "Download Catalog Promo" feature |

### Promo Data Model (from API validation)
```
Fields: nama_promo (required), jenis_promo (required), 
        status, no_surat_promo, periode_start, periode_end,
        depo_id, sku_produk, harga_strata, bonus_sku, bonus_qty
Jenis promo options: bundling, strata, diskon, bonus
```

### KlikOrder Data Summary (from dashboard)
- ~21,298 registered customers
- ~28,959 invoices in ~1 month period
- Top products include: LEVONTE CUP 220ML, SANQUA PET 550ML/220ML/1500ML, SANQUA CUP 120ML, BATAVIA, ROBUST
- Order sources: sales (majority), admin, pelanggan (customer self-order)
- WIM depots visible in the chart: JABAR, JATIM, JATENG, etc.

### Authentication
- Same `POST /api/login` pattern (username, password, device_info)
- Returns Bearer token with user (id, username, id_karyawan, role)
- Token: `9122|...`

### Sales Panel API — Store & Products

| Endpoint | Description |
|---|---|
| **`GET /api/toko-order/dashboard/{tokoID}`** | Store dashboard — entry point for a specific store |
| **`GET /api/toko-order/brand-produks`** | Brands with products (requires store context) |
| **`GET /api/toko-order/sku-produks`** | SKU-level products |
| **`GET /api/toko-order/sku-produks/search`** | Product search |
| **`GET /api/toko-order/sku-produks/filter-availability`** | Filter by availability |
| **`GET /api/toko-order/jenis-produks`** | Product types |
| **`GET /api/toko-order/kategori-produks`** | Product categories |
| **`GET /api/toko-order/produk-baru`** | New products |

### Sales Panel API — Promos & Bundling (key differentiator from Fleetbase)

| Endpoint | Description |
|---|---|
| **`GET /api/toko-order/promos/deskripsi-all/{tokoID}`** | All promo descriptions for a store |
| **`GET /api/toko-order/promo/shortcut-bundling`** | Quick bundling shortcuts |
| **`GET /api/toko-order/products/discounted-preview?limit_per_jenis=X`** | Discounted products |
| **`POST /api/toko-order/promo/check-bundling`** | Check bundling eligibility |
| **`POST /api/toko-order/promo/check-bundling-bonus`** | Check bundling bonus |
| **`POST /api/toko-order/promo/check-strata`** | Check strata discount levels |
| **`POST /api/toko-order/promo/calculate-global-combined-strata-discount`** | Combined strata calc |
| **`POST /api/toko-order/promo/checkAllPromoKeranjang-byPrioritas`** | Cart-wide promo check |

### Sales Panel API — Orders

| Endpoint | Description |
|---|---|
| **`GET /api/toko-order/pesanan-pelanggans`** | Order history for customer stores |
| **`POST /api/toko-order/verify-otp/{id}`** | OTP verification for checkout |
| **`GET /api/slideshow-dashboard`** | Dashboard banner slideshow |

### Sales Panel API — Gamification

| Endpoint | Description |
|---|---|
| **`POST /api/toko-order/game-koin/play`** | Coin game play |
| **`POST /api/toko-order/game-koin/qr-gift`** | QR code gift |

### Sales Panel — Other

| Endpoint | Description |
|---|---|
| **`POST /api/cek-rencana-kunjungan?id_karyawan=X`** | Check today's visit plan |
| **`POST /api/selesai-kegiatan?id_karyawan=X`** | End of day / complete activity |
| **`POST /api/toko-order/register-device-token`** | Register device for notifications |
| **`POST /api/toko-order/send-notification`** | Send notification |

---

## Key Data Model Differences Found

### GooVi (Visit App) data shape:
- **RencanaKunjungan** (Visit Plan): `{id, id_karyawan, id_pelanggan, minggu_rencana (week of month), hari, status_tugas, prioritas_kunjungan, is_dalam_rute (boolean), pelanggan (nested)}`
- **Pelanggan** (Customer/Store): `{id, kode, nama, longitude, latitude, id_depo, nama_pemilik, kontak_person, alamat_lengkap, kecamatan, kelurahan, kota, provinsi, jenis_kendaraan, no_hp, kode_pos, nik, npwp, nama_npwp, status_pelanggan, status_otp_kadepo, id_kategori_pelanggan}`
- **KunjunganHarian** (Daily Visit): Submitted via POST with check-in/check-out timestamps, visit outcome
- **Channel/Kategori**: Hierarchical — channel (GT/MT/Inst) → kategori (Retail Kecil, Grosir, etc.)

### KlikOrder (Order App) data shape:
- **Brand**: `{kode_brand, nama_brand}` — SQA (SANQUA) primary
- **SKU**: Multi-brand product catalog
- **Promo/Bundling**: Multiple promotional systems (bundling, strata discounts, combined global discounts)
- **Product hierarchy**: Jenis (type) → Kategori (category) → Brand → SKU
- **Pesanan** (Order): Has order lines, promo tracking, OTP verification

## ⚠️ Fleetbase Gaps vs Current Apps

| Current Feature | KlikOrder/Goovi | Fleetbase Support | Mitigation Plan |
|---|---|---|---|
| Bundling promos (mix X get Y free) | Native | No native bundling | Custom `meta.bundling` on Entity + frontend logic |
| Strata discounts | Native | No strata system | Custom Promo model or frontend-calculated |
| OTP verification (WA, depo PIC) | Native | Not supported | Webhook → WhatsApp gateway integration |
| Selfie/photo on visit | Native | Attachment on event | Custom frontend → POST attachment |
| 3-min minimum timer | Native | Not supported in Navigator | Custom frontend timer |
| Route plan import (4-week cycle) | Native | Fleetbase Routes are single-use | Import script building 20 route presets |
| Barcode/QR scanning | Native (KlikOrder) | Navigator has basic barcode | Custom integration |
| Koin game (gamification) | Native | Not supported | Out of scope |
| KlikOrder promo catalog downloads | Native | Not supported | Custom promo model