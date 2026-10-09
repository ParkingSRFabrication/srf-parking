# SR FABRICATION — Operator & Administrator User Manual
## Railway Station Vehicle Parking Management System

---

## 1. System Login

### 1.1 Standard Login
1. Open your browser and navigate to the application URL (`http://localhost:5173/login` or your station domain).
2. Enter your **Username** (or Operator ID e.g. `OP-001`).
3. Enter your **Password** and click **Authenticate & Enter**.

### 1.2 Quick 4-Digit MPIN Login
1. On the login screen, click the **Quick MPIN (4-Digit)** tab.
2. Enter your **Operator ID** (e.g. `OP-001`).
3. Enter your assigned 4-digit numeric MPIN (e.g. `4321`).
4. Click **Authenticate & Enter**.

> **Note**: Accounts lock automatically for 15 minutes after 5 consecutive wrong attempts. Contact your supervisor or system administrator if locked.

---

## 2. Fast Vehicle Entry Workflow

1. From the navigation menu or dashboard, click **Vehicle Entry**.
2. **Select Category**: Click on the appropriate vehicle tile:
   - Two Wheeler (Bike / Scooter)
   - Four Wheeler (Car / SUV)
   - Auto Rickshaw
   - Bicycle, Bus, Truck, etc.
   - Cloakroom (Helmet Deposit / Locker)
3. **Vehicle Registration Number**: Type the license plate number (e.g. `MH12AB1234`).
   - The application automatically removes spaces and capitalizes letters.
4. **Customer Mobile Number**: Optional; enter if the commuter requests SMS/receipt reference.
5. Click **Generate Entry Token & Print Slip**.
6. The receipt modal pops up with:
   - Token number (e.g. `SRF-20261009-0001`)
   - Vehicle number & category
   - Exact server entry time
   - Fast-scan QR code
7. Click **Print Receipt** (formatted for 80mm/58mm thermal printers or standard paper).
8. Tear off receipt and hand it to the vehicle driver.

---

## 3. Vehicle Exit & Payment Collection Workflow

1. Click **Vehicle Exit** in the navigation menu.
2. **Lookup Vehicle**:
   - **Method A (QR Scan)**: Click **Scan QR** and hold the customer's printed token in front of your camera/scanner.
   - **Method B (Search)**: Type the Token Number (e.g. `SRF-20261009-0001`) or Vehicle Registration number and press Enter.
3. **Review Billing Details**:
   - The screen shows the entry time, total elapsed duration, and calculated billable days.
   - Standard 24-hour railway rule: 1 to 24 hours = 1 day; 24h 1m = 2 days.
   - If the vehicle holds an active Monthly Pass, the fee displays as **₹0 (PASS COVERED)**.
4. **Collect Payment**:
   - Select payment mode: **Cash**, **UPI**, or **Card**.
   - If UPI was paid via static QR, optionally enter the UTR/Reference number.
5. Click **Complete Vehicle Exit**.
6. Hand the final payment receipt to the customer.

---

## 4. Monthly Parking Pass Management

### 4.1 Issuing a New Pass
1. Click **Issue Monthly Pass** from the menu.
2. Select pass duration: **1 Month**, **6 Months**, or **12 Months**.
3. Enter vehicle number, customer name, mobile number, and start date.
4. Confirm payment amount and click **Issue Pass & Generate Slip**.

### 4.2 Renewing an Existing Pass
1. Navigate to **Monthly Passes** repository.
2. Search for the customer's name or vehicle registration.
3. Click the green **Renew Pass** icon next to the record.
4. Choose the extension period (1, 6, 12 months) and confirm payment.
5. The pass expiry date is automatically extended and the renewal history is preserved.

---

## 5. Thermal Receipt Printing Instructions
- The application automatically formats print jobs for **80mm and 58mm POS thermal receipt printers**.
- In the browser print dialog:
  - Select your thermal printer (e.g. Epson TM-T82, TVS RP-3160, or Xprinter).
  - Set paper size to `80mm x 297mm` or `Roll Paper`.
  - Disable headers and footers in print settings for a clean layout.

---

## 6. Troubleshooting Common Issues

| Issue | Cause | Solution |
|---|---|---|
| "Vehicle already has an active open session" | Vehicle was already entered and has not checked out yet. | Verify vehicle number; if vehicle exited previously without token scan, check with administrator. |
| "Account temporarily locked" | 5 failed password/MPIN attempts. | Wait 15 minutes or ask an administrator to reset credentials. |
| Camera QR scanner not opening | Browser camera permission blocked. | Click the camera icon in browser address bar and choose "Always Allow". |
| "No active tariff found" | Tariff has not been set for this category. | Administrator must configure rates in **Tariff Management**. |
