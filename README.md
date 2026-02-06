# SmartShop - E-Commerce Web Application

A full-stack e-commerce web application built with React, Node.js, Express, and Prisma ORM with SQLite database.

## 📋 Project Overview

SmartShop is a complete e-commerce platform featuring product management with full CRUD operations. The project follows a phased development approach with proper separation between frontend and backend.

## 🛠️ Tech Stack

### Frontend
- **React** (Vite) - Modern React setup with fast development
- **Vercel** - Frontend deployment platform

### Backend
- **Node.js** + **Express** - RESTful API server
- **Prisma ORM** (v5.22.0) - Database toolkit and ORM
- **SQLite3** - Lightweight relational database
- **Render** - Backend deployment platform

### Development Tools
- **Nodemon** - Auto-restart server during development
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## ✅ Completed Phases

### Phase 1: Database Layer ✓
**Status:** Complete

**What was done:**
- ✅ Installed Prisma ORM and SQLite3
- ✅ Initialized Prisma with SQLite configuration
- ✅ Created Product schema with 7 fields:
  - `id` (Int, auto-increment, primary key)
  - `name` (String, required)
  - `description` (String, required)
  - `price` (Float, required)
  - `stock` (Int, required)
  - `createdAt` (DateTime, auto-generated)
  - `updatedAt` (DateTime, auto-updated)
- ✅ Applied database migration (`20260204043710_init`)
- ✅ Generated Prisma Client
- ✅ Updated `.gitignore` to exclude database files

**Database File:** `server/dev.db`

---

### Phase 2: Backend CRUD API ✓
**Status:** Complete

**What was done:**
- ✅ Created Prisma Client singleton configuration
- ✅ Implemented Product CRUD controller with 5 functions
- ✅ Set up RESTful routes following REST conventions
- ✅ Integrated routes into Express app
- ✅ Added comprehensive error handling (400, 404, 500)
- ✅ Implemented input validation for all endpoints
- ✅ Tested all endpoints successfully

**API Endpoints:**

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| POST | `/api/products` | Create new product | 201, 400, 500 |
| GET | `/api/products` | Get all products | 200, 500 |
| GET | `/api/products/:id` | Get single product | 200, 400, 404, 500 |
| PUT | `/api/products/:id` | Update product | 200, 400, 404, 500 |
| DELETE | `/api/products/:id` | Delete product | 200, 400, 404, 500 |

**Example API Usage:**

```bash
# Create a product
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"High-performance laptop","price":999.99,"stock":10}'

# Get all products
curl http://localhost:5001/api/products

# Get single product
curl http://localhost:5001/api/products/1

# Update product
curl -X PUT http://localhost:5001/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Gaming Laptop","price":1299.99}'

# Delete product
curl -X DELETE http://localhost:5001/api/products/1
```

## 📅 Upcoming Phases

### Phase 3: Frontend (React) - Next Up
**Goal:** Create React UI for product management

**Planned features:**
- API service layer for backend communication
- Product list component with display grid
- Add product form (admin functionality)
- Edit product component with pre-filled data
- Delete product with confirmation
- Loading states and error handling
- Responsive design

---

### Phase 4: Deployment & Production
**Goal:** Deploy and polish the application

**Planned tasks:**
- Deploy backend to Render
- Configure environment variables for production
- Enable and configure CORS for cross-origin requests
- Deploy frontend to Vercel
- Test full deployed application flow
- Update documentation with deployed URLs
- Optional improvements (better UI, sorting, filtering)

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   The `.env` file should already exist with:
   ```
   DATABASE_URL="file:./dev.db"
   ```

4. **Run Prisma migration (if needed):**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Server will run on `http://localhost:5001`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
SmartShop/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   └── App.jsx        # Main app component
│   └── package.json
│
├── server/                # Node.js backend
│   ├── prisma/
│   │   ├── migrations/    # Database migrations
│   │   └── schema.prisma  # Prisma schema
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js      # Prisma client config
│   │   ├── controllers/
│   │   │   └── productController.js  # CRUD functions
│   │   ├── routes/
│   │   │   └── productRoutes.js     # API routes
│   │   ├── app.js         # Express app setup
│   │   └── index.js       # Server entry point
│   ├── dev.db             # SQLite database (gitignored)
│   └── package.json
│
└── README.md
```

## 🐛 Technical Notes & Issues Faced

### Issue 1: Prisma 7 Compatibility
**Problem:** Initially installed Prisma 7.3.0 which introduced breaking changes requiring database adapters even for SQLite.

**Error:** 
```
PrismaClientConstructorValidationError: Using engine type "client" requires 
either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

**Solution:** 
- Downgraded to Prisma 5.22.0 for simpler SQLite configuration
- Removed Prisma 7 config file (`prisma.config.ts`)
- Updated schema to Prisma 5 format (added `url` back to datasource)
- Recreated database with fresh migration

**Commands used:**
```bash
npm uninstall prisma @prisma/client
npm install prisma@5.22.0 @prisma/client@5.22.0
rm prisma.config.ts
npx prisma generate
npx prisma migrate dev --name init
```

### Issue 2: Database Table Not Found
**Problem:** After Prisma version change, the database schema was out of sync.

**Error:**
```
The table `main.Product` does not exist in the current database.
```

**Solution:**
- Deleted old database and migrations
- Applied fresh migration with Prisma 5
```bash
rm dev.db
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### Issue 3: Prisma Client Import Path
**Problem:** Initially used custom output path for Prisma Client which caused module resolution issues.

**Solution:**
- Updated Prisma schema to use default output location
- Changed generator from `prisma-client` to `prisma-client-js`
- Removed custom `output` path from generator config

## 📝 Development Workflow

1. **Planning Phase:** Create implementation plan and get approval
2. **Execution Phase:** Implement features following the plan
3. **Verification Phase:** Test all functionality thoroughly
4. **Documentation:** Update README and create walkthroughs
5. **User Approval:** Get confirmation before moving to next phase

## 🔗 API Documentation

All API endpoints return JSON responses.

### Success Responses
- **200 OK** - Successful GET, PUT, DELETE
- **201 Created** - Successful POST

### Error Responses
- **400 Bad Request** - Missing/invalid fields
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

### Validation Rules
- **name:** Required, string
- **description:** Required, string
- **price:** Required, number (float)
- **stock:** Required, number (integer)

## 📊 Current Database State

- **Products Table:** Active with full CRUD support
- **Records:** Ready for data
- **Migration Status:** Up to date (`20260204043710_init`)

## 🎯 Next Steps

1. ✅ Update README (Current)
2. ⏳ Implement React frontend (Phase 3)
3. ⏳ Deploy to Render + Vercel (Phase 4)
4. ⏳ Final testing and documentation

## 📄 License

This project is for educational purposes.

---

**Last Updated:** February 4, 2026  
**Current Phase:** Transitioning to Phase 3 (Frontend Development)
