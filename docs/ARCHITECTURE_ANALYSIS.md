# HMS Architecture Analysis

**Document Type:** Technical Architecture Reverse-Engineering  
**Project:** Hospital Management System (Multi-Tenant SaaS)  
**Analysis Date:** June 12, 2026  
**Analyzed By:** Senior Staff Engineer

---

## Executive Summary

This is a **multi-tenant SaaS Hospital Management System** built with a modern full-stack JavaScript architecture. The system enables hospitals to onboard as tenants with complete data isolation, providing modules for patient management, appointments, prescriptions, billing, and staff administration.

**Key Architectural Decisions:**

- **Shared-database multi-tenancy** with tenant ID scoping (not schema-per-tenant)
- **JWT-based stateless authentication** with RBAC
- **Modular monolith backend** with clear separation of concerns
- **Redux Toolkit** for frontend state management
- **Material-UI + Tailwind CSS** hybrid styling approach

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              React 19 + Vite + Redux Toolkit                 │
│         (SPA with client-side routing & state)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS (REST API)
                         │ JWT Bearer Token
                         │ x-tenant-id header
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│           Node.js + Express (ES Modules)                     │
│         Modular Monolith Architecture                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Middleware Stack                                   │    │
│  │  - Helmet (security headers)                       │    │
│  │  - CORS (cross-origin)                             │    │
│  │  - Morgan (logging)                                │    │
│  │  - Authentication (JWT verification)               │    │
│  │  - Tenant Context Enforcement                      │    │
│  │  - Role-Based Access Control (RBAC)                │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         │ PostgreSQL Wire Protocol
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│              PostgreSQL (Single Instance)                    │
│         Shared Database with tenantId Scoping                │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer                  | Technology        | Version         | Purpose                    |
| ---------------------- | ----------------- | --------------- | -------------------------- |
| **Frontend Framework** | React             | 19.2.0          | UI rendering               |
| **Build Tool**         | Vite              | 7.2.4           | Fast dev server & bundling |
| **State Management**   | Redux Toolkit     | 2.11.0          | Global state (auth, UI)    |
| **Routing**            | React Router DOM  | 7.9.6           | Client-side routing        |
| **UI Components**      | Material-UI (MUI) | 7.3.5           | Component library          |
| **Styling**            | Tailwind CSS      | 3.4.1           | Utility-first CSS          |
| **HTTP Client**        | Axios             | 1.13.2          | API requests               |
| **Backend Runtime**    | Node.js           | (implied)       | Server runtime             |
| **Web Framework**      | Express           | 4.21.2          | HTTP server & routing      |
| **ORM**                | Prisma            | 5.16.1          | Database abstraction       |
| **Database**           | PostgreSQL        | (not specified) | Persistent storage         |
| **Authentication**     | JWT               | 9.0.2           | Stateless auth tokens      |
| **Password Hashing**   | bcrypt            | 6.0.0           | Secure password storage    |
| **Security Headers**   | Helmet            | 8.1.0           | HTTP security              |
| **Logging**            | Morgan            | 1.10.1          | Request logging            |

---

## 2. Business Domain

### 2.1 Core Business Entities

The system models a **hospital management domain** with the following key entities:

#### Tenant (Hospital)

- Represents a hospital or healthcare facility
- Top-level entity for multi-tenancy
- Uniquely identified by `licenseNumber`
- **Status:** ACTIVE (default), PENDING (future verification flow)

#### User (Staff)

- Hospital staff members scoped to a tenant
- **Roles:** ADMIN, DOCTOR, NURSE, PHARMACIST, RECEPTIONIST, ACCOUNTANT
- **Departments:** CARDIOLOGY, DERMATOLOGY, ORTHOPEDICS, RADIOLOGY, NEUROLOGY, GENERAL_MEDICINE
- Login identifier: **email** (unique per tenant via `@@unique([email, tenantId])`)
- Staff users receive temporary passwords (`Temp@XXXX`) with forced reset on first login (`mustResetPassword` flag)
- Tenant admin chooses their own password during registration (no forced reset)

#### Patient

- Patients registered under a tenant
- **Types:** OPD (Outpatient) / IPD (Inpatient)
- Unique `patientUid` (e.g., `PAT-1718234567890-123`)
- Can be assigned to a primary doctor
- Demographics: DOB, gender, blood group, contact info

