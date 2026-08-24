# Google Pay Style UPI Mobile Web App (Vanilla HTML/CSS/JS)

A minimal, clean, touch-first UPI payments web application inspired by Google Pay's design language. Built using **pure vanilla HTML5, CSS3, and modern ES6+ JavaScript** with **zero build tools, zero frameworks, and zero npm dependencies**.

---

## 📱 Features

- **Mobile Viewport & Natural Page Scrolling**: Fluid, content-driven layout (`height: auto`, `min-height: 100vh`) with persistent bottom navigation.
- **Home Dashboard (`index.html`)**:
  - Available Bank Account Balance card with Hide/Show toggle.
  - Quick action shortcuts: Pay Phone, Scan QR, Pay UPI ID, Passbook.
  - People & Businesses contact avatars with smooth horizontal scrolling.
  - Recent transactions ledger.
- **Send Money (`send.html`)**:
  - Recipient UPI ID/Phone input with instant validation.
  - Touch amount display with quick denomination chips (+₹100, +₹500, +₹1,000, +₹2,000).
  - Prominent "Proceed to Pay" button.
- **Official NPCI PIN Verification (`pin.html`)**:
  - Bank header & payee summary.
  - 4 masked dot indicators (`••••`) with shake animation on error.
  - Full 4-row touch keypad (1–9, 0, Backspace, Confirm).
- **Payment Celebration & Receipt (`result.html`)**:
  - Animated green checkmark, large amount, transaction breakdown, and 1-tap UTR copy.
- **QR Code Scanner (`scan.html`)**:
  - Camera viewfinder with animated laser scan beam, flashlight toggle, and test merchant presets.
- **Passbook / History (`history.html`)**:
  - Real-time search by payee or UTR, category filter chips (All, Paid, Received, Failed), and statistics.
- **User Profile & QR (`profile.html`)**:
  - Personal vector SVG QR code, linked bank accounts, and demo data reset.

---

## 🚀 Getting Started

### Direct Browser Access:
Simply double-click or open `index.html` in any modern web browser.

### Local HTTP Server:
```bash
# Using Python 3
python -m http.server 3000

# Using Node.js (npx)
npx serve .
```
Navigate to `http://localhost:3000`.

---

## 🔌 Backend Integration

All API calls funnel through `js/api.js`. The app is fully decoupled from backend frameworks:
- **Current State**: Uses standalone Promises with mock latency and `localStorage` persistence.
- **Connecting a Backend**: Replace mock `Promise` functions inside `js/api.js` with real `fetch()` calls to your API endpoint (`API_BASE_URL = 'http://localhost:5000/api'`). No changes needed in UI or page scripts.

---

## 📁 Project Structure

```
├── index.html           # Home Dashboard
├── send.html            # Send Money Form
├── scan.html            # QR Scanner & Merchant Pay
├── pin.html             # NPCI PIN Screen
├── result.html          # Transaction Receipt & Confirmation
├── history.html         # Passbook & Ledger
├── profile.html         # Profile & Personal QR
├── css/
│   └── style.css        # Clean Design System
└── js/
    ├── api.js           # API boundary & mock data store
    ├── main.js          # Shared state & UI helpers
    ├── home.js          # Home page logic
    ├── send.js          # Send money logic
    ├── scan.js          # QR scanner logic
    ├── pin.js           # NPCI keypad logic
    ├── result.js        # Transaction receipt logic
    ├── history.js       # Passbook logic
    └── profile.js       # Profile logic
```
