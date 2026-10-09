# SR FABRICATION — Railway Station Vehicle Parking Management System
> Production-grade, full-stack vehicle parking management system designed for commercial railway station parking operations.

---

## 🚉 System Overview

The **SR FABRICATION Railway Station Vehicle Parking Management System** is a mission-critical web application built for parking operators and business administrators managing railway station parking lots. It facilitates rapid vehicle entry token generation, exit billing calculations based on authoritative railway 24-hour tariff rules, monthly commuter pass issuance & renewals, payment tracking, live occupancy analytics, and accounting reports.

### Key Capabilities
- 🎫 **Fast Vehicle Entry**: Issue collision-safe entry slips with QR codes in seconds across 10 vehicle and cloakroom categories.
- ⚡ **24-Hour Tariff Engine**: Authoritative mathematical engine calculating 24-hour daily parking fees (`billableDays = max(1, ceil(elapsedMs / 86400000))`).
- 💳 **Exit & Payment Checkout**: Instant session lookup via QR scanner or registration number, live tariff previews, and settlement across Cash, UPI, and Card.
- 🛡️ **Duplicate Prevention**: Hardware and logic safeguards preventing duplicate active entries and duplicate exit settlements.
- 📅 **Monthly Commuter Passes**: 1, 6, and 12-month pass issuance and seamless renewals preserving historical validity records.
- 📊 **Dynamic Live Dashboard & Reports**: Dynamic revenue calculation (Gross, Refunds, Net), vehicle occupancy breakdowns, and CSV data export.
- 🔒 **Enterprise Security**: Role-based access control (Admin & Operator), 4-digit convenience MPIN or password authentication, brute-force lockouts, and immutable audit logging.
- 🖨️ **Thermal POS Print Support**: Optimized receipt printing for 80mm and 58mm POS thermal printers and standard paper.

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v20+ / v24+
- **Framework**: Express.js
- **Database**: MongoDB (Atlas & Local) with Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens) & bcrypt for password/MPIN hashing
- **Security**: Helmet, CORS whitelist, express-rate-limit, input sanitization
- **Logging**: Morgan + Winston structured logging
- **Validation**: Zod schema validation
- **Testing**: Vitest & Supertest

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS with custom SR Fabrication design tokens (`#142B4A` navy, `#2457A7` secondary blue, `#C9343A` accent red)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **API Client**: Centralized Axios client with token interceptors
- **Visual Charts**: Recharts
- **QR Codes**: `qrcode.react` (SVG generator) & `html5-qrcode` (camera scanner)
- **Testing**: Vitest + React Testing Library

---

## 📁 Repository Structure

```
srf-parking/
├── backend/
│   ├── src/
│   │   ├── config/             # DB, Environment & Winston Logger
│   │   ├── controllers/        # Auth, Parking, Passes, Tariffs, Reports, etc.
│   │   ├── middleware/         # Auth, RateLimiter, ErrorHandler
│   │   ├── models/             # Mongoose Schemas (User, Token, Pass, Payment, etc.)
│   │   ├── routes/             # Express API Endpoints
│   │   ├── services/           # Authoritative Tariff Engine & Audit Service
│   │   ├── utils/              # Token Generator & Seed Utility
│   │   ├── validators/         # Zod Request Validation Schemas
│   │   ├── app.js              # Express App Setup
│   │   └── server.js           # Server Entry & Graceful Shutdown
│   ├── tests/                  # Tariff Engine & Full API Integration Tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout, Navbar, Sidebar, Receipts, QR Scanner, Badges
│   │   ├── context/            # AuthContext (User Session & Role State)
│   │   ├── pages/              # Login, Dashboard, Entry, Exit, Passes, Reports, etc.
│   │   ├── services/           # Centralized Axios Client
│   │   ├── utils/              # Indian Currency (₹), IST Date & Duration Formatters
│   │   ├── test/               # Frontend Unit & Component Tests
│   │   ├── App.jsx             # Router & Protected Route Guards
│   │   ├── main.jsx            # Entry Point
│   │   └── index.css           # Tailwind Design System & Thermal Print Rules
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── REQUIREMENTS.md         # Detailed Software Requirements Specification
│   ├── DATABASE.md             # Schemas, Relationships, Indexes & Lifecycle
│   ├── API.md                  # REST Endpoints Specification & Examples
│   ├── DEPLOYMENT.md           # Production Deployment Guide (Vercel, VPS, Atlas)
│   ├── BACKUP_AND_RESTORE.md   # Backup Procedures & Disaster Recovery
│   ├── USER_MANUAL.md          # Complete Operator & Administrator Guide
│   ├── TESTING.md              # Quality Assurance & Test Verification Report
│   └── CLIENT_HANDOVER.md      # Ownership Transfer & Operational Costs
├── .gitignore
├── package.json                # Root Orchestration Scripts
└── README.md
```

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js (v20 or higher) and npm (v10 or higher).
- MongoDB instance running locally (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas connection string.

### 2. Installation
Clone the repository and install dependencies across root, backend, and frontend:
```bash
git clone <REPO_URL>
cd srf-parking
npm run install:all
```

### 3. Environment Setup
Create environment files from the provided templates:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 4. Database Seeding (Sample Accounts & Tariffs)
Populate the database with sample administrators, operators, default category tariffs, and demonstration parking sessions:
```bash
npm run seed
```

#### Pre-Configured Development Accounts:
- **Administrator**:
  - Username: `admin` | Operator ID: `ADM-001`
  - Password: `Admin@1234` | MPIN: `1234`
- **Booth Operator**:
  - Username: `operator1` | Operator ID: `OP-001`
  - Password: `Operator@123` | MPIN: `4321`

### 5. Running the Application
Run both backend and frontend development servers:

In Terminal 1 (Backend API):
```bash
npm run dev:backend
# API starts on http://localhost:5000/api
# Health check: http://localhost:5000/api/health
```

In Terminal 2 (Frontend Client):
```bash
npm run dev:frontend
# Client starts on http://localhost:5173
```

---

## 🧪 Automated Testing

Run the full automated test suite (31 tests covering Tariff Engine Cases A–E, auth lockouts, RBAC, duplicate entry/exit prevention, and frontend components):

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

---

## 📜 Documentation Index

Comprehensive engineering and operational documentation is located in the [`docs/`](./docs/) directory:
1. [**REQUIREMENTS.md**](./docs/REQUIREMENTS.md) — Functional and non-functional requirements.
2. [**DATABASE.md**](./docs/DATABASE.md) — Schemas, indexes, data lifecycle, and field definitions.
3. [**API.md**](./docs/API.md) — Full REST API contract and example payloads.
4. [**DEPLOYMENT.md**](./docs/DEPLOYMENT.md) — Production setup on Vercel, Node VPS, and MongoDB Atlas.
5. [**BACKUP_AND_RESTORE.md**](./docs/BACKUP_AND_RESTORE.md) — Offsite backup scripts and disaster recovery.
6. [**USER_MANUAL.md**](./docs/USER_MANUAL.md) — Operator instructions for Entry, Exit, Passes, and Printing.
7. [**TESTING.md**](./docs/TESTING.md) — Quality assurance test matrix and billing test cases.
8. [**CLIENT_HANDOVER.md**](./docs/CLIENT_HANDOVER.md) — Asset handover, credential rotation, and hosting cost breakdown.

---

## ⚖️ License & Client Ownership
Proprietary software developed for **SR FABRICATION**. All rights reserved.