# Pill-Pal Doctor Dashboard

A full-stack healthcare web application for doctors to manage patients, prescriptions, and monitor medication adherence.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 16 (App Router) + Tailwind CSS v4 |
| Backend   | Node.js + Express.js                |
| Database  | MongoDB (local) via Mongoose        |
| Auth      | JWT (stored in localStorage)        |
| QR Codes  | qrcode.react                        |
| HTTP      | Axios (with interceptors)           |

---

## Folder Structure

```
doctor/
├── backend/
│   ├── server.js
│   ├── .env
│   └── src/
│       ├── middleware/auth.js
│       ├── models/
│       │   ├── Doctor.js
│       │   ├── Patient.js
│       │   ├── Prescription.js
│       │   └── MedicationLog.js
│       └── routes/
│           ├── auth.js
│           ├── patients.js
│           ├── prescriptions.js
│           └── monitoring.js
└── frontend/
    ├── next.config.ts
    ├── .env.local
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx           ← Dashboard
        │   ├── globals.css
        │   ├── login/page.tsx
        │   ├── register/page.tsx
        │   ├── patients/page.tsx
        │   ├── prescriptions/page.tsx
        │   └── monitoring/page.tsx
        ├── components/
        │   ├── Sidebar.tsx
        │   └── DashboardLayout.tsx
        ├── context/AuthContext.tsx
        └── lib/axios.ts
```

---

## ⚠️ Prerequisites

1. **Node.js** v18+ — https://nodejs.org
2. **MongoDB** running locally on port 27017

### Starting MongoDB

**Windows (as a service):**
```powershell
net start MongoDB
```

**Windows (manual):**
```powershell
mongod --dbpath "C:\data\db"
```

**macOS/Linux:**
```bash
brew services start mongodb-community
# or
sudo systemctl start mongod
```

---

## Setup & Installation

### 1. Clone / navigate to the project

```bash
cd c:\Users\Ayush\OneDrive\Documents\doctor
```

### 2. Backend Setup

```bash
cd backend
npm install
```

The `.env` file is pre-configured:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pill-pal
JWT_SECRET=pill_pal_super_secret_jwt_key_2024
JWT_EXPIRE=7d
```

Start backend:
```bash
npm run dev     # uses nodemon (hot reload)
# or
npm start       # production
```

Backend runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## API Endpoints

| Method | Route                            | Description                |
|--------|----------------------------------|----------------------------|
| POST   | /api/auth/register               | Register doctor            |
| POST   | /api/auth/login                  | Login doctor               |
| GET    | /api/auth/me                     | Get current doctor         |
| GET    | /api/patients                    | List all patients          |
| POST   | /api/patients                    | Add new patient            |
| DELETE | /api/patients/:id                | Delete patient             |
| GET    | /api/prescriptions               | List prescriptions         |
| POST   | /api/prescriptions               | Create prescription        |
| PATCH  | /api/prescriptions/:id/deactivate| Deactivate prescription    |
| GET    | /api/monitoring                  | Get medication logs        |
| PATCH  | /api/monitoring/:id              | Update log status          |

---

## Features

- 🔐 **JWT Auth** — Doctor signup/login with token in localStorage
- 📊 **Dashboard** — Live stats: patients, active prescriptions, missed/taken doses
- 👥 **Patient Management** — Add, search, delete patients
- 💊 **Prescription System** — Create with medicine/dosage/timing/duration
- 📱 **QR Code** — Generate & download QR with full prescription JSON
- 📡 **Monitoring** — Real-time polling (8s) with Taken/Missed/Pending status
- 🎨 **Dark UI** — Glassmorphism, gradients, smooth animations

---

## Fixes Applied

1. ✅ CSS — Moved Google Fonts `@import` before `@import "tailwindcss"` to fix optimizer warning
2. ✅ `next.config.ts` — Added `turbopack.root` to fix workspace root warning
3. ✅ All pages use `'use client'` directive where needed
4. ✅ All routing uses `next/navigation` (not `next/router`)
5. ✅ Axios instance auto-injects JWT Bearer token on every request
6. ✅ Global 401 handler redirects to `/login` and clears localStorage
7. ✅ `@/*` path alias configured in `tsconfig.json` pointing to `./src/*`
8. ✅ CORS configured in backend to accept `http://localhost:3000`
9. ✅ `qrcode.react` v4 uses named export `QRCodeCanvas` (not default)
