# AI Context — Hospital Management System (HMS)

> **Purpose:** This document provides AI coding assistants with a fast-loading, high-signal context dump of the HMS codebase. Use this as the **first file to read** before exploring or modifying any part of the project.
>
> **Generated:** June 12, 2026 | **Companion Docs:** `ARCHITECTURE_ANALYSIS.md`, `MODULE_INVENTORY.md`

---

## TL;DR

- **What it is:** Multi-tenant SaaS Hospital Management System (HMS).
- **Stack:** React 19 + Vite (frontend), Node.js + Express + Prisma (backend), PostgreSQL (database).
- **Auth:** JWT-based, stateless, 1-hour tokens, no refresh mechanism. Login via **email** (username field removed).
- **Multi-tenancy:** Shared database with `tenantId` row-level isolation (not schema-per-tenant).
- **Module pattern:** Each backend module = `routes.js` → `controller.js` → `service.js` → Prisma.
- **Styling:** MUI (components) + Tailwind CSS (layout/spacing) hybrid.
- **State:** Redux Toolkit (2 slices: `auth`, `ui`). Token persisted in `localStorage`.
- **No tests exist.** No CI/CD. No Docker. No external integrations (email, SMS, payments).
- **ES Modules** used throughout (`"type": "module"` in both `package.json` files).

---

## Project Structure at a Glance

```
hms-project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         ← Single source of truth for DB schema
│   │   └── migrations/           ← 12 SQL migration files
│   └── src/
│       ├── config/prisma.js      ← PrismaClient singleton
│       ├── middleware/            ← auth, tenant, RBAC middleware
│       ├── modules/              ← Feature modules (8 total)
│       ├── app.js                ← Express app + middleware + routes
│       └── server.js             ← Entry point
├── frontend/
│   └── src/
│       ├── api/                  ← API service layer (mostly empty; inline calls)
│       ├── components/           ← Shared UI components
│       ├── config/routes.js      ← Route definitions with RBAC
│       ├── constants/            ← App-wide constants
│       ├── pages/                ← Page components (one per route)
│       ├── routes/               ← AppRouter + ProtectedRoute guard
│       ├── store/                ← Redux slices + store config
│       ├── utils/                ← axios, formatDate, formatTime, permissions
│       ├── App.jsx               ← Root component
│       └── main.jsx              ← Entry point
└── docs/
    ├── ARCHITECTURE_ANALYSIS.md  ← Deep architecture doc
    ├── MODULE_INVENTORY.md       ← Full module inventory
    └── AI_CONTEXT.md             ← This file
```

---

## How to Run

```bash
# Backend
cd backend
npm install
npx prisma migrate deploy   # runs on postinstall automatically too
npm run dev                  # nodemon on port 4000

# Frontend
cd frontend
npm install
npm run dev                  # Vite dev server
```

**Environment Variables:**

| Variable       | Location        | Value (dev)                                                              |
| -------------- | --------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL` | `backend/.env`  | `postgresql://postgres:postgres@localhost:5432/hms_global?schema=public` |
| `PORT`         | `backend/.env`  | `4000`                                                                   |
| `JWT_SECRET`   | `backend/.env`  | `super-secret-key`                                                       |
| `VITE_API_URL` | `frontend/.env` | `http://localhost:4000/api` (or Render URL for prod)                     |

---

## Database Schema Quick Reference

**8 Prisma Models:**

```
Tenant ──1:N──▶ User ──1:N──▶ Appointment
   │               │                 │
   │               ├──1:N──▶ Prescription ──1:N──▶ PrescriptionMedicine
   │               │
   ├──1:N──▶ Patient ──1:N──▶ Appointment
   │               │
   │               ├──1:N──▶ Prescription
   │               │
   │               └──1:N──▶ Bill ──1:N──▶ BillItem
   │
   └──1:N──▶ Appointment, Prescription, Bill
```