#### Appointment

- Scheduled consultations between patients and doctors
- **Status:** SCHEDULED, COMPLETED, CANCELLED
- Time-slot based (30-minute intervals, 9 AM - 6 PM)
- Conflict detection prevents double-booking
- Business rules: cannot book/edit/delete past appointments

#### Prescription

- Medical prescriptions issued by doctors
- Unique `prescriptionUid` (e.g., `RX-1718234567890-123`)
- Contains multiple medicines with dosage, frequency, duration, instructions
- Only DOCTORs can create prescriptions

#### Bill

- Financial charges for patient services
- **Status:** UNPAID, PARTIAL, PAID
- Line items (e.g., "Consultation Fee", "Lab Test")
- Tracks total, paid, and due amounts
- Partial payments supported

### 2.2 Business Workflows

#### 1. Tenant Onboarding Flow

```
Hospital Registration Form
  (name, address, license number, contact email/phone,
   admin password — self-chosen by user)
  ↓
POST /api/tenants/register
  ↓
Backend validates password (min 8 chars)
  ↓
Transaction: Create Tenant + Admin User
  (admin password hashed with bcrypt, mustResetPassword = false)
  ↓
Backend issues JWT for auto-login
  ↓
Frontend stores token + user in Redux/localStorage
  ↓
Redirected to Dashboard (no separate login step needed)
```

#### 2. Patient Journey

```
Patient Registration (by Admin/Receptionist/Doctor)
  ↓
Create Patient Record (tenant-scoped)
  ↓
Book Appointment (with doctor, date, time)
  ↓
Doctor Consultation
  ↓
Create Prescription (doctor-only)
  ↓
Generate Bill (Admin/Receptionist)
  ↓
Record Payments (partial/full)
```

#### 3. User Management Flow

```
Admin Creates User
  ↓
Auto-generate temp password (Temp@XXXX)
  ↓
Assign roles + department (validation)
  ↓
User logs in with email + temp password → forced password reset
  ↓
RBAC controls feature access
```

---

## 3. Database Design

### 3.1 Schema Architecture

**Multi-Tenancy Strategy:** Shared database with `tenantId` foreign key on all tenant-scoped tables.

**Evolution:**

- **Initial design:** Schema-per-tenant (with `schemaName` field)
- **Current design:** Single shared schema with row-level tenant isolation

**Assumption:** The schema-per-tenant approach was abandoned due to complexity (migrations, connection pooling). The current design uses application-level tenant scoping via `tenantId` filters.

### 3.2 Entity-Relationship Diagram

```
┌──────────────┐
│   Tenant     │
│ (Hospital)   │
└──────┬───────┘
       │ 1:N
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌──────────────┐                   ┌──────────────┐
│    User      │                   │   Patient    │
│ (Staff)      │                   │              │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       │ 1:N                              │ 1:N
       │                                  │
       ▼                                  ▼
┌──────────────┐                   ┌──────────────┐
│Prescription  │                   │ Appointment  │
│              │                   │              │
└──────┬───────┘                   └──────────────┘
       │
       │ 1:N
       ▼
┌────────────────────┐
│PrescriptionMedicine│
│                    │
└────────────────────┘

┌──────────────┐
│    Bill      │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│  BillItem    │
└──────────────┘
```

### 3.3 Key Constraints & Indexes

| Table        | Constraint           | Type   | Purpose                                            |
| ------------ | -------------------- | ------ | -------------------------------------------------- |
| Tenant       | `licenseNumber`      | UNIQUE | Prevent duplicate hospital registrations           |
| User         | `email` + `tenantId` | UNIQUE | One email per user per hospital (login identifier) |
| Patient      | `patientUid`         | UNIQUE | Unique patient identifier                          |
| Prescription | `prescriptionUid`    | UNIQUE | Unique prescription identifier                     |

**Missing Indexes (Potential Performance Issues):**

- No composite index on `(tenantId, status)` for Appointment queries
- No index on `doctorId` + `date` + `time` for conflict detection
- No index on `patientId` for billing/prescription lookups

**Assumption:** Indexes may exist in production but are not explicitly defined in the Prisma schema.

---

## 4. Backend Architecture

