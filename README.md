# 🛒 SmartShop — Full-Stack E-Commerce Application

A full-stack e-commerce web application built with **React + Vite** (frontend) and **Node.js + Express + Prisma** (backend), featuring a customer-facing storefront and a separate admin panel.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Backend** | Node.js, Express |
| **ORM / DB** | Prisma ORM v5 + SQLite |
| **Testing** | Vitest + Testing Library (frontend), Jest + Supertest (backend) |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## ✅ Features

### Storefront (Customer UI — `/`)
- 📦 Product grid showing active products only
- 🔍 Live search by name, description, or category
- 🗂️ Category filter (auto-populated from products)
- 📊 Sorting: newest / price low→high / price high→low / name A→Z
- 🖼️ Product Detail page (`/product/:id`) with full info and stock badge
- 🛒 Add to Cart with real-time stock cap enforcement
- 🧾 Cart page (`/cart`) with quantity controls, subtotal, and order summary
- ✅ Checkout → confirmed order + stock deduction
- 📋 Order Confirmation page (`/order/:id`)

### Admin Panel (`/admin`)
- 📋 Full product table (all products, including inactive)
- ➕ Add / Edit / Delete products
- 🗂️ Category dropdown and Active/Hidden toggle
- 🖼️ Image URL with live preview

---

## 📁 Project Structure

```
SmartShop/
├── .github/workflows/ci.yml     # GitHub Actions CI
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── admin/               # Admin panel components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminProductList.jsx
│   │   │   ├── AdminProductForm.jsx
│   │   │   └── admin.css
│   │   ├── context/
│   │   │   └── CartContext.jsx  # localStorage cart state
│   │   ├── services/
│   │   │   ├── productService.js
│   │   │   └── orderService.js
│   │   ├── storefront/          # Customer-facing pages
│   │   │   ├── StorefrontHome.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── OrderConfirmation.jsx
│   │   │   ├── storefront.css
│   │   │   └── cart.css
│   │   ├── App.jsx              # React Router routes
│   │   └── main.jsx
│   └── package.json
│
└── server/                      # Node.js backend
    ├── prisma/
    │   ├── migrations/
    │   └── schema.prisma
    ├── src/
    │   ├── config/prisma.js
    │   ├── controllers/
    │   │   ├── productController.js
    │   │   └── orderController.js
    │   ├── routes/
    │   │   ├── productRoutes.js
    │   │   └── orderRoutes.js
    │   ├── app.js
    │   └── index.js
    └── package.json
```

---

## 🔌 API Reference

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products (supports `?category=&isActive=`) |
| `GET` | `/api/products/:id` | Get single product |
| `POST` | `/api/products` | Create product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Place order (validates stock, atomic transaction) |
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/:id` | Get order with items |

**Checkout request body:**
```json
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

**Stock error response (409):**
```json
{
  "error": "Insufficient stock",
  "details": ["\"Keyboard\" only has 5 unit(s) left (requested 10)"]
}
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- npm

### Backend
```bash
cd server
npm install
# Ensure .env has: DATABASE_URL="file:./dev.db"
npx prisma migrate dev
npm run dev
# → http://localhost:5001
```

### Frontend
```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

> The Vite dev server proxies `/api` to `localhost:5001` automatically.

---

## 🔀 Frontend Routes

| Route | Page |
|-------|------|
| `/` | Storefront — product grid with search/filter/sort |
| `/product/:id` | Product detail page |
| `/cart` | Cart with qty controls and checkout |
| `/order/:id` | Order confirmation |
| `/admin` | Admin product management panel |

---

## 🗄️ Database Schema

```prisma
model Product {
  id          Int       @id @default(autoincrement())
  name        String
  description String
  price       Float
  stock       Int
  imageUrl    String?
  category    String    @default("General")
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Order {
  id        Int         @id @default(autoincrement())
  status    String      @default("pending")
  total     Float
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  items     OrderItem[]
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
  unitPrice Float   // price snapshot at time of order
}
```

---

## 🧪 Running Tests

```bash
# Frontend (Vitest)
cd client && npm test

# Backend (Jest)
cd server && npm test
```

---

**Last Updated:** March 2026 | All 5 development phases complete.