**Key IDs:** All primary keys are `uuid()` strings.

**Key Unique Constraints:**

- `Tenant.licenseNumber` — unique globally
- `User.(email, tenantId)` — unique per tenant (email is the login identifier; username field removed)
- `Patient.patientUid` — unique (auto-generated: `PAT-{timestamp}-{random}`)
- `Prescription.prescriptionUid` — unique (auto-generated: `RX-{timestamp}-{random}`)

**Tenant Scoping:** Every tenant-scoped model has a `tenantId` field. All service queries MUST filter by `tenantId` for data isolation.

---

## Authentication & Authorization Cheat Sheet

### JWT Payload

```js
{ userId, tenantId, roles: ["ADMIN", "DOCTOR", ...], iat, exp }
```

### Middleware Pipeline (all protected routes)

```
authenticate (JWT verify → req.user, req.tenantId)
  → enforceTenantAccess (req.tenantId must exist)
    → authorizeRoles(...allowed) (role check)
      → controller
```

### Login Flow

- **POST `/api/auth/login`** accepts `{ email, password }` — finds user by email, bcrypt compare.
- **POST `/api/tenants/register`** accepts admin-chosen password, returns JWT for auto-login (no separate login step).

### Role Matrix

| Role           | Users     | Patients    | Appointments       | Prescriptions | Billing         | Dashboard |
| -------------- | --------- | ----------- | ------------------ | ------------- | --------------- | --------- |
| `ADMIN`        | Full CRUD | Full CRUD   | Full CRUD          | Read          | Create/Read/Pay | Read      |
| `DOCTOR`       | —         | Read/Create | Read/Create/Status | Create/Read   | —               | Read      |
| `NURSE`        | —         | Read        | Read/Create        | Read          | —               | Read      |
| `RECEPTIONIST` | —         | Read/Create | Full CRUD          | —             | Create/Read/Pay | Read      |
| `PHARMACIST`   | —         | —           | —                  | Read          | —               | Read      |
| `ACCOUNTANT`   | —         | —           | —                  | —             | —               | Read      |

**Frontend enforcement:** `ProtectedRoute.jsx` checks roles client-side. **Backend enforcement:** Each route file calls `authorizeRoles(...)` — both layers must agree.

---

## Backend Module Quick Reference

| Module        | Base Path            | Key Endpoints                                                                                              |
| ------------- | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Auth          | `/api/auth`          | `POST /login`, `POST /reset-password`                                                                      |
| Tenant        | `/api/tenants`       | `POST /register`, `GET /:tenantId`                                                                         |
| Users         | `/api/users`         | `POST /create`, `GET /`, `PUT /:id`, `DELETE /:id`, `GET /doctors`                                         |
| Patients      | `/api/patients`      | `POST /create`, `GET /`                                                                                    |
| Appointments  | `/api/appointments`  | `POST /create`, `GET /`, `GET /:id`, `PUT /:id`, `PUT /:id/status`, `DELETE /:id`, `GET /doctor/:doctorId` |
| Prescriptions | `/api/prescriptions` | `POST /create`, `GET /patient/:patientId`                                                                  |
| Billing       | `/api/billing`       | `POST /create`, `GET /`, `GET /patient/:patientId`, `POST /:billId/pay`                                    |
| Dashboard     | `/api/dashboard`     | `GET /summary`                                                                                             |

---

## Frontend Route Quick Reference

