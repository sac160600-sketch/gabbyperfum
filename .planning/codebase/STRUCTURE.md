# Codebase Structure

**Analysis Date:** 2026-06-20

## Directory Layout

```
gabbyperfum/                        # Monorepo root (no shared workspace config)
├── backend/                        # Express 5 + Prisma REST API
│   ├── prisma/
│   │   ├── schema.prisma           # DB schema: User, Product, Order, OrderItem
│   │   └── seed.ts                 # Seed script (run via `npx prisma db seed`)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts   # register, login
│   │   │   ├── productController.ts # getProducts, getProductById, createProduct, updateProduct, deleteProduct
│   │   │   └── orderController.ts  # createOrder, getOrderById, getOrders, updateOrderStatus, markWhatsappSent
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.ts   # JWT verification, attaches req.user
│   │   │   └── adminMiddleware.ts  # Role guard: Admin only
│   │   ├── routes/
│   │   │   ├── authRoutes.ts       # POST /auth/register, POST /auth/login
│   │   │   ├── productRoutes.ts    # GET/POST/PUT/DELETE /products
│   │   │   └── orderRoutes.ts      # POST/GET /orders, PATCH /orders/:id/status, PATCH /orders/:id/whatsapp
│   │   ├── prismaClient.ts         # Singleton PrismaClient export
│   │   └── server.ts               # Express app entrypoint
│   ├── seedAdmin.ts                # One-off script to seed an admin user
│   ├── .env.example                # Required env vars template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # React 19 SPA (Vite + React Router v7 + Tailwind 4)
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── _redirects              # Netlify/CDN SPA fallback rule
│   ├── src/
│   │   ├── assets/                 # Static images (hero.png, react.svg, vite.svg)
│   │   ├── components/             # Reusable UI components
│   │   │   ├── CartDrawer.tsx      # Slide-out cart panel
│   │   │   ├── ProductCard.tsx     # Catalog grid card with add-to-cart
│   │   │   ├── ProductModal.tsx    # Full-detail product overlay
│   │   │   └── ProtectedRoute.tsx  # Auth guard using localStorage token
│   │   ├── context/
│   │   │   └── CartContext.tsx     # Cart global state + useCart hook
│   │   ├── layouts/
│   │   │   ├── AdminLayout.tsx     # Sidebar + header shell for admin routes
│   │   │   └── ClientLayout.tsx    # Navbar + footer + CartDrawer shell for client routes
│   │   ├── lib/
│   │   │   └── api.ts              # Axios instance with JWT interceptor
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx   # Admin overview stats
│   │   │   │   ├── Login.tsx       # Admin login form
│   │   │   │   ├── Orders.tsx      # Order management table
│   │   │   │   └── Products.tsx    # Product CRUD table + modal
│   │   │   └── client/
│   │   │       ├── Home.tsx        # Product catalog with filter + search
│   │   │       ├── Checkout.tsx    # Order form (shipping info + payment method)
│   │   │       ├── OrderConfirmation.tsx  # Post-checkout confirmation
│   │   │       └── TrackOrder.tsx  # Public order status lookup
│   │   ├── App.css                 # App-level scoped CSS
│   │   ├── App.tsx                 # Router root: CartProvider + all Routes
│   │   ├── index.css               # Tailwind imports + global CSS resets
│   │   └── main.tsx                # React DOM entry point
│   ├── index.html                  # Vite HTML shell
│   ├── vite.config.ts
│   ├── eslint.config.js
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── tsconfig.node.json
│
├── .planning/                      # GSD planning artifacts (not deployed)
│   └── codebase/
│       ├── ARCHITECTURE.md
│       └── STRUCTURE.md
├── .gitignore
└── package-lock.json               # Root-level lockfile (no root package.json — likely a stray artifact)
```

## Directory Purposes

**`backend/src/controllers/`:**
- Purpose: Business logic layer — validate request, call Prisma, send JSON response
- Contains: One file per resource domain (auth, product, order)
- Key files: `authController.ts`, `productController.ts`, `orderController.ts`

**`backend/src/middlewares/`:**
- Purpose: Reusable Express middleware for cross-cutting concerns
- Contains: JWT auth guard, role-based admin guard
- Key files: `authMiddleware.ts`, `adminMiddleware.ts`

**`backend/src/routes/`:**
- Purpose: Express Router definitions — maps HTTP methods/paths to middleware + controller chains
- Contains: One router file per resource group
- Key files: `authRoutes.ts`, `productRoutes.ts`, `orderRoutes.ts`

**`backend/prisma/`:**
- Purpose: Database schema and seed scripts
- Contains: Prisma schema file, TypeScript seed scripts
- Key files: `schema.prisma` (source of truth for DB models)

**`frontend/src/pages/`:**
- Purpose: Route-level view components; two sub-groups by audience
- Contains: `client/` (public storefront), `admin/` (protected back-office)

**`frontend/src/layouts/`:**
- Purpose: Persistent shell components wrapping route groups via React Router `<Outlet />`
- Contains: `ClientLayout.tsx` (navbar + footer), `AdminLayout.tsx` (sidebar)

**`frontend/src/components/`:**
- Purpose: Shared UI components used across pages and layouts
- Contains: Product display components, cart UI, route guard

**`frontend/src/context/`:**
- Purpose: React Context providers for global client state
- Contains: `CartContext.tsx` with provider + hook

**`frontend/src/lib/`:**
- Purpose: Framework-agnostic utilities and pre-configured clients
- Contains: `api.ts` — the sole HTTP client for all API communication