### 4.1 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── migrations/            # SQL migration files (12 migrations)
├── src/
│   ├── config/
│   │   └── prisma.js          # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── role.middleware.js       # RBAC enforcement
│   │   └── tenant.middleware.js     # Tenant context validation
│   ├── modules/
│   │   ├── auth/              # Authentication (login, reset password)
│   │   ├── tenant/            # Tenant registration
│   │   ├── users/             # User CRUD
│   │   ├── patients/          # Patient management
│   │   ├── appointments/      # Appointment scheduling
│   │   ├── prescriptions/     # Prescription management
│   │   ├── billing/           # Billing & payments
│   │   └── dashboard/         # Analytics/summary
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
└── .env                       # Environment variables
```

### 4.2 Modular Architecture Pattern

Each module follows a **layered architecture**:

```
Routes (HTTP layer)
  ↓
Controller (request/response handling)
  ↓
Service (business logic)
  ↓
Prisma (database access)
```

**Example: Appointment Module**

- `appointment.routes.js` → defines endpoints + middleware
- `appointment.controller.js` → extracts params, calls service, formats response
- `appointment.service.js` → validates business rules, executes DB operations

### 4.3 Middleware Pipeline

```
Request
  ↓
Helmet (security headers)
  ↓
CORS (cross-origin configuration)
  ↓
Express JSON Parser
  ↓
Morgan (request logging)
  ↓
[Route-specific middleware]
  ├─ authenticate (JWT verification)
  ├─ enforceTenantAccess (tenant context check)
  └─ authorizeRoles (RBAC check)
  ↓
Controller
  ↓
