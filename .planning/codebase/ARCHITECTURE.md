<!-- refreshed: 2026-06-20 -->
# Architecture

**Analysis Date:** 2026-06-20

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                                 │
│          Vite + React 19 + React Router v7 + Tailwind CSS 4          │
│                   `frontend/src/`                                    │
├──────────────────┬───────────────────────┬───────────────────────────┤
│  Client Pages    │    Admin Pages         │   Shared Components       │
│ `pages/client/`  │  `pages/admin/`        │  `components/`            │
│ Home, Checkout   │ Dashboard, Products,   │  ProductCard, CartDrawer  │
│ OrderConfirm,    │ Orders, Login          │  ProductModal,            │
│ TrackOrder       │                        │  ProtectedRoute           │
└────────┬─────────┴──────────┬────────────┴────────────┬──────────────┘
         │                    │                         │
         ▼                    ▼                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     API Layer (`frontend/src/lib/api.ts`)            │
│   axios instance with JWT bearer token interceptor                  │
│   Base URL: VITE_API_URL env var → http://localhost:3000/api         │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Express 5 API (`backend/src/server.ts`)           │
├──────────────────┬───────────────────────┬───────────────────────────┤
│  Routes          │   Middlewares          │   Controllers             │
│ `routes/`        │ `middlewares/`         │  `controllers/`           │
│ authRoutes       │ authMiddleware (JWT)   │  authController           │
│ productRoutes    │ adminMiddleware (role) │  productController        │
│ orderRoutes      │ rateLimiters (global,  │  orderController          │
│                  │ auth, checkout)        │                           │
└────────┬─────────┴──────────┬────────────┴────────────┬──────────────┘
         │                    │                         │
         ▼                    ▼                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│             Prisma ORM (`backend/src/prismaClient.ts`)               │
│                `backend/prisma/schema.prisma`                        │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│              SQL Server Database (Azure / local)                     │
│           Models: User, Product, Order, OrderItem                    │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Express Server | Bootstrap, security middleware, route mounting | `backend/src/server.ts` |
| Prisma Client | Singleton DB connection, schema-generated typed queries | `backend/src/prismaClient.ts` |
| Auth Controller | Register (force role=Cliente), login with bcrypt + JWT | `backend/src/controllers/authController.ts` |
| Product Controller | CRUD for perfume catalog, optional category filter | `backend/src/controllers/productController.ts` |
| Order Controller | Create order (transaction: Order + OrderItems), status updates, WhatsApp flag | `backend/src/controllers/orderController.ts` |
| Auth Middleware | Verifies Bearer JWT, attaches `req.user` | `backend/src/middlewares/authMiddleware.ts` |
| Admin Middleware | Guards routes to `role === 'Admin'` only | `backend/src/middlewares/adminMiddleware.ts` |
| API Client | Axios instance with auth token interceptor | `frontend/src/lib/api.ts` |
| Cart Context | Cart state persisted in localStorage; exposes add/remove/update/clear | `frontend/src/context/CartContext.tsx` |
| App Router | BrowserRouter with two route trees: client public and admin protected | `frontend/src/App.tsx` |
| Client Layout | Sticky navbar with cart badge, footer, CartDrawer overlay | `frontend/src/layouts/ClientLayout.tsx` |
| Admin Layout | Sidebar nav, header breadcrumb, logout | `frontend/src/layouts/AdminLayout.tsx` |
| Protected Route | Checks `ayra_token` in localStorage; redirects to `/admin/login` if missing | `frontend/src/components/ProtectedRoute.tsx` |
| Home Page | Product catalog with category filter + search, opens ProductModal | `frontend/src/pages/client/Home.tsx` |
| Products Admin Page | Full CRUD table with inline modal form for perfumes | `frontend/src/pages/admin/Products.tsx` |

## Pattern Overview

**Overall:** Full-stack monorepo — REST API + SPA, no SSR

**Key Characteristics:**
- Strict client/server separation: frontend is a standalone Vite SPA, backend is a standalone Express 5 server
- No shared code/types package between frontend and backend (types are duplicated or implicit via `any`)
- Frontend uses React Context API for global cart state; no Redux or Zustand
- Backend uses a three-tier pattern: Routes → Controllers → Prisma (no service layer)
- JWT stored in `localStorage` (key: `ayra_token`); cart also stored in `localStorage` (key: `ayra_cart`)

## Layers

**Frontend — Pages:**
- Purpose: Route-level views, fetch data directly from the API, own local component state
- Location: `frontend/src/pages/client/`, `frontend/src/pages/admin/`
- Contains: Route components that call `api.*` and compose shared components
- Depends on: `lib/api.ts`, `context/CartContext.tsx`, `components/`
- Used by: React Router routes in `frontend/src/App.tsx`

**Frontend — Layouts:**
- Purpose: Persistent shell wrapping route groups (nav, footer, sidebar)
- Location: `frontend/src/layouts/`
- Contains: `ClientLayout.tsx`, `AdminLayout.tsx`
- Depends on: `context/CartContext.tsx`, `components/CartDrawer.tsx`
- Used by: Route definitions in `frontend/src/App.tsx` via `<Outlet />`