**`frontend/src/assets/`:**
- Purpose: Static image assets imported directly by components
- Contains: `hero.png`, scaffold SVGs

**`frontend/public/`:**
- Purpose: Static files served as-is by Vite (not processed)
- Contains: `favicon.svg`, `icons.svg`, `_redirects` (SPA routing fallback for Netlify/CDN)

## Key File Locations

**Entry Points:**
- `backend/src/server.ts`: Express app bootstrap and HTTP server start
- `frontend/src/main.tsx`: React DOM mount
- `frontend/src/App.tsx`: All route definitions and top-level providers
- `frontend/index.html`: Vite HTML shell

**Configuration:**
- `backend/tsconfig.json`: Backend TypeScript config
- `frontend/tsconfig.app.json`: Frontend app TypeScript config (strict mode)
- `frontend/tsconfig.node.json`: Vite config TypeScript settings
- `frontend/vite.config.ts`: Vite build config (plugins: react, tailwindcss)
- `frontend/eslint.config.js`: ESLint rules for frontend
- `backend/prisma/schema.prisma`: Database schema (canonical source of models)
- `backend/.env.example`: Required backend env vars
- `frontend/.env.example`: Required frontend env vars

**Core Logic:**
- `backend/src/prismaClient.ts`: Shared Prisma singleton
- `frontend/src/lib/api.ts`: Shared axios client with auth interceptor
- `frontend/src/context/CartContext.tsx`: Cart state, persistence, and hook

**Auth:**
- `backend/src/middlewares/authMiddleware.ts`: JWT verification
- `backend/src/middlewares/adminMiddleware.ts`: Admin role enforcement
- `frontend/src/components/ProtectedRoute.tsx`: Frontend route guard

## Naming Conventions

**Files:**
- React components: PascalCase `.tsx` (e.g., `ProductCard.tsx`, `AdminLayout.tsx`)
- Utility/config files: camelCase `.ts` (e.g., `api.ts`, `prismaClient.ts`)
- Controllers: camelCase + `Controller` suffix (e.g., `authController.ts`)
- Middlewares: camelCase + `Middleware` suffix (e.g., `authMiddleware.ts`)
- Routes: camelCase + `Routes` suffix (e.g., `productRoutes.ts`)
- Context files: PascalCase + `Context` suffix (e.g., `CartContext.tsx`)
- Layout files: PascalCase + `Layout` suffix (e.g., `ClientLayout.tsx`)

**Directories:**
- Lowercase plural nouns for grouping (e.g., `controllers/`, `middlewares/`, `routes/`, `pages/`, `components/`, `layouts/`)
- Audience-based sub-grouping under `pages/` (e.g., `pages/client/`, `pages/admin/`)

**Exported Functions/Components:**
- React components: PascalCase default export matching file name (e.g., `export default function ProductCard`)
- Controller functions: camelCase named exports (e.g., `export const createProduct`)
- Middleware functions: camelCase named exports (e.g., `export const authMiddleware`)
- Context hook: camelCase with `use` prefix (e.g., `export const useCart`)

## Where to Add New Code

**New API resource (e.g., Category, Coupon):**
- Schema: Add model to `backend/prisma/schema.prisma`, then run `npx prisma migrate dev`
- Controller: `backend/src/controllers/<resource>Controller.ts`
- Routes: `backend/src/routes/<resource>Routes.ts`
- Mount: Import and `app.use('/api/<resource>', ...)` in `backend/src/server.ts`

**New client page (public storefront):**
- Page component: `frontend/src/pages/client/<PageName>.tsx`
- Route: Add `<Route path="/<path>" element={<PageName />} />` inside the `<Route element={<ClientLayout />}>` block in `frontend/src/App.tsx`

**New admin page:**
- Page component: `frontend/src/pages/admin/<PageName>.tsx`
- Route: Add `<Route path="<path>" element={<PageName />} />` inside the `<Route path="/admin" element={<ProtectedRoute />}>` block in `frontend/src/App.tsx`
- Nav entry: Add to the `navItems` array in `frontend/src/layouts/AdminLayout.tsx`

**New shared component:**
- Implementation: `frontend/src/components/<ComponentName>.tsx`
- Import directly from `../../components/<ComponentName>` (no barrel index)

**New global context/state:**
- Context file: `frontend/src/context/<Name>Context.tsx`
- Wrap provider in `frontend/src/App.tsx` around `<BrowserRouter>` (or inside, depending on if routing is needed)

**New frontend utility:**
- Utility file: `frontend/src/lib/<utilityName>.ts` — no React imports allowed here

## Special Directories

**`backend/prisma/`:**
- Purpose: Prisma schema and seed scripts; migration files generated here during `prisma migrate dev`
- Generated: `migrations/` folder is generated by Prisma CLI
- Committed: Schema (`schema.prisma`) and seed files are committed; `migrations/` should also be committed

**`frontend/public/`:**
- Purpose: Files copied verbatim to build output root; not processed by Vite
- Generated: No
- Committed: Yes — includes `_redirects` which is required for SPA routing on Netlify/CDN

**`frontend/node_modules/`:**
- Purpose: Installed frontend dependencies
- Generated: Yes (npm install)
- Committed: No

**`.planning/`:**
- Purpose: GSD workflow planning artifacts (codebase maps, phase plans, handoff state)
- Generated: By GSD commands
- Committed: Yes (tracked in git)

---

*Structure analysis: 2026-06-20*
