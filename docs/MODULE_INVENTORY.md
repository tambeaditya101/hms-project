# HMS Module Inventory

**Project:** Hospital Management System (Multi-Tenant SaaS)
**Generated:** June 12, 2026
**Source of Truth:** `ARCHITECTURE_ANALYSIS.md` + codebase audit

---

## 1. Backend Modules

### 1.1 Auth Module

| Attribute              | Value                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| **Path**               | `backend/src/modules/auth/`                                                              |
| **Files**              | `auth.controller.js`, `auth.routes.js`, `auth.service.js`, `resetPassword.controller.js` |
| **Responsibility**     | User login (JWT issuance) and password reset                                             |
| **Prisma Models Used** | `User`                                                                                   |
| **Dependencies**       | `jsonwebtoken`, `bcrypt`                                                                 |

**Endpoints**

| Method | Path                       | Auth   | Roles                  | Handler         |
| ------ | -------------------------- | ------ | ---------------------- | --------------- |
| POST   | `/api/auth/login`          | Public | —                      | `handleLogin`   |
| POST   | `/api/auth/reset-password` | JWT    | Any authenticated user | `resetPassword` |

**Business Rules**

- Validates email + password via bcrypt compare.
- Issues JWT with payload `{ userId, tenantId, roles }`, 1-hour expiry.
- Login identifier is **email** (username field has been removed).
- Reset password requires `mustResetPassword` flag to be toggled off after success.
- **Assumption:** No password complexity validation is enforced on the backend during reset.

---

### 1.2 Tenant Module

| Attribute              | Value                                                           |
| ---------------------- | --------------------------------------------------------------- |
| **Path**               | `backend/src/modules/tenant/`                                   |
| **Files**              | `tenant.controller.js`, `tenant.routes.js`, `tenant.service.js` |
| **Responsibility**     | Hospital registration (onboarding) and tenant lookup            |
| **Prisma Models Used** | `Tenant`, `User` (creates admin user in a transaction)          |
| **Dependencies**       | `bcrypt`, `uuid` (implied by `package.json`)                    |

**Endpoints**

| Method | Path                     | Auth                  | Roles | Handler                |
| ------ | ------------------------ | --------------------- | ----- | ---------------------- |
| POST   | `/api/tenants/register`  | Public                | —     | `handleRegisterTenant` |
| GET    | `/api/tenants/:tenantId` | None (per route file) | —     | `handleGetTenant`      |

**Business Rules**

- Transactional creation: `Tenant` + `ADMIN` user created atomically.
- Admin **chooses their own password** during registration (min 8 chars, validated in controller).
- `mustResetPassword` is set to `false` for the admin (they chose their own password).
- Controller issues a **JWT for auto-login** (same payload shape as `/api/auth/login`).
- Response returns `{ token, user, tenant }` — no plaintext password exposed.
- `licenseNumber` must be unique (enforced by Prisma `@unique`).
- Default `status` is `ACTIVE`.

---

### 1.3 Users Module

| Attribute              | Value                                                                           |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Path**               | `backend/src/modules/users/`                                                    |
| **Files**              | `user.controller.js`, `user.routes.js`, `user.service.js`, `user.validation.js` |
| **Responsibility**     | Staff CRUD, doctor listing, auto-generated credentials                          |
| **Prisma Models Used** | `User`                                                                          |
| **Dependencies**       | `bcrypt`                                                                        |

**Endpoints**

| Method | Path                 | Auth | Roles                                | Handler            |
| ------ | -------------------- | ---- | ------------------------------------ | ------------------ |
| POST   | `/api/users/create`  | JWT  | `ADMIN`                              | `handleCreateUser` |
| GET    | `/api/users/`        | JWT  | `ADMIN`                              | `handleGetUsers`   |
| PUT    | `/api/users/:id`     | JWT  | `ADMIN`                              | `handleUpdateUser` |
| DELETE | `/api/users/:id`     | JWT  | `ADMIN`                              | `handleDeleteUser` |
| GET    | `/api/users/doctors` | JWT  | `ADMIN, RECEPTIONIST, NURSE, DOCTOR` | `handleGetDoctors` |

**Business Rules**