**Frontend — Components:**
- Purpose: Reusable UI units consumed by pages and layouts
- Location: `frontend/src/components/`
- Contains: `ProductCard.tsx`, `ProductModal.tsx`, `CartDrawer.tsx`, `ProtectedRoute.tsx`
- Depends on: `context/CartContext.tsx`
- Used by: Pages and Layouts

**Frontend — Context:**
- Purpose: Global client-side state for shopping cart
- Location: `frontend/src/context/CartContext.tsx`
- Contains: `CartProvider`, `useCart` hook, `CartItem` interface
- Depends on: `localStorage`
- Used by: Layouts, components, pages

**Frontend — Lib:**
- Purpose: Pre-configured HTTP client for all API calls
- Location: `frontend/src/lib/api.ts`
- Contains: Single axios instance with request interceptor
- Depends on: `VITE_API_URL` env var, `localStorage` for token
- Used by: All pages and admin components

**Backend — Routes:**
- Purpose: Mount Express routers, apply per-route middleware chains
- Location: `backend/src/routes/`
- Contains: `authRoutes.ts`, `productRoutes.ts`, `orderRoutes.ts`
- Depends on: Middlewares, Controllers
- Used by: `backend/src/server.ts`

**Backend — Middlewares:**
- Purpose: Cross-cutting request guards and transformations
- Location: `backend/src/middlewares/`
- Contains: `authMiddleware.ts` (JWT verify), `adminMiddleware.ts` (role check)
- Depends on: `jsonwebtoken`, `JWT_SECRET` env var
- Used by: Route files

**Backend — Controllers:**
- Purpose: Business logic: validate input, call Prisma, return JSON responses
- Location: `backend/src/controllers/`
- Contains: `authController.ts`, `productController.ts`, `orderController.ts`
- Depends on: `backend/src/prismaClient.ts`
- Used by: Route files

**Backend — Prisma:**
- Purpose: Type-safe database access layer
- Location: `backend/src/prismaClient.ts`, `backend/prisma/schema.prisma`
- Contains: Singleton `PrismaClient`, schema for User/Product/Order/OrderItem
- Depends on: `DATABASE_URL` env var (SQL Server)
- Used by: Controllers

## Data Flow

### Client Shopping Flow

1. Browser loads SPA — `frontend/index.html` → `frontend/src/main.tsx` → `frontend/src/App.tsx`
2. `CartProvider` mounts, hydrates cart from `localStorage.ayra_cart`
3. `ClientLayout` renders navbar + `<Outlet />`
4. `Home` page mounts → `api.get('/products')` → Express `GET /api/products` → `productController.getProducts` → Prisma → SQL Server → JSON response
5. User adds product → `useCart().addToCart()` → state update → localStorage sync
6. User navigates to `/checkout` → `Checkout` page reads cart from context → posts `api.post('/orders', ...)` → `orderController.createOrder` → Prisma `$transaction` → creates `Order` + `OrderItem` rows → returns order ID
7. User redirected to `/order-confirmation/:id`

### Admin Authentication Flow

1. Admin visits `/admin/login` → `Login` page → `api.post('/auth/login')` → `authController.login` → bcrypt compare → JWT signed (8h) → returned in response
2. Token stored in `localStorage.ayra_token`, user stored in `localStorage.ayra_user`
3. `/admin/*` routes guarded by `ProtectedRoute` which reads `ayra_token`; missing token → redirect to `/admin/login`
4. All admin API calls send `Authorization: Bearer <token>` via axios interceptor in `frontend/src/lib/api.ts`
5. `authMiddleware` → verifies JWT → attaches `req.user` → `adminMiddleware` → checks `role === 'Admin'` → controller

### Order Management Flow

1. Admin visits `/admin/orders` → `api.get('/orders')` → `authMiddleware` + `adminMiddleware` → `orderController.getOrders` → Prisma with user join → JSON
2. Admin updates status → `api.patch('/orders/:id/status')` → `orderController.updateOrderStatus`
3. Admin marks WhatsApp notification sent → `api.patch('/orders/:id/whatsapp')` → `orderController.markWhatsappSent` (public route, no auth required)

**State Management:**
- Cart: React Context + `localStorage` — `frontend/src/context/CartContext.tsx`
- Auth: `localStorage` only (no React state/context for auth token)
- Server data: No caching — fresh `api.*` fetch on each page mount via `useEffect`

## Key Abstractions

**Axios API Client:**
- Purpose: Single pre-configured HTTP client that injects auth token on all requests
- Examples: `frontend/src/lib/api.ts`
- Pattern: Default export of a single `axios` instance; all pages import `api` and call `api.get/post/put/delete/patch`

**Prisma Singleton:**
- Purpose: One shared database connection for all controllers
- Examples: `backend/src/prismaClient.ts`
- Pattern: Module-level `new PrismaClient()`, default export, imported as `prisma` in every controller

