# SR FABRICATION — Client Handover & Ownership Transfer
## Railway Station Vehicle Parking Management System

---

## 1. Ownership & Asset Handover Overview
This project is developed as custom proprietary software for **SR FABRICATION** to manage commercial vehicle parking operations at railway stations. All intellectual property, source code, documentation, and database schemas belong entirely to SR Fabrication upon final delivery.

### Client-Owned Production Accounts Checklist:
- [ ] **GitHub Repository**: Primary repository transfer to client organization.
- [ ] **Domain Registrar**: Domain registered under SR Fabrication account (e.g. GoDaddy, Namecheap, Google Domains).
- [ ] **Frontend Hosting**: Vercel / Cloudflare Pages organization account.
- [ ] **Backend Cloud Hosting**: Virtual server / container account (Render, Railway, or AWS).
- [ ] **MongoDB Atlas Account**: Dedicated database project under client email.
- [ ] **Commercial UPI / Bank POS**: Bank merchant QR codes and POS machines.

---

## 2. Default Seed Accounts & Credential Rotation

> ⚠️ **CRITICAL SECURITY REQUIREMENT**: The default development credentials listed below must be replaced immediately upon deployment to production!

### Pre-Seeded Development Accounts:
1. **System Administrator**:
   - Username: `admin`
   - Operator ID: `ADM-001`
   - Temporary Password: `Admin@1234`
   - Convenience MPIN: `1234`
2. **Booth Operator 1**:
   - Username: `operator1`
   - Operator ID: `OP-001`
   - Temporary Password: `Operator@123`
   - Convenience MPIN: `4321`

### Rotation Steps:
1. Log in to the administrator portal.
2. Navigate to **Booth Operators**.
3. Edit the `admin` account and change the password to a strong passphrase (minimum 12 characters).
4. Update or recreate booth operator accounts with unique operator IDs and individual MPINs.

---

## 3. Recurring Operational Infrastructure Costs

| Service Component | Recommended Provider | Estimated Monthly Cost | Responsibility |
|---|---|---|---|
| **Domain Registration** | Namecheap / GoDaddy | ~₹800 - ₹1,200 / year | Client |
| **Frontend Hosting** | Vercel (Hobby/Pro) | ₹0 (Free Tier) to ₹1,600 / month | Client |
| **Backend API Server** | VPS (2 vCPU, 4GB RAM) | ~₹800 - ₹1,800 / month | Client |
| **MongoDB Database** | Atlas (M10 Cluster) | ~₹2,500 - ₹4,500 / month | Client |
| **Thermal Printer Rolls** | Local Station Supply | Variable per volume | Client |

---

## 4. Maintenance & Support Boundaries

### Included under Standard Deployment:
- Application source code and deployment configuration.
- Database index initialization and seed utilities.
- Complete documentation suite and operator manuals.
- Fixes for any functional discrepancies against the requirements specification during acceptance testing.

### Excluded / Requires Separate Service Engagement:
- Physical POS hardware, barcode scanners, and printer hardware malfunctions.
- Internet connectivity drops or local power outages at station booths.
- Custom third-party bank merchant gateway integrations or automated SMS gateways beyond standard static manual confirmations.
- Third-party cloud hosting billing and renewal fees.

---

## 5. Client Sign-Off & Acceptance

- **Client Representative**: SR FABRICATION Management
- **Project**: Railway Station Vehicle Parking Management System
- **Date of Delivery**: October 2026
- **Status**: Ready for Production Acceptance Testing
