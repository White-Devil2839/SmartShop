# SmartShop — Demo Script (Viva)

A step-by-step walkthrough of the complete user journey, from admin login through order fulfilment.

> **Prerequisites**
> - Backend running on `http://localhost:5001` (`npm run dev` in `/server`)
> - Frontend running on `http://localhost:5173` (`npm run dev` in `/client`)
> - Database seeded (`node prisma/seed.js`) — creates 15 products and an admin account

---

## Step 1 — Admin Login

1. Open `http://localhost:5173/admin` in the browser.
2. Enter the seeded admin credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Click **Login**.

**What happens:** The frontend calls `POST /api/auth/login`. The backend verifies the bcrypt hash, returns a signed JWT, and the token is stored in `localStorage`. The admin dashboard loads.

---

## Step 2 — Create a New Product

1. In the admin panel, click the **Products** tab.
2. Fill in the form:
   - **Name:** `Demo Widget`
   - **Description:** `A product created live during the demo.`
   - **Price:** `29.99`
   - **Stock:** `100`
   - **Category:** `General`
3. Click **Create Product**.

**What happens:** The frontend calls `POST /api/products` with the `Authorization: Bearer <token>` header. The backend validates all fields, writes to the database via Prisma, and returns the created product (`201`). It appears immediately in the product list below the form.

---

## Step 3 — View on the Storefront

1. Open a new tab at `http://localhost:5173`.
2. The **Demo Widget** appears in the storefront product grid.
3. Use the **search bar** to type `Demo` — the grid filters in real time.
4. Use the **category dropdown** and **sort** controls to demonstrate filtering.

**What happens:** The storefront calls `GET /api/products` (or with `?page=1` for paginated mode). The product list is rendered from the `{ data, pagination }` envelope.

---

## Step 4 — Add to Cart

1. Click the **Demo Widget** card.
2. Click **Add to Cart**.
3. The cart icon in the header updates with the item count (`1`).
4. Click the cart icon to open the cart drawer.
5. Increase the quantity to `2` — the order summary updates accordingly.

**What happens:** Cart state is managed client-side via `CartContext` (React Context API). No API call is made until checkout.

---

## Step 5 — Checkout (Place Order)

1. In the cart, click **Place Order**.
2. A confirmation message is shown and the cart empties.

**What happens:** The frontend calls `POST /api/orders` with the cart line items. The backend validates stock availability, writes the `Order` and `OrderItem` rows to the database, and returns the new order object. The cart context is then cleared.

---

## Step 6 — View Order in Admin

1. Switch back to the admin tab (`http://localhost:5173/admin`).
2. Click the **Orders** tab.
3. The new order appears at the top of the list with:
   - Status: `pending`
   - Correct total (2 × £29.99 = £59.98)
   - Line items showing **Demo Widget × 2**

**What happens:** The admin panel calls `GET /api/orders` (admin-only route) and renders the paginated response.

---

## Step 7 — Update Order Status

1. On the order row, open the **status dropdown**.
2. Advance the status: `pending` → `confirmed` → `shipped`.
3. Each update saves immediately and the badge updates on screen.
4. Try selecting a previous status (e.g. back to `pending`) — the UI disables invalid backward transitions.

**What happens:** Each status change calls `PATCH /api/orders/:id/status`. The backend enforces the allowed transition matrix and rejects invalid changes with a `400` error.

---

## Summary of Endpoints Exercised

| Step | Method | Endpoint | Auth |
|---|---|---|---|
| 1 | `POST` | `/api/auth/login` | None |
| 2 | `POST` | `/api/products` | Admin JWT |
| 3 | `GET` | `/api/products` | None |
| 5 | `POST` | `/api/orders` | JWT |
| 6 | `GET` | `/api/orders` | Admin JWT |
| 7 | `PATCH` | `/api/orders/:id/status` | Admin JWT |