- Auto-generated temp password: `Temp@{random4digits}` (returned in response for staff creation).
- `mustResetPassword` defaults to `true`.
- Unique constraint on `(email, tenantId)` — one email per hospital. **Email is the sole login identifier** (username field removed).
- `roles` stored as a `String[]` (e.g., `["ADMIN", "DOCTOR"]`).
- Departments: `CARDIOLOGY, DERMATOLOGY, ORTHOPEDICS, RADIOLOGY, NEUROLOGY, GENERAL_MEDICINE`.
- `user.validation.js` exists — **assumption:** contains input sanitization/validation logic (not audited in detail).

---

### 1.4 Patients Module

| Attribute              | Value                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| **Path**               | `backend/src/modules/patients/`                                    |
| **Files**              | `patient.controller.js`, `patient.routes.js`, `patient.service.js` |
| **Responsibility**     | Patient registration and listing                                   |
| **Prisma Models Used** | `Patient`, `User` (doctor relation)                                |
| **Dependencies**       | — (standard Prisma)                                                |

**Endpoints**

| Method | Path                   | Auth | Roles                                | Handler               |
| ------ | ---------------------- | ---- | ------------------------------------ | --------------------- |
| POST   | `/api/patients/create` | JWT  | `ADMIN, RECEPTIONIST, DOCTOR`        | `handleCreatePatient` |
| GET    | `/api/patients/`       | JWT  | `ADMIN, RECEPTIONIST, DOCTOR, NURSE` | `handleGetPatients`   |

**Business Rules**

- Auto-generated `patientUid`: `PAT-{timestamp}-{random}`.
- Types: `OPD` (Outpatient) / `IPD` (Inpatient).
- Optional `doctorId` assignment (primary doctor).
- `photoUrl` field exists but **assumption:** no file upload mechanism is implemented; value is stored as-is if provided.
- Tenant-scoped queries via `tenantId` filter.
- **Assumption:** `PatientDetails` and individual patient fetch (by ID) are handled by frontend calling the same list endpoint or a route not visible in `patient.routes.js`. The route file only exposes `/create` and `/`.

---

### 1.5 Appointments Module

| Attribute              | Value                                                                          |
| ---------------------- | ------------------------------------------------------------------------------ |
| **Path**               | `backend/src/modules/appointments/`                                            |
| **Files**              | `appointment.controller.js`, `appointment.routes.js`, `appointment.service.js` |
| **Responsibility**     | Appointment scheduling, conflict detection, status management                  |
| **Prisma Models Used** | `Appointment`, `Patient`, `User` (doctor)                                      |
| **Dependencies**       | — (standard Prisma)                                                            |

**Endpoints**

| Method | Path                                 | Auth | Roles                                | Handler                         |
| ------ | ------------------------------------ | ---- | ------------------------------------ | ------------------------------- |
| POST   | `/api/appointments/create`           | JWT  | `ADMIN, RECEPTIONIST, DOCTOR, NURSE` | `handleCreateAppointment`       |
| GET    | `/api/appointments/`                 | JWT  | `ADMIN, RECEPTIONIST, DOCTOR, NURSE` | `handleGetAppointments`         |
| GET    | `/api/appointments/:id`              | JWT  | `ADMIN, RECEPTIONIST, DOCTOR, NURSE` | `handleGetAppointmentById`      |
| PUT    | `/api/appointments/:id`              | JWT  | `ADMIN, RECEPTIONIST`                | `handleUpdateAppointment`       |
| PUT    | `/api/appointments/:id/status`       | JWT  | `ADMIN, RECEPTIONIST, DOCTOR`        | `handleUpdateAppointmentStatus` |
| DELETE | `/api/appointments/:id`              | JWT  | `ADMIN, RECEPTIONIST`                | `handleDeleteAppointment`       |
| GET    | `/api/appointments/doctor/:doctorId` | JWT  | `ADMIN, RECEPTIONIST, DOCTOR, NURSE` | `handleGetDoctorAppointments`   |

**Business Rules**

- Time-slot based: 30-minute intervals, 9 AM – 6 PM (defined in frontend `timeSlots.js`).
- Conflict detection: checks if doctor is already booked at same `date + time` with `SCHEDULED` status.
- Cannot book/edit/delete past appointments (business rule documented in architecture).
- Statuses: `SCHEDULED`, `COMPLETED`, `CANCELLED`.
- Includes `patient` and `doctor` relations in queries (Prisma JOIN, not N+1).