Response
```

### 4.4 API Endpoints

#### Public Endpoints

| Method | Endpoint                | Purpose             |
| ------ | ----------------------- | ------------------- |
| POST   | `/api/auth/login`       | User authentication |
| POST   | `/api/tenants/register` | Hospital onboarding |
| GET    | `/debug/health-app`     | Health check        |

#### Protected Endpoints (require JWT)

| Module        | Endpoints                  | Access Control                         |
| ------------- | -------------------------- | -------------------------------------- |
| Auth          | `/api/auth/reset-password` | Any authenticated user                 |
| Tenants       | `/api/tenants/:id`         | Any authenticated user                 |
| Users         | `/api/users/*`             | ADMIN only                             |
| Patients      | `/api/patients/*`          | ADMIN, DOCTOR, NURSE, RECEPTIONIST     |
| Appointments  | `/api/appointments/*`      | Role-based (varies by operation)       |
| Prescriptions | `/api/prescriptions/*`     | DOCTOR (create), multiple roles (read) |
| Billing       | `/api/billing/*`           | ADMIN, RECEPTIONIST, ACCOUNTANT        |
| Dashboard     | `/api/dashboard/summary`   | All authenticated roles                |

### 4.5 Business Logic Highlights

#### Appointment Conflict Detection

```javascript
// Checks if doctor is already booked at same date/time
const conflict = await prisma.appointment.findFirst({
  where: {
    doctorId,
    date: appointmentDate,
    time,
    status: 'SCHEDULED',
  },
});
```

#### Tenant-Scoped Queries

All service methods filter by `tenantId` to ensure data isolation:

```javascript
await prisma.patient.findMany({
  where: { tenantId }, // ← tenant isolation
});
```

#### User Creation with Auto-Generated Temp Password

```javascript
// Staff users created by ADMIN get a temp password (must reset on first login)
const tempPassword = `Temp@${Math.floor(1000 + Math.random() * 9000)}`;
// No username field — email is the login identifier
```

---

## 5. Frontend Architecture

### 5.1 Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── dashboard.js         # Dashboard API calls
│   │   └── tenants/             # (empty - direct API calls)
│   ├── components/
│   │   ├── common/              # Reusable components (ComingSoon)
│   │   ├── layout/              # Layout (Sidebar, Topbar, Layout)
│   │   └── users/               # User-specific components
│   ├── config/
│   │   └── routes.js            # Route configuration with RBAC
│   ├── constants/
│   │   └── timeSlots.js         # Appointment time slots (9AM-6PM)
│   ├── pages/
│   │   ├── appointments/        # Appointment CRUD pages
│   │   ├── billing/             # Billing list
│   │   ├── patients/            # Patient management pages
│   │   ├── prescriptions/       # Prescription list
│   │   ├── users/               # User management pages
│   │   ├── Dashboard.jsx        # Dashboard overview
│   │   ├── Login.jsx            # Login page
│   │   ├── ResetPassword.jsx    # Password reset
│   │   ├── TenantRegister.jsx   # Hospital registration
│   │   └── Unauthorized.jsx     # 403 page
│   ├── routes/
│   │   ├── AppRouter.jsx        # Main router
│   │   └── ProtectedRoute.jsx   # Auth + RBAC guard
│   ├── store/
│   │   ├── authSlice.js         # Auth state (token, user)
│   │   ├── uiSlice.js           # UI state (sidebar, loading)
│   │   └── index.js             # Redux store config
│   ├── utils/
│   │   ├── axios.js             # Axios instance + interceptors
│   │   ├── formatDate.js        # Date formatting (en-IN locale)
│   │   ├── formatTime.js        # Time formatting (12-hour)
│   │   └── permissions.js       # Role-checking utility
│   ├── App.jsx                  # Root component
│   └── main.jsx                 # Entry point
└── .env                         # API base URL
```

### 5.2 State Management

**Redux Toolkit** manages two slices:

#### Auth Slice

```javascript
{
  token: string | null,
  user: {
    id, tenantId, email, roles, department, status, mustResetPassword
  } | null,
  isAuthenticated: boolean
}
```

**Persistence:** Token and user stored in `localStorage` for session persistence. `localStorage` reads are wrapped in try/catch to handle corrupted data gracefully.

#### UI Slice

```javascript
{
  sidebarOpen: boolean,
  globalLoading: boolean
}
```

### 5.3 Routing Architecture

**Data-driven routing** with RBAC:

```javascript
// config/routes.js
export const ROUTES = [
  {
    path: 'patients',
    element: PatientsList,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  },
  // ...
];
```

**Route Protection:**

```javascript
<ProtectedRoute allowedRoles={r.roles}>
  <Component />
</ProtectedRoute>
```

**Special Cases:**

- `roles: "ANY"` → any authenticated user
- `mustResetPassword` → redirect to `/reset-password`

### 5.4 API Integration

**Axios Interceptor Pattern:**

```javascript
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  // Auto-attach tenant ID
  const user = store.getState().auth.user;
  if (user?.tenantId) {
    config.headers['x-tenant-id'] = user.tenantId;
  }
});
```

**Assumption:** The `x-tenant-id` header is sent but **not used** by the backend. Tenant context is derived from the JWT token (`req.tenantId`).

### 5.5 UI/UX Architecture

**Layout System:**

```
<Layout>
  <Sidebar /> (fixed left, 64px width)
  <div>
    <Topbar /> (fixed top, 70px height)
    <main>
      <Outlet /> (nested routes)
    </main>
  </div>
</Layout>
```

**Styling Approach:**

- **Tailwind CSS** for layout, spacing, colors
- **Material-UI** for form components (TextField, Button, Card, etc.)
- **Hybrid approach:** Tailwind classes + MUI `sx` prop

**Sidebar Navigation:**

```javascript
const menuItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Patients', path: '/patients' },
  { label: 'Appointments', path: '/appointments' },
  { label: 'Prescriptions', path: '/prescriptions' },
  { label: 'Billing', path: '/billing' },
  { label: 'Users', path: '/users' },
];
```

**Assumption:** Sidebar menu is **not dynamically filtered** by role. All menu items are visible regardless of user permissions. RBAC is enforced at the route level (user sees 403 page if unauthorized).

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
1. User submits email + password
   ↓
2. POST /api/auth/login
   ↓
3. Backend finds user by email, validates password (bcrypt compare)
   ↓
4. Generate JWT with payload:
   {
     userId: string,
     tenantId: string,
     roles: string[]
   }
   ↓
5. Return token + user object
   ↓
6. Frontend stores in Redux + localStorage
   ↓
7. Axios interceptor attaches token to all requests
   ↓
8. ProtectedRoute checks token + mustResetPassword
```

### 6.2 JWT Token Structure

```javascript
{
  userId: "abc-123-...",
  tenantId: "xyz-456-...",
  roles: ["ADMIN", "DOCTOR"],
  iat: 1718234567,
  exp: 1718238167  // 1 hour expiry
}
```

**Security Observations:**

- Token expiry: 1 hour (reasonable)
- No refresh token mechanism (user must re-login)
- JWT secret stored in `.env` (not rotated)

**Assumption:** No token refresh mechanism exists. Users are logged out after 1 hour of inactivity.

### 6.3 Authorization Model

**Two-Layer Authorization:**

#### Layer 1: Tenant Isolation

```javascript
// Middleware
export function enforceTenantAccess(req, res, next) {
  if (!req.tenantId) {
    return res.status(400).json({ message: 'Tenant context missing' });
  }
  next();
}
```

#### Layer 2: Role-Based Access Control (RBAC)

```javascript
// Middleware
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.user.roles;
    const hasPermission = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasPermission) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}
```

**Role Matrix:**

| Feature                | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT |
| ---------------------- | ----- | ------ | ----- | ------------ | ---------- | ---------- |
| User Management        | ✅    | ❌     | ❌    | ❌           | ❌         | ❌         |
| Patient CRUD           | ✅    | ✅     | ✅    | ✅           | ❌         | ❌         |
| Appointments           | ✅    | ✅     | ✅    | ✅           | ❌         | ❌         |
| Prescriptions (create) | ❌    | ✅     | ❌    | ❌           | ❌         | ❌         |
| Prescriptions (read)   | ✅    | ✅     | ✅    | ❌           | ✅         | ❌         |
| Billing                | ✅    | ❌     | ❌    | ✅           | ❌         | ✅         |
| Dashboard              | ✅    | ✅     | ✅    | ✅           | ✅         | ✅         |

### 6.4 Password Management

**Forced Reset on First Login:**

```javascript
// User creation
mustResetPassword: true;

// After reset
mustResetPassword: false;
```

**Frontend Enforcement:**

```javascript
if (user?.mustResetPassword && location.pathname !== '/reset-password') {
  return <Navigate to='/reset-password' replace />;
}
```

**Assumption:** No password complexity requirements enforced. Users can set any password during reset.

---

## 7. External Integrations

### 7.1 Current Integrations

**None detected.** The system is a **standalone monolith** with no external service integrations.

### 7.2 Potential Future Integrations

Based on the domain, these would be typical:

| Integration                        | Purpose                           | Status                                             |
| ---------------------------------- | --------------------------------- | -------------------------------------------------- |
| Email Service (SendGrid, AWS SES)  | Send appointment reminders, bills | Not implemented                                    |
| SMS Gateway (Twilio)               | Patient notifications             | Not implemented                                    |
| Payment Gateway (Stripe, Razorpay) | Online bill payments              | Not implemented                                    |
| Calendar API (Google Calendar)     | Sync appointments                 | Not implemented                                    |
| EHR/EMR Standards (HL7, FHIR)      | Interoperability                  | Not implemented                                    |
| Cloud Storage (S3, GCS)            | Patient photos, documents         | Not implemented (photoUrl field exists but unused) |

**Assumption:** The `photoUrl` field on Patient suggests planned image upload functionality, but no storage integration exists.

---

## 8. Deployment & Infrastructure

### 8.1 Environment Configuration

**Backend (.env):**

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hms_global?schema=public"
PORT=4000
JWT_SECRET="super-secret-key"
```

**Frontend (.env):**

```bash
VITE_API_URL=https://hms-project-be.onrender.com/api
# VITE_API_URL=http://localhost:4000/api
```

**Observation:** Backend is deployed on **Render** (cloud PaaS). Frontend likely on Vercel/Netlify (not confirmed).

### 8.2 Database Migrations

**12 migrations** tracked in `prisma/migrations/` (as of latest):

1. Initial schema (schema-per-tenant design)
2. Add tenant entities
3. Remove `schemaName` (pivot to shared schema)
4. Add appointment module
5. Add billing module
6. Tenant status default change
7. Cleanup unused models (PlatformUser, Role, Permission)
8. Add temp password flag
9. Add `mustResetPassword` field
10. Default `mustResetPassword` to true
11. Unique email per tenant constraint
12. Remove `username` column, use email as login identifier

**Migration Strategy:** Prisma Migrate with SQL files. No seeding scripts detected.

### 8.3 Build & Deployment

**Backend:**

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "migrate": "prisma migrate dev",
    "postinstall": "prisma generate && prisma migrate deploy"
  }
}
```

**Frontend:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Assumption:** Production deployment uses `npm start` (Node.js) and `vite build` (static assets). No Docker/containerization detected.

---

## 9. Security Analysis

### 9.1 Security Strengths

✅ **JWT-based stateless auth** (no session hijacking risk)  
✅ **Password hashing with bcrypt** (10 rounds, industry standard)  
✅ **Helmet middleware** (security headers)  
✅ **Tenant isolation** (application-level scoping)  
✅ **RBAC enforcement** (backend + frontend)  
✅ **SQL injection prevention** (Prisma ORM parameterized queries)  
✅ **CORS configured** (though `origin: "*"` is permissive)

### 9.2 Security Concerns

⚠️ **Hardcoded JWT secret** in `.env` (should use environment-specific secrets)  
⚠️ **No rate limiting** (brute-force login attacks possible)  
⚠️ **No password complexity validation** (weak passwords allowed)  
⚠️ **CORS allows all origins** (`origin: "*"`)  
⚠️ **No HTTPS enforcement** (assumed handled by reverse proxy)  
⚠️ **Sensitive data in JWT** (roles array could be large)  
⚠️ **No audit logging** (who did what, when)  
⚠️ **Staff temp passwords returned in API responses** (user creation only — tenant registration no longer exposes passwords)

**Resolved Issue (Tenant Registration):**

```javascript
// tenant.controller.js — FIXED
// Admin chooses own password during registration.
// Backend returns JWT for auto-login (same shape as /api/auth/login response).
// No plaintext password is ever returned in the response.
return res.status(201).json({
  token,
  user: { id, tenantId, email, roles, department, status, mustResetPassword },
  tenant: { id, name, status },
});
```

**Remaining Concern (Staff User Creation):**

```javascript
// user.service.js — still returns temp password
return { id, email, roles, tempPassword };
```

**Recommendation:** Send staff temp passwords via email instead of HTTP response.

### 9.3 Data Validation Gaps

| Field            | Current Validation   | Recommended                      |
| ---------------- | -------------------- | -------------------------------- |
| Email            | None (frontend only) | Backend regex + domain whitelist |
| Phone            | None                 | E.164 format validation          |
| Date of Birth    | None                 | Age range validation (0-120)     |
| Appointment Date | Past date check      | Max future date (e.g., 6 months) |
| Bill Amount      | None                 | Positive number, max limit       |

---

## 10. Performance Considerations

### 10.1 Database Query Patterns

**N+1 Query Risk:**

```javascript
// appointment.service.js
include: { patient: true, doctor: true }
```

Prisma uses `JOIN` under the hood, so this is **not** an N+1 issue.

**Potential Slow Queries:**

```javascript
// Dashboard summary - 8 parallel COUNT queries
const [...] = await Promise.all([
  prisma.user.count({ where: { tenantId } }),
  prisma.patient.count({ where: { tenantId } }),
  // ... 6 more
]);
```

**Optimization:** Use a single query with `GROUP BY` or materialized views for large datasets.

### 10.2 Missing Indexes

```sql
-- Recommended indexes
CREATE INDEX idx_appointment_doctor_date_time
  ON Appointment(doctorId, date, time)
  WHERE status = 'SCHEDULED';

CREATE INDEX idx_appointment_tenant_status
  ON Appointment(tenantId, status);

CREATE INDEX idx_patient_tenant_type
  ON Patient(tenantId, type);

CREATE INDEX idx_bill_tenant_status
  ON Bill(tenantId, status);
```

### 10.3 Frontend Performance

**Code Splitting:** Not implemented. All routes are eagerly loaded.

**Recommendation:**

```javascript
// Lazy load routes
const Dashboard = lazy(() => import('../pages/Dashboard'));
```

**Large Dependencies:**

- MUI (Material-UI) is a heavy library
- Consider tree-shaking or lighter alternatives (e.g., Radix UI)

---

## 11. Testing Strategy

### 11.1 Current State

**No tests detected.** Neither backend nor frontend have test files.

### 11.2 Recommended Testing Approach

| Layer                   | Tool                  | Coverage Target |
| ----------------------- | --------------------- | --------------- |
| Unit Tests (services)   | Jest / Vitest         | 80%             |
| Integration Tests (API) | Supertest             | 70%             |
| E2E Tests (UI)          | Playwright / Cypress  | Critical paths  |
| Component Tests         | React Testing Library | 60%             |

**Critical Test Scenarios:**

- Tenant isolation (user A cannot access tenant B's data)
- Appointment conflict detection
- RBAC enforcement
- Payment amount validation
- Password reset flow

---

## 12. Assumptions & Uncertainties

### 12.1 Explicit Assumptions

1. **Database Indexes:** Assumed to exist in production but not in Prisma schema
2. **Token Refresh:** No refresh token mechanism; users re-login after 1 hour
3. **Sidebar Visibility:** All menu items visible; RBAC enforced at route level
4. **Password Policy:** No complexity requirements enforced
5. **Deployment:** Backend on Render, frontend on static host (unconfirmed)
6. **Data Seeding:** No seed scripts; initial data created via API
7. **Audit Trail:** No logging of who created/updated records
8. **Backup Strategy:** Not defined in codebase
9. **Monitoring:** No APM or error tracking (Sentry, Datadog) detected
10. **CI/CD:** No GitHub Actions or CI pipeline files detected
11. **Tenant admin password:** User chooses their own password during registration (min 8 chars); no hardcoded temp password
12. **Login identifier:** Email is used as the sole login identifier (username field has been removed)

### 12.2 Areas of Uncertainty

| Area                | Uncertainty                                         | Impact                   |
| ------------------- | --------------------------------------------------- | ------------------------ |
| Production database | Is it the same PostgreSQL instance for all tenants? | Scalability              |
| File storage        | Where are patient photos stored?                    | Feature completeness     |
| Email delivery      | How are credentials communicated securely?          | Security                 |
| Concurrent users    | What's the expected load per tenant?                | Performance tuning       |
| Data retention      | How long are records kept?                          | Compliance (HIPAA, GDPR) |
| Disaster recovery   | What's the backup/restore strategy?                 | Business continuity      |

---

## 13. Recommendations

### 13.1 Immediate Priorities (P0)

1. **Implement rate limiting** on `/api/auth/login` to prevent brute-force attacks
2. **Remove temp passwords from API responses** (send via email)
3. **Add database indexes** for appointment conflict detection and dashboard queries
4. **Enforce password complexity** (min 8 chars, uppercase, lowercase, number, special)
5. **Restrict CORS origins** to specific frontend domain(s)

### 13.2 Short-Term Improvements (P1)

1. **Add refresh token mechanism** for better UX (no re-login every hour)
2. **Implement audit logging** (who created/updated/deleted records)
3. **Add unit tests** for service layer (especially business logic)
4. **Lazy load frontend routes** for better initial load performance
5. **Add error tracking** (Sentry or similar)

### 13.3 Medium-Term Enhancements (P2)

1. **Email/SMS notifications** for appointments, prescriptions, bills
2. **Dynamic sidebar menu** filtered by user role
3. **Payment gateway integration** for online bill payments
4. **File upload service** for patient photos, documents
5. **API documentation** (Swagger/OpenAPI)

### 13.4 Long-Term Architecture (P3)

1. **Microservices migration** (split billing, appointments, etc.)
2. **Event-driven architecture** (message queue for async operations)
3. **Multi-region deployment** for global hospitals
4. **Compliance certifications** (HIPAA, GDPR, SOC 2)

---

## 14. Conclusion

This is a **well-structured, modern full-stack application** with clear separation of concerns and good foundational patterns. The multi-tenant architecture is sound, though it has evolved from a schema-per-tenant design to a shared-schema approach.

**Strengths:**

- Clean modular architecture
- Proper use of ORM for type safety
- JWT + RBAC security model
- Modern React patterns (Redux Toolkit, hooks)

**Weaknesses:**

- No testing coverage
- Security gaps (rate limiting, password policy)
- Missing observability (logging, monitoring)
- No external integrations (email, payments)

**Overall Assessment:** This is a **solid MVP/early-stage product** ready for pilot deployment with 1-5 hospitals. Scaling to 50+ tenants will require performance tuning, enhanced security, and operational tooling.

---

**End of Document**
