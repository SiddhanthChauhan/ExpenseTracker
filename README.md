# ExpenseTracker (Fenmo Assessment)

Full-stack expense tracking application with a TypeScript Express backend, SQLite persistence, and a Next.js frontend.

## What Is Implemented

- Backend API in TypeScript + Express
- SQLite storage via better-sqlite3
- Strict request validation with Zod
- Idempotent expense creation using `idempotency_key`
- Expense listing with filter and sort support
- Frontend in Next.js App Router + Tailwind CSS
- TanStack Query for server state management
- Expense form, expense list, and category summary pie chart (Recharts)
- Backend schema validation tests using Node test runner (`tsx --test`)

## Tech Stack

- Backend: Node.js, Express, TypeScript, better-sqlite3, Zod, CORS
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4, TanStack Query, Recharts, uuid
- Tooling: tsx, ESLint

## Monorepo Structure

```text
expense-tracker/
├── .gitignore
├── README.md
├── backend/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── expenses.db
│   ├── expenses.db-shm
│   ├── expenses.db-wal
│   └── src/
│       ├── index.ts
│       ├── schema.ts
│       ├── schema.test.ts
│       └── db/
│           └── index.ts
└── frontend/
		├── .env.local
		├── .gitignore
		├── AGENTS.md
		├── CLAUDE.md
		├── package.json
		├── package-lock.json
		├── tsconfig.json
		├── next.config.ts
		├── next-env.d.ts
		├── eslint.config.mjs
		├── postcss.config.mjs
		├── README.md
		├── public/
		│   ├── file.svg
		│   ├── globe.svg
		│   ├── next.svg
		│   ├── vercel.svg
		│   └── window.svg
		└── src/
				├── app/
				│   ├── favicon.ico
				│   ├── globals.css
				│   ├── layout.tsx
				│   ├── page.tsx
				│   └── providers.tsx
				├── components/
				│   ├── ExpenseForm.tsx
				│   ├── ExpenseList.tsx
				│   └── SummaryChart.tsx
				├── lib/
				│   ├── api.ts
				│   └── hooks.ts
				└── types.ts
```

## Architecture Summary

### Backend

- `POST /expenses`
	- Validates payload with `createExpenseSchema` from `src/schema.ts`
	- Persists expense with unique `idempotency_key`
	- Returns:
		- `201` for first successful creation
		- `200` with existing row if duplicate idempotency key is retried
- `GET /expenses`
	- Optional query params:
		- `category=<string>`
		- `sort=date_desc` (fallback is `created_at DESC`)

SQLite table:

- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `amount` (INTEGER, stored in paise)
- `category` (TEXT)
- `description` (TEXT, nullable)
- `date` (TEXT, `YYYY-MM-DD`)
- `idempotency_key` (TEXT UNIQUE)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### Frontend

- React Query provider configured in `src/app/providers.tsx`
- API client in `src/lib/api.ts`
- Hooks in `src/lib/hooks.ts`
	- `useExpenses(category?, sort?)`
	- `useCreateExpense()` with cache invalidation on success
- `ExpenseForm`:
	- Takes amount/category/date/description
	- Converts rupees decimal to paise integer
	- Generates UUID idempotency key per submission
- `ExpenseList`:
	- Category filtering + date sorting
	- Loading, error, and empty states
	- Total amount of visible expenses
- `SummaryChart`:
	- Category-wise spending distribution using Recharts pie chart

## Validation Rules

`createExpenseSchema` enforces:

- `amount`: positive integer
- `category`: non-empty string
- `description`: optional string
- `date`: regex `YYYY-MM-DD`
- `idempotency_key`: UUID format

## Testing

Backend tests currently cover schema validation scenarios:

- Valid payload accepted
- Negative amount rejected
- Floating-point amount rejected
- Bad date format rejected

Run backend tests:

```bash
cd backend
npm test
```

## Setup and Run

### Prerequisites

- Node.js 18+
- npm

### 1) Install dependencies

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### 2) Configure frontend env

Create/update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3) Start backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3001`.

### 4) Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`.

## API Quick Reference

### POST /expenses

Request body:

```json
{
	"amount": 15000,
	"category": "Food",
	"description": "Lunch at university",
	"date": "2026-04-26",
	"idempotency_key": "123e4567-e89b-12d3-a456-426614174000"
}
```

Example:

```bash
curl -X POST http://localhost:3001/expenses \
	-H "Content-Type: application/json" \
	-d '{
		"amount": 15000,
		"category": "Food",
		"description": "Lunch at university",
		"date": "2026-04-26",
		"idempotency_key": "123e4567-e89b-12d3-a456-426614174000"
	}'
```

### GET /expenses

Examples:

```bash
curl "http://localhost:3001/expenses"
curl "http://localhost:3001/expenses?category=Food"
curl "http://localhost:3001/expenses?sort=date_desc"
```

## Important Notes

- Currency is stored as integer paise in DB to avoid floating point precision errors.
- SQLite artifacts are ignored from version control via root and backend `.gitignore`.
- The backend currently has a UI library dependency (`recharts`) listed in `backend/package.json` that is not required server-side.

## Future Improvements

- Move DB path/config to environment variables.
- Add API integration tests for routes (`POST /expenses`, `GET /expenses`).
- Add rate limiting, Helmet, and structured logging for production hardening.
- Add pagination and date range filtering.
- Add CI pipeline with lint, type-check, and tests.
