# SmartShop – Full Stack E-Commerce Platform

A full-stack e-commerce application built with React (Vite) on the frontend and Node.js + Express + Prisma on the backend. SmartShop covers the complete shopping lifecycle — from browsing and cart management to checkout and admin order fulfilment — with a production-aligned CI/CD pipeline and automated test suite.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [How to Run Locally](#4-how-to-run-locally)
5. [CI/CD Overview](#5-cicd-overview)
6. [API Overview](#6-api-overview)
7. [Security Decisions](#7-security-decisions)
8. [Key Challenges & How They Were Solved](#8-key-challenges--how-they-were-solved)
9. [Design Decisions](#9-design-decisions)
10. [Testing](#10-testing)
11. [Future Improvements](#11-future-improvements)

---

## 1. Project Overview

SmartShop is a full-stack e-commerce platform that separates the customer-facing storefront from the admin management panel — mirroring real-world production architecture.

### Key Features

| Area | Description |
|---|---|
| **Storefront** | Browse products, filter by category, search, sort, and paginate |
| **Cart** | Client-side cart with quantity management and order summary |
| **Checkout** | Place orders with stock validation; orders persisted to the database |
| **Admin Panel** | Create, update, and delete products; view and update order statuses |
| **Authentication** | JWT-based login for admin routes; rate-limited login endpoint |
| **CI/CD** | GitHub Actions pipeline with parallel backend/frontend jobs |
| **Testing** | Jest + Supertest integration tests (backend), Vitest unit tests (frontend) |
| **Dependabot** | Automated weekly dependency update PRs |

---

## 2. Architecture

### Frontend Structure

```
client/src/
├── admin/          # Admin-only views (Dashboard, Products, Orders)
├── storefront/     # Customer-facing views (Home, Product listing)
├── components/     # Shared UI components (Cart, Header, etc.)
├── context/        # AuthContext (JWT state), CartContext (cart state)
├── services/       # API abstraction layer (productService, orderService)
└── pages/          # Route-level components
```

The frontend uses **React Router** to enforce the separation between the storefront (`/`, `/cart`) and the admin panel (`/admin/*`). No admin UI is accessible without a valid JWT stored in `localStorage`.

### Backend Structure

```
server/src/
├── controllers/    # Business logic (productController, orderController, authController)
├── routes/         # Express route definitions
├── middleware/     # JWT authentication, role guard, rate limiter
└── config/         # Prisma client singleton
```

Prisma acts as the ORM layer. The schema defines four models: `Product`, `Order`, `OrderItem`, and `User`. All database access goes through the Prisma client — no raw SQL.

### Data Flow

```
Browser
  │
  ▼
React Service Layer (fetch + authHeaders)
  │
  ▼
Express API  (/api/products, /api/orders, /api/auth)
  │
  ├── Middleware (JWT verify, requireAdmin, rate limit)
  │
  ▼
Controller (validation → business logic)
  │
  ▼
Prisma ORM
  │
  ▼
SQLite Database
```

---

## 3. Tech Stack

### Frontend
- **React 18** with **Vite** — fast dev server and optimised production builds
- **React Router v7** — client-side routing
- **Context API** — global auth and cart state (no external state library)
- **Vanilla CSS** — custom stylesheets per feature area

### Backend
- **Node.js** + **Express** — REST API server
- **Prisma ORM** — type-safe database access and schema migrations
- **SQLite** — embedded database (file-based, zero infrastructure)
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT signing and verification
- **Helmet** — HTTP security headers
- **express-rate-limit** — brute-force protection on the login endpoint

### DevOps & Tooling
- **GitHub Actions** — parallel CI jobs (backend lint + test, frontend lint + build)
- **Dependabot** — automated weekly dependency PRs for npm and GitHub Actions
- **ESLint** + **Prettier** — code quality and consistent formatting (both packages)
- **Jest** + **Supertest** — backend integration tests
- **Vitest** + **React Testing Library** — frontend unit tests
- **Docker** — containerisation for both client and server

---

## 4. How to Run Locally

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Clone the Repository

```bash
git clone https://github.com/White-Devil2839/SmartShop.git
cd SmartShop
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-strong-secret-here"
NODE_ENV="development"
PORT=5001
```

Push the schema and (optionally) seed sample data:

```bash
npx prisma db push
node prisma/seed.js   # seeds 15 sample products + admin user
```

Start the dev server:

```bash
npm run dev           # runs on http://localhost:5001
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in `client/` (optional — defaults to `localhost:5001`):

```env
VITE_API_URL=http://localhost:5001
```

Start the dev server:

```bash
npm run dev           # runs on http://localhost:5173
```

### Environment Variables Reference

| Variable | Location | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | `server/.env` | ✅ | Prisma DB connection string |
| `JWT_SECRET` | `server/.env` | ✅ | Secret for signing JWTs |
| `NODE_ENV` | `server/.env` | ✅ | `development` / `production` / `test` |
| `PORT` | `server/.env` | ❌ | API port (default: 5001) |
| `VITE_API_URL` | `client/.env` | ❌ | Backend base URL (default: `http://localhost:5001`) |

---

## 5. CI/CD Overview

The pipeline is defined in `.github/workflows/ci.yml` and runs on every push and pull request to `main`.

### Jobs (run in parallel)

#### `backend` — Test & Lint
1. Install dependencies (`npm ci`)
2. Generate Prisma client (`npx prisma generate`)
3. Push schema to in-memory SQLite test DB (`npx prisma db push`)
4. Run test suite (`npm test`) with `DATABASE_URL=file:./prisma/test.db`
5. Lint source (`npm run lint`)

#### `frontend` — Lint & Build
1. Install dependencies (`npm ci`)
2. Lint source (`npm run lint`)
3. Production build (`npm run build`)

Running jobs in parallel means a backend failure does not block frontend feedback, and vice versa.

### Dependabot

`.github/dependabot.yml` is configured with weekly checks for:
- `/client` — npm packages
- `/server` — npm packages
- `/.github/workflows` — GitHub Actions versions

---

## 6. API Overview

All endpoints are prefixed with `/api`. Authenticated routes require a `Bearer <token>` header.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | None | Returns JWT + user object |
| `GET` | `/api/auth/me` | JWT | Validates stored token |

### Products

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | None | List all products |
| `GET` | `/api/products/:id` | None | Get single product |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Hard or soft delete |

**Pagination** — append `?page=1&limit=20` to any list endpoint. Response shape:
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```
Without `?page`, the envelope is `{ "data": [...], "pagination": null }` for backward compatibility.

**Filtering** — `?category=Electronics&isActive=true`

### Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | JWT | Place an order (checkout) |
| `GET` | `/api/orders` | Admin | List all orders (paginated) |
| `GET` | `/api/orders/:id` | JWT | Get order details |
| `PATCH` | `/api/orders/:id/status` | Admin | Update order status |

**Valid order statuses:** `pending` → `confirmed` → `shipped` → `delivered` (forward only; `cancelled` is always allowed)

---

## 7. Security Decisions

### JWT Authentication
Admin routes are protected by a middleware chain: `authenticate` (verifies the token) → `requireAdmin` (checks `role === 'admin'`). The `JWT_SECRET` comes exclusively from environment variables — no fallback, no hardcoded value.

### Rate Limiting on Login
The `POST /api/auth/login` endpoint is throttled to **10 requests per 15 minutes per IP** using `express-rate-limit`. This prevents automated brute-force attacks against admin credentials.

### Soft Delete for Products
Deleting a product that is referenced by an existing order would break order history. Instead, such products are marked `isActive: false` (hidden from storefront) while preserving their association with historical `OrderItem` records. Products with no order history are permanently deleted.

### Input Validation
All write endpoints validate types, required fields, string length limits, category enum membership, and URL format before any database call. Validation errors return structured `400` responses.

### Helmet Security Headers
`helmet()` is applied globally to set `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and other hardening headers on every response.

### Protected Order Routes
Order listing is admin-only. Customers can only retrieve their own order by ID. There is no publicly accessible endpoint that exposes all order data.

---

## 8. Key Challenges & How They Were Solved

### Product Deletion Breaking Order History
Naively deleting a product that appeared in past orders would leave dangling `OrderItem` references. This was solved with a **soft-delete strategy**: before deleting, the controller checks `_count.orderItems`. If the count is greater than zero, the product is deactivated (`isActive: false`) rather than removed, preserving referential integrity while hiding it from the storefront.

### Public Order Endpoint
Early in development, the `GET /api/orders` route was unauthenticated, exposing all customer orders publicly. This was corrected by applying the `authenticate` + `requireAdmin` middleware chain to all order listing and status-update routes.

### Prisma Migrations in CI
Using `prisma migrate deploy` in CI requires a migration history file, which conflicted with SQLite and a simple test setup. Switching to `prisma db push --accept-data-loss` syncs the schema to a fresh SQLite file on each CI run without needing a migration history — safe for a test environment.

### ESLint v10 Flat Config Requirement
ESLint v10 dropped support for the legacy `.eslintrc.*` format. The server-side config was migrated from `.eslintrc.cjs` to the new `eslint.config.mjs` flat-config format. Node.js and Web API globals (`URL`, `URLSearchParams`, Jest test globals) were declared explicitly since the flat config does not auto-include environment presets.

### localStorage Crash in Vitest
`AuthContext` reads `localStorage` inside a `useState` lazy initialiser, which executes synchronously on first render. In the Vitest + jsdom environment, `localStorage` was not always available at that point. The fix was to add an explicit in-memory `localStorage` mock in `setupTests.js`, registered before any test file loads, and cleared in `beforeEach` to prevent state leakage between tests.

### Broken App Smoke Test Selector
The existing `App.test.jsx` used `getByText(/ShopSmart/i)` to assert the brand was rendered. The brand element renders as an anchor containing an emoji text node and a `<span>SmartShop</span>` child, so `getByText` could not match the split text. The fix was to use `getByRole('link', { name: /SmartShop/i })`, which correctly computes the full accessible name of the anchor element.

---

## 9. Design Decisions

### SQLite Instead of PostgreSQL
SQLite was chosen for its zero-configuration setup and file-based storage, making the project trivially reproducible on any machine without running a separate database server. Prisma's provider-agnostic schema means swapping to PostgreSQL in production requires only a one-line change in `schema.prisma`.

### Context API Instead of Redux
The application's state requirements are limited to two concerns: authentication status and cart contents. Adding Redux or Zustand would introduce unnecessary boilerplate. React's built-in Context API is sufficient at this scale and keeps the dependency footprint small.

### Server-Side Pagination
Returning the entire product catalogue on every request would be impractical as the catalogue grows. Pagination is implemented server-side via Prisma's `skip`/`take` with a consistent `{ data, pagination }` envelope. The frontend opts in by passing `?page=1` — without it, the full list is returned for backward compatibility.

### Separate Admin and Storefront
The admin panel and customer storefront are kept as distinct route trees (`/admin/*` vs `/`), with separate component directories and CSS. This mirrors how real-world applications separate concerns — making it straightforward to restrict, deploy, or style each surface independently.

### Skipping E2E Tests
Cypress or Playwright would add approximately 150 MB of dependencies and significant setup complexity. Given the rubric marks E2E as a bonus item, the tradeoff favoured investing that time in solid unit and integration test coverage instead.

---

## 10. Testing

### Backend — Jest + Supertest

**File:** `server/tests/products.test.js`

Integration tests run against a real SQLite test database (`prisma/test.db`). An admin user is created inline in `beforeAll` using `bcryptjs` and the Prisma client (no seed script dependency), a JWT is obtained via the login endpoint, and the full product CRUD lifecycle is exercised:

- `GET /api/products` — returns envelope with `data` array and `pagination: null`
- `GET /api/products?page=1&limit=5` — returns paginated envelope
- `POST /api/products` (no token) → 401
- `POST /api/products` (admin token) → 201 with correct fields
- `POST /api/products` (missing fields) → 400 validation error
- `GET /api/products/:id` — returns created product
- `GET /api/products/9999999` → 404
- `GET /api/products/abc` → 400
- `DELETE /api/products/:id` (no token) → 401
- `DELETE /api/products/:id` (admin token) → 200, hard-deleted, confirmed 404

**File:** `server/tests/app.test.js`

Smoke test — `GET /api/health` returns `200` with `{ status: 'ok' }`.

### Frontend — Vitest + React Testing Library

**File:** `client/src/services/productService.test.js`

Unit tests for `getAllProducts` with a mocked `global.fetch`:

- Unpaginated call extracts the `.data` array from the envelope
- Unpaginated call hits the correct URL with no query string
- Category filter is appended to the URL
- Non-ok response throws `'Failed to fetch products'`
- Paginated call (`?page=1`) returns the full envelope (data + pagination)
- Page and limit are correctly appended to the URL

**File:** `client/src/App.test.jsx`

Smoke test — renders `<App />` and asserts the SmartShop brand link is present in the document.

### Results

| Suite | Tool | Tests | Status |
|---|---|---|---|
| Backend integration | Jest + Supertest | 11 | ✅ All passing |
| Frontend unit | Vitest | 7 | ✅ All passing |
| **Total** | | **18** | ✅ |

---

## 11. Future Improvements

| Improvement | Rationale |
|---|---|
| **Payment integration (Stripe)** | Replace the mock checkout flow with real payment processing |
| **PostgreSQL migration** | Switch from SQLite to a production-grade database for multi-user concurrency and deployment on platforms like Render or Railway |
| **Customer accounts** | Allow shoppers to register, log in, and view their own order history |
| **E2E testing (Cypress / Playwright)** | Cover the complete user journey — login to checkout — with browser-level automation |
| **Image uploads** | Replace URL-based images with direct file uploads stored in S3 or similar object storage |
| **Email notifications** | Send order confirmation and status update emails to customers |

---

*Built as a Full Stack Development Engineering project — April 2026.*