---

### 1.6 Prescriptions Module

| Attribute              | Value                                                                             |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Path**               | `backend/src/modules/prescriptions/`                                              |
| **Files**              | `prescription.controller.js`, `prescription.routes.js`, `prescription.service.js` |
| **Responsibility**     | Prescription creation and patient prescription history                            |
| **Prisma Models Used** | `Prescription`, `PrescriptionMedicine`, `Patient`, `User` (doctor)                |
| **Dependencies**       | — (standard Prisma)                                                               |

**Endpoints**

| Method | Path                                    | Auth | Roles                              | Handler                         |
| ------ | --------------------------------------- | ---- | ---------------------------------- | ------------------------------- |
| POST   | `/api/prescriptions/create`             | JWT  | `DOCTOR` (strict)                  | `handleCreatePrescription`      |
| GET    | `/api/prescriptions/patient/:patientId` | JWT  | `ADMIN, DOCTOR, NURSE, PHARMACIST` | `handleGetPatientPrescriptions` |

**Business Rules**

- Only DOCTORs can create prescriptions (strictest RBAC in the system).
- Auto-generated `prescriptionUid`: `RX-{timestamp}-{random}`.
- Contains multiple medicines per prescription (nested `PrescriptionMedicine[]`).
- Each medicine has: `medicineName`, `dosage`, `frequency`, `duration`, `instructions`.
- Tenant-scoped via `tenantId`.

---

### 1.7 Billing Module

| Attribute              | Value                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| **Path**               | `backend/src/modules/billing/`                                     |
| **Files**              | `billing.controller.js`, `billing.routes.js`, `billing.service.js` |
| **Responsibility**     | Bill creation, listing, and payment recording                      |
| **Prisma Models Used** | `Bill`, `BillItem`, `Patient`                                      |
| **Dependencies**       | — (standard Prisma)                                                |

**Endpoints**

| Method | Path                              | Auth | Roles                 | Handler                 |
| ------ | --------------------------------- | ---- | --------------------- | ----------------------- |
| POST   | `/api/billing/create`             | JWT  | `ADMIN, RECEPTIONIST` | `handleCreateBill`      |
| GET    | `/api/billing/`                   | JWT  | `ADMIN, RECEPTIONIST` | `handleGetBills`        |
| GET    | `/api/billing/patient/:patientId` | JWT  | `ADMIN, RECEPTIONIST` | `handleGetPatientBills` |
| POST   | `/api/billing/:billId/pay`        | JWT  | `ADMIN, RECEPTIONIST` | `handleAddPayment`      |

**Business Rules**

- Bill has line items (`BillItem[]`) with `title` and `amount`.
- Tracks `totalAmount`, `paidAmount`, `dueAmount`.
- Statuses: `UNPAID`, `PARTIAL`, `PAID`.
- Partial payments supported via `/pay` endpoint.
- **Assumption:** No payment amount validation (e.g., overpayment check) — not confirmed from route file alone.
- **Assumption:** ACCOUNTANT role is mentioned in architecture doc as having billing access, but the route file only allows `ADMIN, RECEPTIONIST`. This is a discrepancy — the architecture doc may be aspirational or the route was simplified.

---

### 1.8 Dashboard Module

| Attribute              | Value                                                                    |
| ---------------------- | ------------------------------------------------------------------------ |
| **Path**               | `backend/src/modules/dashboard/`                                         |
| **Files**              | `dashboard.controller.js`, `dashboard.routes.js`, `dashboard.service.js` |
| **Responsibility**     | Aggregate statistics for the dashboard overview                          |
| **Prisma Models Used** | `User`, `Patient`, `Appointment`, `Prescription`, `Bill`                 |
| **Dependencies**       | — (standard Prisma)                                                      |

**Endpoints**

| Method | Path                     | Auth | Roles                                                                    | Handler                  |
| ------ | ------------------------ | ---- | ------------------------------------------------------------------------ | ------------------------ |
| GET    | `/api/dashboard/summary` | JWT  | All roles (`ADMIN, RECEPTIONIST, DOCTOR, NURSE, PHARMACIST, ACCOUNTANT`) | `handleDashboardSummary` |

**Business Rules**