**Express Route + Middleware Chain:**
- Purpose: Compose authentication and authorization at the route level without controller involvement
- Examples: `backend/src/routes/productRoutes.ts` (`router.post('/', authMiddleware, adminMiddleware, createProduct)`)
- Pattern: Public reads → no middleware; admin mutations → `authMiddleware` then `adminMiddleware` then controller

**React Context Cart:**
- Purpose: Cart state accessible anywhere in the component tree
- Examples: `frontend/src/context/CartContext.tsx`
- Pattern: `createContext` → `Provider` wraps `<App>` → `useCart()` hook throws if used outside provider

## Entry Points

**Backend:**
- Location: `backend/src/server.ts`
- Triggers: `npm run dev` (nodemon + tsx) or `npm start` (compiled JS)
- Responsibilities: Creates Express app, applies global middleware (helmet, CORS, body parsing, rate limiting, morgan), mounts route groups, starts HTTP listener on `PORT`

**Frontend:**
- Location: `frontend/src/main.tsx`
- Triggers: Vite dev server or built static files served by CDN/Netlify
- Responsibilities: Mounts React app into `#root` DOM node, wraps in `StrictMode`

**Frontend App Root:**
- Location: `frontend/src/App.tsx`
- Triggers: Called by `main.tsx`
- Responsibilities: Wraps entire app in `CartProvider`, defines all routes with `BrowserRouter` and `Routes`

## Architectural Constraints

- **Rendering model:** Pure client-side SPA (Vite build); no SSR, no server components
- **Auth storage:** JWT in `localStorage` — susceptible to XSS; no `httpOnly` cookie used
- **No service layer:** Controllers call Prisma directly; no domain services or repositories
- **No shared types:** Frontend uses `any` for API responses extensively (no shared DTO types between packages)
- **Global state:** `CartContext` is the only React context; auth state is implicit in `localStorage` only
- **CORS:** Strict allowlist in `backend/src/server.ts` — `http://localhost:5173` + optional `FRONTEND_URL` env var
- **Rate limiting:** Three separate limiters applied at server level: global (100/15min), auth (10/15min), checkout (20/15min)
- **Database:** SQL Server only (Azure SQL or local); Prisma schema uses `sqlserver` provider

## Anti-Patterns

### `any` used for all API data types

**What happens:** Pages (`Home.tsx`, `Products.tsx`, `Checkout.tsx`, etc.) and context (`CartContext.tsx`) type all product and order data as `any`. Controllers also use `any` for `items` parameter in `orderController.ts`.
**Why it's wrong:** Eliminates TypeScript's value entirely for the most business-critical data; runtime shape mismatches go undetected until they cause errors in production.
**Do this instead:** Define shared TypeScript interfaces (e.g., `Product`, `Order`, `CartItem` with typed `product` field) in a `frontend/src/types/` directory and use them in context, pages, and components.

### Auth state not in React

**What happens:** `ProtectedRoute` (`frontend/src/components/ProtectedRoute.tsx`) reads `localStorage` directly on render. There is no React state for the logged-in user; `ayra_user` sits only in `localStorage`.
**Why it's wrong:** React cannot react to auth changes (e.g., token expiry, logout in another tab) without a re-render trigger. Components cannot observe auth state reactively.
**Do this instead:** Create an `AuthContext` that reads the token on mount and exposes `user`, `login`, and `logout`, triggering React re-renders on change.

### No WhatsApp auth on `markWhatsappSent`

**What happens:** `PATCH /api/orders/:id/whatsapp` has no authentication middleware (`backend/src/routes/orderRoutes.ts` line 11).
**Why it's wrong:** Any anonymous caller can mark any order as having its WhatsApp notification sent, corrupting admin workflow data.
**Do this instead:** Add `authMiddleware, adminMiddleware` to the `PATCH /:id/whatsapp` route.

## Error Handling

**Strategy:** Express global error handler in `backend/src/server.ts` catches unhandled errors and returns 500; controllers use individual `try/catch` blocks returning inline JSON error objects.

**Patterns:**
- Controllers: `try { ... } catch (error) { res.status(500).json({ message: 'Server error', error }) }` — exposes `error` object to clients in non-auth routes
- Auth controller: `try/catch` returns generic `'Server error'` without leaking `error` object (safer)
- Frontend: `try/catch` in `useEffect` fetches with `console.error` only — no user-facing error state shown
- CORS violations: caught by global error handler, returns 403

## Cross-Cutting Concerns

**Logging:** `morgan` middleware in `backend/src/server.ts` — `'combined'` format in production, `'dev'` format in development. Frontend logs errors via `console.error` in catch blocks only.
**Validation:** Input validation is manual in controllers (check required fields, minimum password length). No validation library (e.g., Zod, Joi) is used.
**Authentication:** JWT HS256, 8-hour expiry, secret enforced to minimum 32 characters. Bcrypt with salt factor 12 for password hashing.
**Security headers:** `helmet()` applied globally in `backend/src/server.ts`.

---

*Architecture analysis: 2026-06-20*
