# AGENTS.md — WIM Fleetbase

> Auto-injected by Hermes Agent when `workdir` is set to this project.
> Read this before any task. Abide by all rules.

## Non-negotiables (condensed)

1. **No mock data in production** — test data in separate DB or test mode only
2. **No hardcoded secrets** — everything in `.env` or Docker secrets
3. **Server-side validation** — never trust frontend for auth, totals, or geofence checks
4. **Destructive actions require authorization** — soft delete via status changes
5. **Production DB never reset by a worker** — no `migrate:fresh` in any script
6. **Architecture changes require approval** — no swapping ORM/DB/framework
7. **Order > 0 must have a verified check-in event** — core data integrity rule
8. **Order > 0 requires QR/barcode scan verification**
9. **Exports must include promo/free-product data**

## Scope rule

If a task lands in **"Out of scope for V1"** (see SCOPE.md), **STOP and escalate**. Do not implement it.

## Architecture reference

- **Deployment:** Fleetbase Docker Compose on privileged Proxmox LXC
- **Stack:** Laravel API (:8000), Ember.js console (:4200), MySQL 8, Redis, SocketCluster (:38000)
- **Network:** Static LAN IP, reverse proxy via NPMplus
- **Geofence:** Server-side MySQL spatial queries (`ST_Contains`)

## Data model

Key namespaces:
- `Fleetbase\Models\Company`, `Fleetbase\Models\User`, `Fleetbase\Models\ApiCredential`
- `Fleetbase\FleetOps\Models\Place`, `Driver`, `Contact`, `Route`, `Order`, `Payload`, `Entity`, `Zone`, `ServiceArea`, `Vehicle`

## Definition of Done

A feature is Done when:
1. Acceptance criteria pass
2. Tests pass (no regression)
3. Data integrity verified (order links to visit event)
4. No dead code, no hardcoded values, Bahasa-friendly error messages
5. Documentation updated
6. Review completed

## Escalation conditions (stop and ask)

- Ambiguous requirement not covered in SCOPE.md or PROJECT-CHARTER.md
- Task requires modifying Fleetbase core code (fork, not config)
- Need to access WIM production data that isn't available in a dev mirror
- Integration with external system not documented in the scope

## Evidence required per task

- New files created: list them
- API calls made: include request/response
- Data created: include DB query or export showing the data
- Tests run: include pass/fail output

## Subagent QA loop (mandatory for every feature)

After implementing a feature, spawn 3 subagents to test it as a human would:

1. **Subagent A** — Sales rep persona (check-in, visit card, NOO, order, photo, stock, out-of-route)
2. **Subagent B** — Depot admin persona (route plan, admin order, report, export, user management)
3. **Subagent C** — Super admin persona (dashboard, settings, promo, analytics, full reporting)

Each subagent gets:
- The feature's context + AGENTS.md rules
- The GooVi/KlikOrder mapping docs (APP-MAPPING.md) for comparison
- A task to walk through the flow as a real user and submit structured feedback

**Gate rule:** A feature is NOT done until all 3 subagents agree it's suitable. If any says "No" or "Maybe", fix the issues and re-run the subagent loop. Unanimous approval required.