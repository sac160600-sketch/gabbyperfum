# External Integrations

**Analysis Date:** 2026-06-20

## APIs & External Services

**Messaging:**
- WhatsApp (wa.me deep link) - Order notification channel; after checkout the frontend opens `https://wa.me/<WHATSAPP_NUMBER>?text=<encodedMessage>` in a new tab to deliver the order summary to the business owner
  - SDK/Client: No SDK — plain `window.open()` with URL encoding (`frontend/src/pages/client/Checkout.tsx`, line 97)
  - Auth: None — uses WhatsApp's public deep link API
  - Business number: hardcoded placeholder `573001234567` in `frontend/src/pages/client/Checkout.tsx` (line 18); must be replaced before production

**Image Hosting:**
- Unsplash (CDN) - Product seed images are served from `images.unsplash.com`; used only in `backend/prisma/seed.ts` for demo data. Production product images are stored as `image_url` strings in the DB; no upload mechanism exists yet

## Data Storage

**Databases:**
- Microsoft SQL Server - Primary data store for all application data
  - Connection: `DATABASE_URL` env var (format: `sqlserver://USER:PASSWORD@HOST:PORT/DATABASE?options`)
  - Client: Prisma ORM 5.22.0 (`@prisma/client`); singleton at `backend/src/prismaClient.ts`
  - Schema: `backend/prisma/schema.prisma` — models: `User`, `Product`, `Order`, `OrderItem`
  - Engine type: `library` (in-process; no separate query engine binary)
  - Seed script: `backend/prisma/seed.ts` (6 demo perfumes)
  - Admin seeder: `backend/seedAdmin.ts` (separate one-shot script to create initial Admin user)

**File Storage:**
- None — no file upload or object storage integration detected. Product images are external URLs stored as strings.

**Caching:**
- None — no Redis, Memcached, or in-memory cache detected in backend dependencies.

**Client-side persistence:**
- `localStorage` (`ayra_token`) — JWT token stored client-side after login (`frontend/src/lib/api.ts`)
- `localStorage` (`ayra_cart`) — Cart state serialized to JSON and hydrated on load (`frontend/src/context/CartContext.tsx`)

## Authentication & Identity

**Auth Provider:**
- Custom (self-hosted JWT) — no third-party auth provider
  - Implementation: email + bcrypt password hash (salt rounds: 12) in `backend/src/controllers/authController.ts`
  - Token: JWT signed with `JWT_SECRET` env var; 8-hour expiry; payload: `{ id, email, role }`
  - Middleware: `backend/src/middlewares/authMiddleware.ts` — validates `Authorization: Bearer <token>` header
  - Role guard: `backend/src/middlewares/adminMiddleware.ts` — checks `req.user.role === 'Admin'`
  - Roles: `Cliente` (default, set on registration) and `Admin` (assigned manually via seed script or direct DB)
  - Token storage: `localStorage` in browser (no httpOnly cookie)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or equivalent integration detected.

**Logs:**
- Backend: `morgan` 1.11.0 for HTTP request logging (`combined` format in production, `dev` in development). Global error handler logs `err.stack` via `console.error`. (`backend/src/server.ts`)
- Frontend: `console.error` used ad-hoc in catch blocks across page components.

## CI/CD & Deployment

**Hosting:**
- Not configured — no `Dockerfile`, no `.github/workflows/`, no `railway.toml`, no `render.yaml`, no `vercel.json` detected in the repo.

**CI Pipeline:**
- None — no automated CI pipeline configured.

## Payment Processing

**PSE (Pago Seguro en Línea):**
- PSE is offered as a payment method option in the checkout UI (`frontend/src/pages/client/Checkout.tsx`) and stored as `payment_method` in the `Order` model.
- **No actual PSE gateway integration exists.** Selecting PSE sets `payment_status` to `'Pagado'` in the backend (`backend/src/controllers/orderController.ts`, line 9) without any real payment transaction or verification. This is a placeholder that assumes payment has occurred.
- There is no Stripe, PayU, Wompi, MercadoPago, or any other payment gateway SDK in the dependencies.

**Contra entrega (Cash on Delivery):**
- The alternate payment option. Sets `payment_status` to `'Pagar al llegar'`. No external integration required.

## Environment Configuration

**Required env vars (backend):**
- `DATABASE_URL` — SQL Server connection string (must be set before any DB operations)
- `JWT_SECRET` — minimum 32 characters; enforced at runtime in `backend/src/controllers/authController.ts` and `backend/src/middlewares/authMiddleware.ts`
- `PORT` — HTTP port (defaults to `3000`)
- `NODE_ENV` — `development` or `production` (affects morgan log format and CORS origin list)
- `FRONTEND_URL` — production frontend origin added to CORS allowlist (`backend/src/server.ts`, line 23)

**Required env vars (frontend):**
- `VITE_API_URL` — base URL for backend API calls (defaults to `http://localhost:3000/api` if unset)

**Secrets location:**
- `.env` files (gitignored); `.env.example` templates committed at `backend/.env.example` and `frontend/.env.example`

## Webhooks & Callbacks

**Incoming:**
- None — no webhook receiver endpoints detected.

**Outgoing:**
- WhatsApp deep link redirect (not a true webhook): `https://wa.me/573001234567?text=<message>` opened client-side after order creation (`frontend/src/pages/client/Checkout.tsx`)

---

*Integration audit: 2026-06-20*