- Runs 8 parallel `COUNT` queries via `Promise.all`.
- Tenant-scoped: all counts filtered by `tenantId`.
- **Assumption:** Returns counts for users, patients, appointments (by status), prescriptions, and bills (by status). Exact fields not confirmed without reading the service file.

---

## 2. Backend Middleware (Cross-Cutting)

| Middleware                 | File                                  | Responsibility                                                                                                                               |
| -------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `authenticate`             | `src/middleware/auth.middleware.js`   | Extracts & verifies JWT from `Authorization: Bearer <token>` header. Attaches `req.user` (`{ userId, tenantId, roles }`) and `req.tenantId`. |
| `enforceTenantAccess`      | `src/middleware/tenant.middleware.js` | Validates `req.tenantId` exists (set by `authenticate`). Returns 400 if missing.                                                             |
| `authorizeRoles(...roles)` | `src/middleware/role.middleware.js`   | Checks if any of the user's roles match the allowed roles. Returns 403 if denied.                                                            |

**Pipeline Order:** `authenticate` → `enforceTenantAccess` → `authorizeRoles` → Controller

---

## 3. Backend Config

| File                   | Purpose                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/config/prisma.js` | Prisma Client singleton (`PrismaClient` instance). Shared across all modules.                                                |
| `src/app.js`           | Express app setup: global middleware (helmet, CORS, JSON parser, morgan), route mounting, 404 handler, global error handler. |
| `src/server.js`        | Entry point: loads `.env` via `dotenv`, starts Express on `PORT` (default 4000).                                             |

**Global Middleware Stack (in order):**

1. `helmet()` — security headers
2. `cors({ origin: "*", credentials: true })` — cross-origin (permissive)
3. `express.json()` — body parser
4. `morgan("dev")` — request logging

**Debug Endpoints:**

- `GET /debug/health-app` — health check (no auth)
- `GET /debug/auth-test` — auth pipeline test (requires JWT)

---

## 4. Database (Prisma Schema)

### Models

| Model                  | Table Name             | Tenant-Scoped                   | Key Fields                                                              | Relations                                                                                                         |
| ---------------------- | ---------------------- | ------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Tenant`               | `Tenant`               | No (top-level)                  | `id`, `name`, `licenseNumber` (unique), `status`                        | Has many: `User`, `Patient`, `Prescription`, `Appointment`, `Bill`                                                |
| `User`                 | `User`                 | Yes (`tenantId`)                | `id`, `email`, `roles[]`, `mustResetPassword`, `department`             | Belongs to: `Tenant`. Has many: `Patient` (as doctor), `Prescription`, `Appointment`. Unique: `(email, tenantId)` |
| `Patient`              | `Patient`              | Yes (`tenantId`)                | `id`, `patientUid` (unique), `type` (OPD/IPD), `photoUrl`               | Belongs to: `Tenant`, `User` (doctor). Has many: `Prescription`, `Appointment`, `Bill`                            |
| `Prescription`         | `Prescription`         | Yes (`tenantId`)                | `id`, `prescriptionUid` (unique), `notes`                               | Belongs to: `Tenant`, `Patient`, `User` (doctor). Has many: `PrescriptionMedicine`                                |
| `PrescriptionMedicine` | `PrescriptionMedicine` | Indirect (via `prescriptionId`) | `id`, `medicineName`, `dosage`, `frequency`, `duration`, `instructions` | Belongs to: `Prescription`                                                                                        |
| `Appointment`          | `Appointment`          | Yes (`tenantId`)                | `id`, `date`, `time`, `reason`, `status`                                | Belongs to: `Tenant`, `Patient`, `User` (doctor)                                                                  |
| `Bill`                 | `Bill`                 | Yes (`tenantId`)                | `id`, `totalAmount`, `paidAmount`, `dueAmount`, `status`                | Belongs to: `Tenant`, `Patient`. Has many: `BillItem`                                                             |
| `BillItem`             | `BillItem`             | Indirect (via `billId`)         | `id`, `title`, `amount`                                                 | Belongs to: `Bill`                                                                                                |

### Migrations (12 total)

