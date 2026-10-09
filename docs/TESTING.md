# SR FABRICATION — Automated Testing & Quality Assurance Report
## Railway Station Vehicle Parking Management System

---

## 1. Test Architecture & Overview
The system includes comprehensive automated unit and integration tests across both the backend and frontend modules using **Vitest**, **Supertest**, and **React Testing Library**.

### Test Execution Commands
```bash
# Run all tests (Backend + Frontend)
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

---

## 2. Tariff Engine & Billing Edge-Case Tests (`backend/tests/tariffEngine.test.js`)

All 5 critical billing scenarios requested in the project specification are covered and verified with 100% pass rates:

| Test Case | Scenario / Duration | Expected Units | Expected Amount | Status |
|---|---|---|---|---|
| **Case A** | 23 hours 59 minutes | 1 Billable Day | ₹20 (Bike) | **PASSED** |
| **Case B** | Exactly 24 hours 00 minutes | 1 Billable Day | ₹20 (Bike) | **PASSED** |
| **Case C** | 24 hours 01 minute | 2 Billable Days | ₹40 (Bike) | **PASSED** |
| **Case D** | Exactly 48 hours 00 minutes | 2 Billable Days | ₹40 (Bike) | **PASSED** |
| **Case E** | 48 hours 01 minute | 3 Billable Days | ₹60 (Bike) | **PASSED** |

### Additional Billing Engine Tests:
- **Tiered Rates**: Car with first day ₹50 and additional day ₹30 (25 hrs $\to$ ₹80) — **PASSED**.
- **Negative Durations**: Rejects exit time earlier than entry time with error — **PASSED**.
- **Missing / Inactive Tariff**: Gracefully throws explicit error — **PASSED**.
- **Hourly Cloakrooms**: 2 hours 15 minutes $\to$ 3 billable hours — **PASSED**.
- **Fixed Cloakroom**: Helmet fixed ₹15 regardless of duration — **PASSED**.

---

## 3. Full API Integration Tests (`backend/tests/api.integration.test.js`)

| Test Suite | Coverage Area | Verification Details | Status |
|---|---|---|---|
| **Health Check** | `GET /api/health` | Returns 200, system uptime, and Asia/Kolkata timezone | **PASSED** |
| **Admin Password Login** | `POST /api/auth/login` | Issues valid JWT access and refresh tokens | **PASSED** |
| **Operator MPIN Login** | `POST /api/auth/login` | Authenticates using 4-digit MPIN `4321` | **PASSED** |
| **Brute-Force Lockout** | `POST /api/auth/login` | Locks account with HTTP 423 after 5 consecutive wrong attempts | **PASSED** |
| **RBAC Authorization** | `POST /api/tariffs` | Rejects operator attempts to alter tariffs with HTTP 403 | **PASSED** |
| **Tariff Scenario Preview** | `POST /api/tariffs/preview` | Simulates 25-hour calculation accurately | **PASSED** |
| **Token Creation** | `POST /api/parking/entries` | Creates unique token number with tariff snapshot | **PASSED** |
| **Duplicate Entry Prevention**| `POST /api/parking/entries` | Rejects second entry for vehicle currently INSIDE (HTTP 409) | **PASSED** |
| **Active Session Lookup** | `GET /api/parking/lookup` | Live charge calculation and duration preview | **PASSED** |
| **Exit Processing** | `POST /api/parking/tokens/:id/exit` | Conditional transition to EXITED and records Payment | **PASSED** |
| **Duplicate Exit Prevention** | `POST /api/parking/tokens/:id/exit` | Rejects exit attempts on already exited tokens (HTTP 400) | **PASSED** |
| **Pass Issuance & Duplicate** | `POST /api/passes` | Creates monthly pass, prevents duplicate active pass (HTTP 409) | **PASSED** |
| **Live Reports Summary** | `GET /api/reports/summary` | Verifies dynamic calculations from database records | **PASSED** |

---

## 4. Frontend Component & Unit Tests (`frontend/src/test/`)

| Test Suite | Coverage Area | Status |
|---|---|---|
| **Currency Formatter** | Formats currency with INR symbol (₹) and Indian number grouping | **PASSED** |
| **Duration Formatter** | Formats minutes into human-readable hours and days (`1 hr 30m`, `1d`) | **PASSED** |
| **Vehicle Normalizer** | Converts registrations to uppercase without spaces | **PASSED** |
| **BrandLogo Component** | Verifies SR Fabrication brand mark and title rendering | **PASSED** |
| **StatusBadge Component** | Verifies visual badges for `INSIDE`, `EXITED`, and `ACTIVE` | **PASSED** |

---

## 5. Summary Statistics
- **Total Test Files**: 4
- **Total Automated Tests**: 31
- **Passing**: 31 (100%)
- **Failing**: 0
