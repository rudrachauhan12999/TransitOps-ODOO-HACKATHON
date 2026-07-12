# CarryOn

A modern transport operations platform for logistics companies — fleet, driver, shipment, and trip management with role-based dashboards for admins, dispatchers, drivers, and clients.

## Features

- **Role-based dashboards** — separate experiences for Admin, Dispatcher, Driver, and Client, routed automatically after login based on account role.
- **Shipment lifecycle management** — booking, dispatcher approval/rejection, trip creation, live status/progress tracking, and delivery, with a full activity feed per shipment.
- **Fleet management** — vehicle CRUD with Indian registration-number validation, load capacity, odometer, fuel type/efficiency, and maintenance scheduling.
- **Driver management** — license validation and expiry tracking, safety scores, and availability status.
- **Business rule enforcement** — a shipment can't be approved with a suspended/expired-license driver, an in-shop/already-assigned vehicle, or cargo weight exceeding vehicle capacity.
- **Maintenance & fuel logs** — logging maintenance jobs (auto-marks a vehicle "In Shop"), fuel refills, and general expenses, all rolling up into an expense ledger.
- **Emergency alerts** — drivers can raise an emergency, which notifies dispatchers in real time.
- **Notifications** — per-user/per-role notification feed (bookings, approvals, rejections, alerts).
- **Live map widget** — visualizes route progress between source/destination for known Indian cities/hubs.
- **PDF document export** — generates printable invoices, tickets, receipts, proof-of-delivery, and fleet/driver/trip reports.
- **Dark/light theme** with persisted preference.
- **Simple JSON file database** (`database.json`) — no external database required; seeds itself with demo data and demo accounts on first run.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide icons, Motion
- **Backend:** Express (TypeScript), running via Vite middleware in dev and bundled with esbuild for production
- **Storage:** Flat-file JSON database (`server/db.ts` → `database.json`), no external DB/service required

## Prerequisites

- Node.js (v18+ recommended)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment example and fill in values if needed:
   ```bash
   cp .env.example .env
   ```
   > Note: `GEMINI_API_KEY` and `APP_URL` are inherited from the original AI Studio template. The current app code doesn't call the Gemini API, so these aren't required to run the app locally — they're safe to leave as placeholders.
3. Run the app in development mode:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Build & Run for Production

```bash
npm run build
npm start
```

`npm run build` compiles the Vite frontend into `dist/` and bundles the Express server into `dist/server.cjs`. `npm start` runs that bundle.

To clean build artifacts:
```bash
npm run clean
```

## Type Checking

```bash
npm run lint
```
(Runs `tsc --noEmit` — there is no separate ESLint config in this project.)

## Demo Accounts

The database seeds itself automatically on first run (`database.json` is created in the project root). Demo logins:

| Role | Email | Password |
|---|---|---|
| Admin | admin@carryon.in | admin123 |
| Dispatcher | dispatch@carryon.in | dispatch123 |
| Driver | driver@carryon.in | driver123 |
| Client | client@carryon.in | client123 |

Additional demo drivers (`driver1@carryon.in` … `driver4@carryon.in`, password `driver123`) are also ensured on every startup.

> ⚠️ Passwords are stored and compared in plain text in `server/db.ts` — this is a demo/prototype setup, not production-ready auth. Replace with proper password hashing (e.g. bcrypt) and real session/JWT tokens before deploying anywhere real users or data are involved.

## Project Structure

```
├── server.ts                  # Express app entry point + all API routes
├── server/db.ts               # JSON file-backed "database" and seed data
├── src/
│   ├── App.tsx                # Auth state + role-based routing
│   ├── main.tsx                # React entry point
│   ├── types.ts                # Shared TypeScript types
│   ├── utils.ts                # Shared frontend utilities
│   ├── utils/pdfGenerator.ts   # Printable invoice/ticket/receipt/report generation
│   └── components/
│       ├── AuthScreen.tsx          # Login / registration
│       ├── AdminDashboard.tsx      # Fleet, drivers, expenses, insights
│       ├── DispatcherDashboard.tsx # Shipment approval, trip dispatch
│       ├── DriverDashboard.tsx     # Active trip, emergency alerts
│       ├── ClientDashboard.tsx     # Booking, shipment tracking
│       ├── AddressForm.tsx         # Structured address input
│       └── MapWidget.tsx           # Route/progress visualization
├── .env.example
├── vite.config.ts
└── tsconfig.json
```

## API Overview

All routes are prefixed with `/api` and defined in `server.ts`:

- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/me`
- **Vehicles:** `GET/POST /api/vehicles`, `PUT/DELETE /api/vehicles/:id`
- **Drivers:** `GET/POST /api/drivers`, `PUT/DELETE /api/drivers/:id`
- **Shipments:** `GET/POST /api/shipments`, `PUT /api/shipments/:id`, `POST /api/shipments/:id/approve`, `POST /api/shipments/:id/reject`
- **Trips:** `GET/POST /api/trips`, `POST /api/trips/:id/dispatch`, `POST /api/trips/:id/complete`, `POST /api/trips/:id/cancel`
- **Maintenance:** `GET/POST /api/maintenance`, `POST /api/maintenance/:id/complete`
- **Fuel & Expenses:** `GET/POST /api/fuel`, `GET/POST /api/expenses`
- **Geofences:** `GET /api/geofences`
- **Emergencies:** `GET/POST /api/emergencies`, `POST /api/emergencies/:id/acknowledge`
- **Notifications:** `GET/POST /api/notifications`, `POST /api/notifications/read`
- **Insights:** `GET /api/logistics/insights` (aliased at `/api/ai/insights`, `/api/ai/audit`) — returns a static set of illustrative operational insights (not AI-generated despite the alias names).

## Notes

- This project originated from a Google AI Studio template (see the "Run and deploy your AI Studio app" branding in earlier versions of this README) but has since evolved into a self-contained logistics demo app with its own Express API and JSON database.
- Data persists to `database.json` in the project root between restarts. Delete this file to reset to the seeded demo state.