| #   | Migration                                         | Description                                        |
| --- | ------------------------------------------------- | -------------------------------------------------- |
| 1   | `20251129085516_init_global_schema`               | Initial schema (schema-per-tenant design)          |
| 2   | `20251129094423_add_tenant_entities`              | Add Tenant model and relations                     |
| 3   | `20251129095207_remove_schema_name`               | Pivot from schema-per-tenant to shared schema      |
| 4   | `20251129133646_add_appointment_module`           | Add Appointment model                              |
| 5   | `20251129152052_add_billing_module`               | Add Bill + BillItem models                         |
| 6   | `20251130040922_tenant_status_active_default`     | Default tenant status → `ACTIVE`                   |
| 7   | `20251130043352_cleanup_unused_models`            | Remove `PlatformUser`, `Role`, `Permission` models |
| 8   | `20251206195919_add_temp_password_flag`           | Add temp password tracking                         |
| 9   | `20251206204426_add_must_reset_password`          | Add `mustResetPassword` field to User              |
| 10  | `20251206211157_must_reset_password_true_default` | Default `mustResetPassword` → `true`               |
| 11  | `20251210195500_add_unique_email_per_tenant`      | Unique `(email, tenantId)` constraint              |
| 12  | `20260612000000_remove_username_use_email_login`  | Drop `username` column, use email as login ID      |

---

## 5. Frontend Modules

### 5.1 Pages

| Page Component       | Path                                        | Route                    | Allowed Roles                      |
| -------------------- | ------------------------------------------- | ------------------------ | ---------------------------------- |
| `Dashboard`          | `pages/Dashboard.jsx`                       | `/` (index)              | All roles                          |
| `PatientsList`       | `pages/patients/PatientsList.jsx`           | `/patients`              | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| `CreatePatient`      | `pages/patients/CreatePatient.jsx`          | `/patients/create`       | ADMIN, RECEPTIONIST, DOCTOR        |
| `PatientDetails`     | `pages/patients/PatientDetails.jsx`         | `/patients/:id`          | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| `AppointmentsList`   | `pages/appointments/AppointmentsList.jsx`   | `/appointments`          | ADMIN, DOCTOR, RECEPTIONIST        |
| `CreateAppointment`  | `pages/appointments/CreateAppointment.jsx`  | `/appointments/create`   | ADMIN, RECEPTIONIST                |
| `AppointmentDetails` | `pages/appointments/AppointmentDetails.jsx` | `/appointments/:id`      | ADMIN, RECEPTIONIST, DOCTOR        |
| `EditAppointment`    | `pages/appointments/EditAppointment.jsx`    | `/appointments/:id/edit` | ADMIN, RECEPTIONIST, DOCTOR        |
| `UsersList`          | `pages/users/UsersList.jsx`                 | `/users`                 | ADMIN                              |
| `CreateUser`         | `pages/users/CreateUser.jsx`                | `/users/create`          | ADMIN                              |
| `UserDetails`        | `pages/users/UserDetails.jsx`               | `/users/:id`             | ADMIN                              |
| `EditUser`           | `pages/users/EditUser.jsx`                  | `/users/:id/edit`        | ADMIN                              |
| `PrescriptionsList`  | `pages/prescriptions/PrescriptionsList.jsx` | `/prescriptions`         | ADMIN, DOCTOR, NURSE               |
| `BillingList`        | `pages/billing/BillingList.jsx`             | `/billing`               | ADMIN, ACCOUNTANT                  |
| `ResetPassword`      | `pages/ResetPassword.jsx`                   | `/reset-password`        | ANY (all authenticated)            |
| `Unauthorized`       | `pages/Unauthorized.jsx`                    | `/unauthorized`          | — (shown on 403)                   |
| `Login`              | `pages/Login.jsx`                           | `/login`                 | Public                             |
| `TenantRegister`     | `pages/TenantRegister.jsx`                  | `/register`              | Public                             |

### 5.2 Shared Components

| Component       | Path                                 | Purpose                                           |
| --------------- | ------------------------------------ | ------------------------------------------------- |
| `Layout`        | `components/layout/Layout.jsx`       | Main app shell: Sidebar + Topbar + `<Outlet />`   |
| `Sidebar`       | `components/layout/Sidebar.jsx`      | Fixed left nav (64px), menu items for all modules |
| `Topbar`        | `components/layout/Topbar.jsx`       | Fixed top bar (70px), user info, logout           |
| `ComingSoon`    | `components/common/ComingSoon.jsx`   | Placeholder for unimplemented features            |
| `UserForm`      | `components/users/UserForm.jsx`      | Shared create/edit form for users                 |
| `UserRoleChips` | `components/users/UserRoleChips.jsx` | Multi-select role chips for user forms            |

