# ExpenseTracker (Fenmo Assessment)

A production-ready, full-stack personal finance application built under a strict time constraint. This architecture prioritizes data correctness, idempotency under spotty network conditions, and a resilient, highly responsive user experience.

Live Application: https://expense-tracker-chi-sable-18.vercel.app
Live API Endpoint: https://expensetrackerapi-jsle.onrender.com

## 🚀 Tech Stack

- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript
- Data Fetching and State: TanStack Query (React Query)
- Data Visualization: Recharts
- Backend: Node.js, Express, TypeScript
- Database: SQLite (via better-sqlite3 with WAL mode)
- Validation: Zod (Client and Server side)
- Testing: Node.js Native Test Runner (node:test)

## 🧠 Key Design Decisions and Engineering Focus

### 1. Robust Money Handling (Zero Floating-Point Errors)

Financial applications cannot tolerate IEEE 754 floating-point precision loss (for example, `0.1 + 0.2 = 0.30000000000000004`).

- Database level: Amounts are strictly validated and stored as `INTEGER` representing the smallest currency unit (paise/cents).
- Application level: The Next.js frontend safely scales user decimal inputs up by 100 before network transmission, and scales down by 100 for UI rendering.

### 2. Idempotency and Retry Safety

In real-world conditions (trains, bad mobile data, impatient double-clicking), clients will retry failed network requests. This system guarantees a user will never be double-charged for the same transaction.

- Client generation: The frontend generates a unique UUID v4 as an `idempotency_key` when the form mounts or successfully resets.
- Database enforcement: The `expenses` table enforces a strict `UNIQUE` constraint on the `idempotency_key`.
- Graceful recovery: The Express backend catches `SQLITE_CONSTRAINT_UNIQUE` errors. If a duplicate key is detected, it intercepts the crash and safely returns a `200 OK` with the existing record.

### 3. Server-State Management (TanStack Query)

Instead of relying on fragile `useEffect` hooks, TanStack Query manages the frontend data layer. This provides automatic cache invalidation (instantly updating the list and chart after a POST), out-of-the-box loading/error states, and aggressive UI updates without manual refetching.

### 4. Database Persistence Choice: SQLite

For this assessment, SQLite was chosen over a distributed relational DB (like PostgreSQL).

- Why: It allows zero-configuration, instant local setup for reviewers while still enforcing strict ACID compliance and constraints.
- Production tuning: Write-Ahead Logging (`journal_mode=WAL`) was enabled to improve concurrent read/write performance.

## ⚖️ Trade-offs and Intentional Omissions (Timebox Constraints)

Given the limited timebox, the following deliberate trade-offs were made to prioritize core data correctness:

- UI pagination: While the `GET /expenses` backend endpoint supports `limit` and `offset` query parameters to prevent event-loop blocking, the UI does not yet implement pagination controls to keep frontend scope manageable.
- Authentication and multi-tenancy: The system currently assumes a single-user environment. In a real-world scenario, `user_id` relations and JWT/session management would be standard.
- Security hardening: Packages like `helmet` (HTTP headers) and `express-rate-limit` (abuse protection) were omitted to focus on assignment business logic.
- Monorepo separation: Both frontend and backend are housed in one repo for ease of review. A true microservice architecture would decouple deployment pipelines further.

## ✨ Nice-to-Have Features Implemented

- Advanced UI polish: Built a premium, dark-themed dashboard prioritizing UX hierarchy (descriptions prioritized over categories).
- Summary view: Implemented an efficient single-pass `reduce` function to aggregate categorical spending, visualized via a responsive Recharts donut graph.
- Automated testing: Wrote zero-dependency unit tests using `node:test` to prove the Zod schema rejects negative money, floating-point numbers, and malformed dates.
- Local timezone awareness: Fixed standard UTC date generation bugs by offsetting the browser local timezone, ensuring late-night expenses log on the correct day.

## 🛠️ Local Development Setup

### 1) Clone and Install

```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2) Start the Backend

```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:3001
# Tests can be run via `npm test`
```

### 3) Start the Frontend

In a new terminal window:

```bash
cd frontend
npm install
# Ensure .env.local contains NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
# Client runs on http://localhost:3000
```

## 📡 API Contract

### POST /expenses

Creates an expense idempotently.

- Body: `amount` (int), `category` (str), `date` (YYYY-MM-DD), `description` (str, optional), `idempotency_key` (UUID).
- Returns: `201 Created` on success, `200 OK` on duplicate key retry, `400 Bad Request` on invalid schema.

### GET /expenses

Retrieves a list of expenses.

- Query params: `category` (optional filter), `sort` (optional, accepts `date_desc`), `limit` (default 50), `offset` (default 0).
- Returns: `200 OK` with JSON array of expenses.
