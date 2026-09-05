# 🐼 Panda Sports Academy — Accounts & Facility Management

A dedicated modern facility operations and accounts ledger web app built for **Panda Sports Academy** (Pickleball & Sports Arenas).

---

## 🌟 Key Features

### 1. 📅 Court & Console Reservations
- **4 Dedicated Courts**: Court 1 (Premium), Court 2 (Standard), Court 3 (Standard), Court 4 (Training).
- **2 PS5 Gaming Stations**: Station 1 and Station 2.
- **Dynamic Slot Selection**: 30-minute interval selection from `06:00` to `24:00` with auto-gap filling and conflict prevention.
- **Split-Payment Group Matches**: Allows splitting payment across multiple players with individual payment modes (Cash / UPI).
- **Auto-Finish & 15-Minute Countdown Warnings**: Detects ongoing games and fires both visual alerts and audible synthesizer bell tones when 15 minutes remain.

### 2. 🥤 Beverages & Inventory POS
- **Quick-Sell Mode**: Single-tap selling with instant toggle between Cash & UPI.
- **Product Management**: Add items with custom names, prices, and emoji icons.
- **Real-Time Revenue Logging**: Instant debit to inventory and credit to the accounts ledger.

### 3. 💼 Accounts Ledger & Cash Drawer
- **Multi-Balance Register**: Track Cash-in-Hand, UPI Register, and Turftown receivables independently.
- **Beverage Sales Breakdown**: Itemized sales figures.
- **Expense Logging**: Record operational expenses (maintenance, electricity, lighting, balls) with audit notes.
- **Register Settlement**: Settle balances to safe/bank at end-of-shift.
- **Export & Print**: One-click CSV export and clean Print-to-PDF styles.

### 4. 💾 Local Storage Persistence & JSON Backup
- All transactions, bookings, and beverage modifications are **automatically synchronized with LocalStorage**. Data is never lost on refresh!
- Full JSON backup and restore button in the sidebar.
- Audio Mute/Unmute toggle for staff convenience.

---

## 🚀 Getting Started

### Method 1: One-Click Windows Launcher
Double-click `start.bat` in this folder.

### Method 2: Command Line (Vite Dev Server)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Method 3: Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Project Architecture

```
panda-sports-management/
├── index.html                   # HTML entry point with fonts & metadata
├── package.json                 # Dependencies & scripts
├── vite.config.js               # Vite config
├── tailwind.config.js           # Panda Sports color palette & fonts
├── start.bat                    # One-click Windows runner
├── src/
│   ├── main.jsx                 # React root DOM mount
│   ├── App.jsx                  # Main state coordinator & tab switcher
│   ├── index.css                # Tailwind directives & print styling
│   ├── constants/
│   │   └── resources.js         # Courts, PS5 stations, and default beverages
│   ├── utils/
│   │   ├── storage.js           # LocalStorage auto-sync & JSON export
│   │   ├── audio.js             # Web Audio API alert sound synthesizer
│   │   └── slots.js             # Slot math, gap filling, and conflict checking
│   └── components/
│       ├── Sidebar.jsx          # Desktop navigation & audio controls
│       ├── MobileHeader.jsx     # Responsive mobile view
│       ├── Toast.jsx            # Action notifications
│       ├── AlertsBanner.jsx     # Ending countdown banner
│       ├── Dashboard/           # Dashboard tab, charts & live cards
│       ├── Bookings/            # Bookings tab & multi-mode modal
│       ├── Beverages/           # POS grid & item creation modal
│       └── Accounts/            # Accounts ledger, expense & settle modals
```
