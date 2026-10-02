# 🎓 UNIUYO QR Code Attendance Management System

[![Live Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)](https://uniuyo-qr-attendance.vercel.app)
[![Live Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://uniuyo-qr-attendance-fttn.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat&logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)

A full-stack, real-time academic attendance tracking system designed for the **University of Uyo (UNIUYO)**. It replaces paper sign-in sheets with cryptographically signed, expiring QR codes scanned directly through student mobile browsers—with zero app store downloads required.

---

## 📌 Table of Contents

- [Live Deployments](#-live-deployments)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Security & Anti-Proxy Mechanisms](#-security--anti-proxy-mechanisms)
- [Tech Stack](#-tech-stack)
- [Quick Demo Accounts](#-quick-demo-accounts)
- [Project Structure](#-project-structure)
- [Getting Started Locally](#-getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Deployment Guide](#-deployment-guide)
  - [Backend (Render)](#backend-render)
  - [Frontend (Vercel)](#frontend-vercel)
- [License](#-license)

---

## 🌐 Live Deployments

| Component | URL | Provider |
| :--- | :--- | :--- |
| **Frontend Web App** | [uniuyo-qr-attendance.vercel.app](https://uniuyo-qr-attendance.vercel.app) | Vercel (Edge CDN) |
| **Backend REST API** | [uniuyo-qr-attendance-fttn.onrender.com](https://uniuyo-qr-attendance-fttn.onrender.com) | Render (Web Service) |
| **Database** | Managed PostgreSQL Instance | Render Postgres |

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client ["Client (React + Vite PWA)"]
        LecturerUI["Lecturer Portal Hub<br/>(Generates Dynamic QR)"]
        StudentUI["Student Attendance Scanner<br/>(Camera Viewfinder)"]
        AdminUI["Admin Analytics Dashboard<br/>(Reports & Alerts)"]
    end

    subgraph Edge ["Vercel Edge Network"]
        VercelRewrite["vercel.json<br/>API Proxy Rewrite & SPA Fallback"]
    end

    subgraph Server ["Server (Node.js + Express + TypeScript)"]
        AuthModule["JWT Auth Middleware & RBAC"]
        SessionService["QR Session Generator<br/>(HMAC-SHA256 Token)"]
        AttendanceEngine["Scan Validator &<br/>Anti-Duplicate Ledger"]
        ReportEngine["75% Attendance Warning Engine"]
    end

    subgraph Storage ["Database (PostgreSQL)"]
        Drizzle["Drizzle ORM Schema"]
        Tables[("users, students, courses,<br/>enrollments, sessions, attendance")]
    end

    LecturerUI -->|POST /api/sessions| VercelRewrite
    StudentUI -->|POST /api/attendance/scan| VercelRewrite
    AdminUI -->|GET /api/reports/*| VercelRewrite

    VercelRewrite -->|Forwarded API Requests| Server
    Server --> Drizzle --> Tables
```

---

## ✨ Key Features

### 👨‍🏫 Lecturer Portal
- **One-Click Dynamic QR Generation**: Select an assigned course to broadcast an expiring QR attendance token on the lecture room projector/screen.
- **Dynamic Countdown Timer**: Live countdown indicating token validity remaining before automatic expiration.
- **Instant Attendance Log**: Real-time feedback of attending students logging into the active lecture session.

### 🎓 Student Portal
- **In-Browser Camera Scanner**: High-performance camera QR scanner running natively via WebRTC (`html5-qrcode`) with zero mobile app installation needed.
- **Native Experience & Feedback**: Integrated Web Audio API success chime and device vibration haptics on verified attendance.
- **Duplicate Prevention**: Immediate visual and toast notifications if a student tries scanning the same lecture code twice.

### 📊 Reports & Administration
- **Course Attendance Analytics**: Aggregated metrics of total classes held, student enrollment count, and average percentage attendance.
- **Automatic Low-Attendance Alerts (< 75%)**: Proactive threshold detection flagging students at risk of exam disqualification per UNIUYO academic regulations.
- **Printable Audit Sheets**: CSS print-optimized reports formatted for PDF export and administrative filing.

---

## 🛡️ Security & Anti-Proxy Mechanisms

1. **Cryptographically Signed Session Tokens**: Every generated QR code payload contains a signed JWT with course metadata and a short time-to-live (`QR_TTL_SECONDS=300`).
2. **Replay & Proxy Attack Prevention**: 
   - Sessions expire after 5 minutes, preventing photographed QR codes from being used hours or days later.
   - Database unique constraint on `(student_id, session_id)` guarantees a student cannot log multiple attendances for the same lecture session.
3. **Role-Based Access Control (RBAC)**: Enforced via Express middleware (`requireRole("lecturer", "admin")` vs `requireRole("student")`). Students cannot access lecture generator routes or system report endpoints.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **Framework**: React 18 with TypeScript
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS with custom UNIUYO emerald branding (`#00A859`, `#053E17`)
- **Routing**: React Router v6 (SPA routing with protected role gates)
- **Camera Scanner**: `html5-qrcode` (environment camera facing mode)
- **Icons**: Custom lightweight SVG vector system (Feather / Heroicon geometry)

### Backend (`server/`)
- **Runtime**: Node.js (ESM modules)
- **Framework**: Express.js with TypeScript
- **Database & ORM**: PostgreSQL via `postgres.js` & Drizzle ORM
- **Authentication**: Stateless JSON Web Tokens (JWT) & `bcryptjs`
- **Validation**: Strict schema typing via `zod` and TypeScript

---

## 🔑 Quick Demo Accounts

Pre-seeded demo credentials are automatically loaded into the database:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Password123!` | System Reports, Low Attendance Alerts, Full Overview |
| **Lecturer** | `lecturer@example.com` | `Password123!` | Create Sessions, Broadcast QR, View Course Reports |
| **Student** | `student@example.com` | `Password123!` | Camera Scanner, Submit Attendance |

> **Tip**: The login page contains **Quick Demo Fill Buttons** to autofill and test each role with a single click.

---

## 📂 Project Structure

```text
uniuyo-qr-attendance/
├── client/                     # Frontend Single Page App (React + Vite)
│   ├── public/                 # Static assets, icons, manifest.json
│   ├── src/
│   │   ├── components/         # Shared UI (UniuyoLogo, Icons)
│   │   ├── pages/              # LoginPage, StudentScanPage, LecturerSessionPage, ReportsPage
│   │   ├── api.ts              # Centralized API fetch wrapper with token management
│   │   ├── auth.tsx            # React AuthContext & session storage
│   │   ├── App.tsx             # Route definitions & RBAC gates
│   │   └── AppShell.tsx        # Responsive layout, top header & mobile bottom navigation
│   ├── vercel.json             # Vercel proxy rewrite (/api/*) & SPA fallback
│   ├── vite.config.ts          # Vite configuration with local proxy
│   └── package.json
│
├── server/                     # Backend API (Express + TypeScript)
│   ├── drizzle/                # Drizzle migration files (.sql)
│   ├── scripts/                # Database seed runner scripts
│   ├── src/
│   │   ├── config/             # Environment variable validation (Zod)
│   │   ├── controllers/        # Route controllers (auth, session, attendance, reports)
│   │   ├── db/                 # Drizzle instance, schema definitions, seeders
│   │   ├── middleware/         # Auth & role-check middleware
│   │   ├── routes/             # Express router definitions
│   │   └── index.ts            # Application entrypoint & HTTP server
│   ├── drizzle.config.ts       # Drizzle kit configuration
│   └── package.json
└── README.md
```

---

## 💻 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- [Git](https://git-scm.com/)
- A local or hosted [PostgreSQL](https://www.postgresql.org/) database (e.g. Neon, Supabase, or local Postgres)

---

### 1. Backend Setup

1. Open your terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` variables:
   ```env
   PORT=4000
   DATABASE_URL=postgresql://user:password@localhost:5432/qr_attendance_db
   JWT_SECRET=your-secure-jwt-secret
   QR_SECRET=your-secure-qr-signing-secret
   QR_TTL_SECONDS=300
   ```

5. Run database migrations:
   ```bash
   npm run db:migrate
   ```

6. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The server will start at `http://localhost:4000` and automatically seed initial demo data.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```
   *Vite will automatically proxy all `/api` requests to your local backend on port `4000`.*

---

## 🔌 API Reference

### Authentication
- `POST /api/auth/register` — Register a new student account (`name`, `email`, `studentId`, `programme`, `password`)
- `POST /api/auth/login` — Sign in and obtain JWT bearer token (`email`, `password`)
- `GET /api/auth/me` — Retrieve currently authenticated user profile *(Requires Bearer Token)*

### Sessions & QR Attendance
- `POST /api/sessions` — Start an attendance session for a course *(Lecturer/Admin only)*
  ```json
  { "courseCode": "CS101" }
  ```
- `POST /api/attendance/scan` — Submit scanned QR code token to log presence *(Student only)*
  ```json
  { "token": "<signed_qr_jwt>" }
  ```

### Reports & Analytics
- `GET /api/reports/summary` — Fetch course-level attendance overview *(Lecturer/Admin only)*
- `GET /api/reports/alerts` — Fetch low attendance warning list (< 75% rate) *(Lecturer/Admin only)*

---

## 🗄️ Database Schema

```mermaid
erDiagram
    users ||--o| students : "has profile"
    users ||--o{ courses : "lectures"
    students ||--o{ enrollments : "enrolled in"
    courses ||--o{ enrollments : "has students"
    courses ||--o{ sessions : "holds"
    sessions ||--o{ attendance : "records"
    students ||--o{ attendance : "attends"

    users {
        uuid id PK
        string email UK
        string password_hash
        string name
        enum role "admin, lecturer, student"
        timestamp created_at
    }

    students {
        uuid id PK
        uuid user_id FK
        string student_id UK
        string programme
    }

    courses {
        uuid id PK
        string course_code UK
        string title
        uuid lecturer_id FK
    }

    sessions {
        uuid id PK
        uuid course_id FK
        string signed_token
        timestamp expires_at
        timestamp created_at
    }

    attendance {
        uuid id PK
        uuid student_id FK
        uuid session_id FK
        timestamp timestamp
        enum status "present, late"
    }
```

---

## 🚀 Deployment Guide

### Backend (Render)
1. In the [Render Dashboard](https://dashboard.render.com), create a new **Web Service** connected to your repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: Random 32+ character secret string.
   - `QR_SECRET`: Random 32+ character secret string.
   - `PORT`: `4000` (or leave default assigned by Render).

### Frontend (Vercel)
1. In the [Vercel Dashboard](https://vercel.com), import your repository.
2. Set **Root Directory** to `client`.
3. The build settings are auto-detected by Vite (`npm run build`, output: `dist`).
4. [client/vercel.json](file:///home/uksdev/Workspace/QR_Attendance_System/client/vercel.json) automatically proxies `/api/*` to the Render backend and handles SPA route refreshes.

---

## 📜 License

Developed for the **University of Uyo Directorate of ICT**.  
Academic project under MIT License.