| Route                    | Component            | Roles                              |
| ------------------------ | -------------------- | ---------------------------------- |
| `/login`                 | `Login`              | Public                             |
| `/register`              | `TenantRegister`     | Public                             |
| `/`                      | `Dashboard`          | All roles                          |
| `/patients`              | `PatientsList`       | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| `/patients/create`       | `CreatePatient`      | ADMIN, RECEPTIONIST, DOCTOR        |
| `/patients/:id`          | `PatientDetails`     | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| `/appointments`          | `AppointmentsList`   | ADMIN, DOCTOR, RECEPTIONIST        |
| `/appointments/create`   | `CreateAppointment`  | ADMIN, RECEPTIONIST                |
| `/appointments/:id`      | `AppointmentDetails` | ADMIN, RECEPTIONIST, DOCTOR        |
| `/appointments/:id/edit` | `EditAppointment`    | ADMIN, RECEPTIONIST, DOCTOR        |
| `/prescriptions`         | `PrescriptionsList`  | ADMIN, DOCTOR, NURSE               |
| `/billing`               | `BillingList`        | ADMIN, ACCOUNTANT                  |
| `/users`                 | `UsersList`          | ADMIN                              |
| `/users/create`          | `CreateUser`         | ADMIN                              |
| `/users/:id`             | `UserDetails`        | ADMIN                              |
| `/users/:id/edit`        | `EditUser`           | ADMIN                              |
| `/reset-password`        | `ResetPassword`      | ANY authenticated                  |
| `/unauthorized`          | `Unauthorized`       | —                                  |

---

## Key Patterns & Conventions

### Backend Module Pattern

```
routes.js     → Defines HTTP endpoints + attaches middleware chain
controller.js → Extracts req params, calls service, sends response
service.js    → Business logic + Prisma queries
```

When adding a new module, follow this pattern. All DB access goes through the service layer.

### Tenant Scoping Pattern

Every service method that accesses tenant data MUST filter by `tenantId`:

```js
const results = await prisma.model.findMany({
  where: { tenantId: req.tenantId, ...otherFilters },
});
```

### Frontend API Call Pattern

Most API calls are made directly in page components using the shared `api` axios instance:

```js
import api from '../utils/axios';
const res = await api.get('/patients');
```

The interceptor in `utils/axios.js` auto-attaches `Authorization` and `x-tenant-id` headers.

### Frontend Route Definition Pattern

Routes are defined declaratively in `config/routes.js`:

```js
{ path: "patients", element: PatientsList, roles: [ROLES.ADMIN, ROLES.DOCTOR] }
```

`AppRouter.jsx` maps this array to `<Route>` components wrapped in `ProtectedRoute`.

### Styling Pattern

- **Layout/spacing/colors:** Tailwind CSS classes
- **Form controls, cards, data grids:** MUI components
- Both can coexist on the same element

---

## Known Issues & Landmines

| #   | Issue                                      | Impact                                                                                                                                                  |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **No tests**                               | Zero test coverage anywhere. Be careful with refactors.                                                                                                 |
| 2   | **Staff temp passwords in HTTP responses** | Partial security risk. Tenant registration no longer exposes passwords (admin chooses own). Staff user creation still returns plaintext temp passwords. |
| 3   | **CORS allows all origins**                | `origin: "*"` in `app.js`. Not secure for production.                                                                                                   |
| 4   | **No rate limiting**                       | `/api/auth/login` is vulnerable to brute-force attacks.                                                                                                 |
| 5   | **No refresh token**                       | Users are logged out after 1 hour (JWT expiry). No seamless renewal.                                                                                    |
| 6   | **No code splitting**                      | All frontend routes load eagerly. Bundle size grows with every page added.                                                                              |
| 7   | **Missing DB indexes**                     | No composite indexes on frequently queried fields (appointment conflicts, dashboard counts).                                                            |
| 8   | **Billing role discrepancy**               | Architecture doc says ACCOUNTANT can access billing, but routes only allow ADMIN + RECEPTIONIST.                                                        |
| 9   | **Sidebar not role-filtered**              | All menu items are visible to all users; unauthorized users see a 403 page after clicking.                                                              |
| 10  | **`photoUrl` field unused**                | Patient `photoUrl` exists in schema but no file upload service is implemented.                                                                          |
| 11  | **No audit trail**                         | No `createdBy`, `updatedBy`, or action logging on any model.                                                                                            |
| 12  | **`x-tenant-id` header unused**            | Frontend sends it, but backend derives tenant context from JWT (`req.tenantId`). The header is redundant.                                               |
| 13  | **Password complexity**                    | No minimum requirements enforced. Users can set any password during reset.                                                                              |