### 5.3 State Management (Redux Toolkit)

| Slice  | File                 | State Shape                        | Actions                       |
| ------ | -------------------- | ---------------------------------- | ----------------------------- |
| `auth` | `store/authSlice.js` | `{ token, user, isAuthenticated }` | `setCredentials`, `logout`    |
| `ui`   | `store/uiSlice.js`   | `{ sidebarOpen, globalLoading }`   | `toggleSidebar`, `setLoading` |

**Persistence:** `token` and `user` are synced to/from `localStorage`. Reads from `localStorage` are wrapped in try/catch to handle corrupted data (e.g., literal `"undefined"` string). Write guard prevents storing `undefined` user objects.
**Store config:** `store/index.js` — standard `configureStore` with both slice reducers.

### 5.4 API Layer

| File               | Purpose                                                             | API Calls                                                              |
| ------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `utils/axios.js`   | Axios instance with request interceptors                            | Auto-attaches `Authorization: Bearer <token>` and `x-tenant-id` header |
| `api/dashboard.js` | Dashboard API                                                       | `GET /dashboard/summary`                                               |
| `api/tenants/`     | **Empty directory** — tenant API calls are made inline (assumption) | —                                                                      |

**Assumption:** Most API calls are made directly from page components using the shared `api` (axios) instance rather than centralized API service files. Only `dashboard.js` exists as a dedicated API module.

### 5.5 Utilities

| File                   | Exports                   | Purpose                                               |
| ---------------------- | ------------------------- | ----------------------------------------------------- |
| `utils/axios.js`       | `api` (default)           | Configured axios instance with auth interceptors      |
| `utils/formatDate.js`  | `formatDate(raw, locale)` | Formats dates to `en-IN` locale (e.g., "Jan 1, 2026") |
| `utils/formatTime.js`  | `formatTime(timeStr)`     | Converts 24h `HH:mm` to 12h format (e.g., "2:30 PM")  |
| `utils/permissions.js` | `hasRole(user, roles)`    | Checks if user has any of the specified roles         |

### 5.6 Constants

| File                                | Exports                                                                                       | Purpose                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `components/users/userConstants.js` | `ROLES`, `ROLE_OPTIONS`, `DEPARTMENTS`, `DEPARTMENT_OPTIONS`, `USER_STATUS`, `STATUS_OPTIONS` | Enum-like constants for roles, departments, user status                   |
| `constants/timeSlots.js`            | `TIME_SLOTS`                                                                                  | Generated array of `{ value, label }` for 9 AM – 6 PM in 30-min intervals |

### 5.7 Routing & Guards

| File                        | Purpose                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `routes/AppRouter.jsx`      | Root router: public routes (`/login`, `/register`) + protected layout with auto-generated child routes from `config/routes.js`    |
| `routes/ProtectedRoute.jsx` | Auth guard: redirects to `/login` if no token, forces `/reset-password` if `mustResetPassword`, RBAC check against `allowedRoles` |
| `config/routes.js`          | Data-driven route config array with `{ path, element, roles }`                                                                    |

---

## 6. Dependency Summary

### Backend (Production)

| Package          | Version | Purpose                            |
| ---------------- | ------- | ---------------------------------- |
| `@prisma/client` | ^5.16.1 | Database ORM                       |
| `bcrypt`         | ^6.0.0  | Password hashing                   |
| `cors`           | ^2.8.5  | Cross-origin resource sharing      |
| `dotenv`         | ^17.2.3 | Environment variable loading       |
| `express`        | ^4.21.2 | Web framework                      |
| `helmet`         | ^8.1.0  | Security headers                   |
| `jsonwebtoken`   | ^9.0.2  | JWT generation & verification      |
| `morgan`         | ^1.10.1 | HTTP request logging               |
| `pg`             | ^8.16.3 | PostgreSQL driver (used by Prisma) |
| `prisma`         | ^5.16.1 | Prisma CLI (migrations, generate)  |
| `uuid`           | ^13.0.0 | UUID generation                    |

### Backend (Dev)

| Package   | Version | Purpose                 |
| --------- | ------- | ----------------------- |
| `nodemon` | ^3.1.11 | Dev server auto-restart |

### Frontend (Production)

| Package               | Version  | Purpose                            |
| --------------------- | -------- | ---------------------------------- |
| `@emotion/react`      | ^11.14.0 | CSS-in-JS (MUI dependency)         |
| `@emotion/styled`     | ^11.14.1 | Styled components (MUI dependency) |
| `@mui/icons-material` | ^7.3.5   | Material Design icons              |
| `@mui/material`       | ^7.3.5   | Material-UI component library      |
| `@mui/x-data-grid`    | ^8.20.0  | Data grid/table component          |
| `@reduxjs/toolkit`    | ^2.11.0  | Redux state management toolkit     |
| `axios`               | ^1.13.2  | HTTP client                        |
| `react`               | ^19.2.0  | UI library                         |
| `react-dom`           | ^19.2.0  | React DOM renderer                 |
| `react-redux`         | ^9.2.0   | React-Redux bindings               |
| `react-router-dom`    | ^7.9.6   | Client-side routing                |

### Frontend (Dev)

| Package                | Version  | Purpose                      |
| ---------------------- | -------- | ---------------------------- |
| `@vitejs/plugin-react` | ^5.1.1   | Vite React plugin (HMR, JSX) |
| `autoprefixer`         | ^10.4.22 | PostCSS autoprefixer         |
| `eslint`               | ^9.39.1  | Linting                      |
| `postcss`              | ^8.5.6   | CSS processing               |
| `tailwindcss`          | ^3.4.1   | Utility-first CSS framework  |
| `vite`                 | ^7.2.4   | Build tool & dev server      |

---

## 7. Module Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (SPA)                    │
│  React 19 + Redux Toolkit + MUI + Tailwind + Vite   │
└──────────────────────────┬──────────────────────────┘
                           │ REST / JWT
                           ▼
┌─────────────────────────────────────────────────────┐
│                  Backend (Express)                    │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   Auth   │  │  Tenant  │  │     Dashboard     │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Users   │──│ Patients │──│  Appointments     │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                       │
│  ┌──────────────────┐  ┌────────────────────────┐  │
│  │  Prescriptions   │  │       Billing           │  │
│  └──────────────────┘  └────────────────────────┘  │
│                                                       │
│  Middleware: authenticate → enforceTenant → RBAC     │
└──────────────────────────┬──────────────────────────┘
                           │ Prisma ORM
                           ▼
┌─────────────────────────────────────────────────────┐
│            PostgreSQL (Shared Database)               │
│     8 models, tenantId row-level isolation            │
└─────────────────────────────────────────────────────┘
```

---

## 8. Known Gaps & Discrepancies

| #   | Issue                                             | Detail                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Billing role mismatch**                         | Architecture doc says ACCOUNTANT has billing access, but `billing.routes.js` only allows `ADMIN, RECEPTIONIST`.                                                                                                                                                                                                         |
| 2   | **No patient detail route**                       | `patient.routes.js` only has `/create` and `/` (list). Frontend has `PatientDetails` page at `/patients/:id` but no corresponding backend endpoint is visible. **Assumption:** Patient details may be fetched via the list endpoint with filtering, or a route exists in the controller not exposed in the routes file. |
| 3   | **Empty `api/tenants/` directory**                | Frontend tenant API calls appear to be inline rather than centralized.                                                                                                                                                                                                                                                  |
| 4   | **NURSE role missing from appointments frontend** | Backend allows NURSE for appointment creation, but frontend `config/routes.js` does not include NURSE for `appointments/create`.                                                                                                                                                                                        |
| 5   | **No PHARMACIST routes**                          | PHARMACIST role exists but has no dedicated pages except prescription read access. No pharmacy management module.                                                                                                                                                                                                       |
| 6   | **No edit patient/appointment creation pages**    | `EditAppointment` exists but no `EditPatient` page. Patient editing may not be implemented.                                                                                                                                                                                                                             |
| 7   | **No `api/` files for most modules**              | Most API calls are likely made directly in page components. Only `dashboard.js` exists as a dedicated API service.                                                                                                                                                                                                      |

---

**End of Module Inventory**