---

## Assumptions (Explicit)

These are stated assumptions from the architecture analysis. Treat as unverified until confirmed:

1. **DB indexes** may exist in production but are not in the Prisma schema.
2. **No token refresh** — users re-login after 1 hour.
3. **Sidebar is static** — all items visible regardless of role.
4. **Password policy** — no complexity enforcement.
5. **Backend deployed on Render**, frontend on a static host (Vercel/Netlify) — unconfirmed.
6. **No seed scripts** — initial data is created via the API.
7. **No audit logging** of user actions.
8. **No backup strategy** defined in codebase.
9. **No APM or error tracking** (Sentry, Datadog, etc.).
10. **No CI/CD pipeline** — no GitHub Actions or similar config files detected.
11. **Patient detail fetch** — assumed to work via list endpoint with filtering or a route not visible in the routes file.
12. **Login identifier** is email. The `username` field has been removed from the User model and all backend/frontend code.
13. **Tenant admin registration** — admin chooses own password (min 8 chars), backend returns JWT for auto-login. `mustResetPassword` is `false` for tenant admins.
14. **No payment amount validation** (overpayment, negative amounts) in billing — assumed.
15. **`user.validation.js`** contains input validation logic — not audited in detail.
16. **authSlice resilience** — `localStorage` reads wrapped in try/catch to handle corrupted data. Write guard prevents storing `undefined` user objects.

---

## Adding a New Module — Checklist

1. **Database:** Add Prisma model(s) to `schema.prisma`, run `npx prisma migrate dev`.
2. **Backend module folder:** Create `backend/src/modules/{name}/` with `routes.js`, `controller.js`, `service.js`.
3. **Routes:** Mount in `app.js` with `app.use("/api/{name}", newRoutes)`.
4. **Middleware:** Attach `authenticate` → `enforceTenantAccess` → `authorizeRoles(...)` to each protected endpoint.
5. **Tenant scoping:** Filter ALL queries by `tenantId` in the service layer.
6. **Frontend route:** Add entry to `config/routes.js` with `{ path, element, roles }`.
7. **Frontend page:** Create page component in `pages/{name}/`.
8. **Sidebar nav:** Add menu item in `components/layout/Sidebar.jsx`.
9. **API calls:** Use the shared `api` instance from `utils/axios.js` (headers auto-attached).
10. **Constants:** Add any new enums to the appropriate constants file.

---

## File Count Summary

| Area                                              | Files                         |
| ------------------------------------------------- | ----------------------------- |
| Backend modules (routes + controllers + services) | 24                            |
| Backend middleware                                | 3                             |
| Backend config + entry                            | 3                             |
| Prisma schema + migrations                        | 13 (1 schema + 12 migrations) |
| Frontend pages                                    | 18                            |
| Frontend components                               | 6                             |
| Frontend routes + config                          | 3                             |
| Frontend store                                    | 3                             |
| Frontend utils                                    | 4                             |
| Frontend constants                                | 1                             |
| Frontend API services                             | 1                             |
| Docs                                              | 3                             |

---

## Quick Grep Cheatsheet

```bash
# Find all API routes
grep -r "router\." backend/src/modules/*/

# Find all Prisma queries for a model
grep -r "prisma\.patient" backend/src/

# Find all role-restricted endpoints
grep -r "authorizeRoles" backend/src/modules/

# Find all frontend API calls
grep -r "api\." frontend/src/pages/

# Find all Redux dispatches
grep -r "dispatch" frontend/src/

# Find all protected routes
grep -r "authenticate" backend/src/modules/
```

---

**End of AI Context**
