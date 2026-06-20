# Codebase Concerns

**Analysis Date:** 2026-06-20

---

## Security Considerations

**Internal error objects leaked to client in API responses:**
- Risk: Prisma errors, database connection strings, and stack trace fragments can be exposed to any HTTP client — aids attackers in reconnaissance.
- Files: `backend/src/controllers/orderController.ts` (lines 41, 58, 70, 89, 102), `backend/src/controllers/productController.ts` (lines 11, 25, 34, 47, 57)
- Current mitigation: None — all five order-controller catch blocks respond with `{ message: 'Server error', error }`, serializing the raw caught value.
- Recommendation: Replace `error` in JSON responses with a sanitized message. Log the full error server-side only.

**PSE payment is fake — no real payment gateway integrated:**
- Risk: Users who select "Pago Electrónico con PSE" believe they are completing a secure bank debit. In reality the order is saved immediately with `payment_status = 'Pagado'` on the server, and the user is redirected to WhatsApp. No transaction, no confirmation, no refund flow exists.
- Files: `backend/src/controllers/orderController.ts` (line 9), `frontend/src/pages/client/Checkout.tsx` (lines 207–248)
- Current mitigation: None. The UI labels Bancolombia, Davivienda, Nequi, and Wompi as supported.
- Recommendation: Either remove PSE as a payment option until a real Wompi/PayU integration is built, or clearly label it as "próximamente" to avoid misleading customers.

**Order creation accepts client-supplied prices without server-side verification:**
- Risk: A malicious client can POST `{ items: [{ product: { id: 1, price: 0.01 }, quantity: 100 }] }` and the server will record a total of $1 COP and create order items with `price: 0.01` — no database lookup confirms actual product prices.
- Files: `backend/src/controllers/orderController.ts` (lines 8, 29–31)
- Current mitigation: None.
- Recommendation: Fetch product prices from the database inside the transaction and recompute the total server-side. Reject orders where the client-supplied price differs.

**`markWhatsappSent` endpoint is completely unauthenticated:**
- Risk: Any unauthenticated actor can PATCH `/api/orders/:id/whatsapp` to mark any order as WhatsApp-notified, poisoning admin tracking.
- Files: `backend/src/routes/orderRoutes.ts` (line 11)
- Current mitigation: None — this route intentionally has no `authMiddleware`.
- Recommendation: Either remove this endpoint and mark `whatsapp_sent` in the same transaction as order creation, or protect it with `authMiddleware`.

**JWT is stored in `localStorage` — exposed to XSS:**
- Risk: Any XSS vulnerability in the frontend can exfiltrate the admin JWT token. `localStorage` is accessible to all scripts on the page.
- Files: `frontend/src/lib/api.ts` (line 8), `frontend/src/pages/admin/Login.tsx` (lines 19–20), `frontend/src/layouts/AdminLayout.tsx` (lines 9–10), `frontend/src/components/ProtectedRoute.tsx` (line 4)
- Current mitigation: Helmet is applied on the backend; however, the frontend uses external Unsplash image URLs in CSS backgrounds which can be a CSP bypass point.
- Recommendation: Use `httpOnly` cookies for the JWT, or at minimum implement a strict Content-Security-Policy. Evaluate whether the token lifetime (8h) is appropriate.

**`/api/auth/register` endpoint is publicly open with no admin restriction:**
- Risk: Anyone can register a new user. While the endpoint forces `role: 'Cliente'`, this is still an open registration surface on what should be a private admin/store system.
- Files: `backend/src/routes/authRoutes.ts` (line 5), `backend/src/controllers/authController.ts` (lines 14–47)
- Current mitigation: Role is hardcoded to `'Cliente'` in the controller, so registrants cannot self-elevate to Admin.
- Recommendation: If no customer-account feature exists in the roadmap, disable or remove the register endpoint in production.

**Order tracking page exposes full customer PII to any visitor with an order ID:**
- Risk: The `/track/:id` route is fully public. Order IDs are sequential integers starting from 1, making enumeration trivial. Any visitor can view another customer's name, phone, address, email, and payment method.
- Files: `frontend/src/pages/client/TrackOrder.tsx`, `backend/src/routes/orderRoutes.ts` (line 10 — `GET /:id` has no auth)
- Current mitigation: None.
- Recommendation: Require email+order-ID confirmation to access tracking, or add a random UUID order-tracking token generated at creation time.

---

## Tech Debt

**Pervasive use of `any` type across the entire frontend:**
- Issue: `product: any`, `order: any`, `items: any[]` are used in every component and the cart context. TypeScript's type safety is effectively disabled for the core domain types.
- Files: `frontend/src/context/CartContext.tsx` (lines 9, 15, 39), `frontend/src/components/ProductCard.tsx` (line 4), `frontend/src/components/ProductModal.tsx` (line 5), `frontend/src/pages/client/Home.tsx` (lines 7, 10), `frontend/src/pages/admin/Products.tsx` (lines 6, 34), `frontend/src/pages/admin/Orders.tsx` (line 5), `frontend/src/pages/client/TrackOrder.tsx` (lines 13, 129), `frontend/src/pages/client/OrderConfirmation.tsx` (line 8)
- Impact: No compile-time safety on API response shapes. A shape change in the Prisma schema silently breaks the UI.
- Fix approach: Define a shared `src/types/` directory with `Product`, `Order`, `OrderItem`, and `CartItem` interfaces derived from the Prisma schema. Replace all `any` usages.

**Frontend `tsconfig.app.json` is missing `"strict": true`:**
- Issue: The backend has `"strict": true` but the frontend does not. Only loose checks (`noUnusedLocals`, `noUnusedParameters`) are enabled.
- Files: `frontend/tsconfig.app.json`
- Impact: `null`/`undefined` access, implicit `any` from inference gaps, and optional chaining omissions go undetected at build time.
- Fix approach: Add `"strict": true` to `frontend/tsconfig.app.json` and resolve resulting type errors.

**`any` used in backend order and update controllers:**
- Issue: `item: any` is used in `createOrder` and `updateData: any` in `updateOrderStatus`, bypassing Prisma's generated types.
- Files: `backend/src/controllers/orderController.ts` (lines 8, 26, 79)
- Fix approach: Type order items with the Prisma-inferred shape; use `Partial<Prisma.OrderUpdateInput>` for `updateData`.

**Hardcoded placeholder WhatsApp number in production code:**
- Issue: `WHATSAPP_NUMBER = "573001234567"` has an inline comment "← Reemplaza con el número real de GABBYPERFUM". A fake number is used in every checkout flow.
- Files: `frontend/src/pages/client/Checkout.tsx` (line 18)
- Impact: Every submitted order sends WhatsApp to a wrong number — orders are completely lost.
- Fix approach: Move to `VITE_WHATSAPP_NUMBER` environment variable and add startup validation that it is set.

**Broken navigation link in client navbar — `/orders` route does not exist:**
- Issue: The "MIS PEDIDOS" nav link points to `/orders` but no such route is defined in `App.tsx`. Clicking it renders nothing (or a blank 404 state).
- Files: `frontend/src/layouts/ClientLayout.tsx` (line 21), `frontend/src/App.tsx`
- Impact: Customers cannot find their order history from the navbar. The only working order-tracking path is through the confirmation page.
- Fix approach: Either create a `/track` page with an order-ID lookup form and point the nav link there, or remove the link until the feature is built.

**No shared TypeScript types between backend and frontend:**
- Issue: The Prisma schema defines the canonical data shapes, but the frontend re-invents (or skips) them with `any`. There is no `shared/` package or auto-generated OpenAPI/Zod schema.
- Files: `backend/prisma/schema.prisma` (source of truth), all frontend pages
- Impact: Schema drift goes undetected until runtime errors surface in production.
- Fix approach: Export Prisma-generated types from the backend or introduce a shared types package (`packages/shared/`).

**Cart data in `localStorage` is parsed without error handling:**
- Issue: `JSON.parse(localStorage.getItem("ayra_cart"))` runs in a state initializer with no try/catch. Corrupted or manually edited localStorage crashes the entire `CartProvider` on mount.
- Files: `frontend/src/context/CartContext.tsx` (line 30)
- Fix approach: Wrap in try/catch and return `[]` on parse failure.

**Admin product form sends raw `req.body` directly to Prisma `create`:**
- Issue: `prisma.product.create({ data: req.body })` accepts any fields the client sends, including fields not in the schema. This risks Prisma errors that leak schema information or unexpected data insertion.
- Files: `backend/src/controllers/productController.ts` (line 31)
- Fix approach: Destructure and validate allowed fields explicitly before passing to Prisma.

**Seed data runs `product.create` in a sequential loop (6 individual INSERTs):**
- Issue: `prisma/seed.ts` uses `for...of` with `await prisma.product.create()` — one round trip per record.
- Files: `backend/src/prisma/seed.ts` (lines 57–59)
- Impact: Minor for seed data, but the pattern will be copied to real code.
- Fix approach: Replace with `prisma.product.createMany({ data: products })`.

---

## Known Bugs

**`ProtectedRoute` only checks token existence, not validity:**
- Symptoms: A user with an expired or manually set fake JWT token (any non-empty string in `localStorage.ayra_token`) bypasses the frontend admin guard.
- Files: `frontend/src/components/ProtectedRoute.tsx` (lines 3–11)
- Trigger: Set `localStorage.setItem('ayra_token', 'fake')` in browser devtools, then navigate to `/admin/dashboard`.
- Workaround: The backend's `authMiddleware` will reject actual API calls with 401, but the UI renders admin screens before any API call is made.
- Fix: Decode the JWT on the client (without trusting it) to check expiry, or redirect to login on any 401 response from the API interceptor.

**Login page role check happens client-side — token is still issued:**
- Symptoms: The backend issues a valid JWT for any user (including `Cliente` role) on successful login. The frontend's role check (`data.user.role !== 'Admin'`) is the only gating mechanism. A `Cliente` user who intercepts their token can call admin API endpoints directly.
- Files: `frontend/src/pages/admin/Login.tsx` (lines 15–18), `backend/src/controllers/authController.ts` (lines 70–73)
- Trigger: POST to `/api/auth/login` with a valid `Cliente` credential, copy the token, use it in any `Authorization: Bearer` header on admin routes — the backend `adminMiddleware` rejects, but only if the route is protected.
- Note: `markWhatsappSent` has no auth at all (separate issue above).

**Orders table in admin shows `order.user?.name || 'Usuario'` — anonymous orders always display "Usuario":**
- Symptoms: Guest checkout (no `userId`) renders every order as "Usuario" in the admin orders table — there is no fallback to `customerName`.
- Files: `frontend/src/pages/admin/Orders.tsx` (line 49)
- Fix: Replace with `order.user?.name || order.customerName || 'Invitado'`.

**`getOrders` includes `{ user: { select: { name, email } } }` but orders can be guest (no `userId`):**
- Symptoms: Prisma returns `user: null` for guest orders. The frontend and dashboard calculations (`orders.reduce(...)`) do not crash but the admin UI shows placeholder text.
- Files: `backend/src/controllers/orderController.ts` (lines 64–67), `frontend/src/pages/admin/Orders.tsx`

---

## Performance Bottlenecks

**`getOrders` fetches the entire orders table with no pagination:**
- Problem: As orders accumulate, `prisma.order.findMany(...)` returns all rows on every admin page load and every dashboard refresh.
- Files: `backend/src/controllers/orderController.ts` (lines 62–72), `frontend/src/pages/admin/Dashboard.tsx` (line 12)
- Cause: No `take`/`skip` parameters. Dashboard fetches all orders just to count and sum them.
- Improvement path: Add cursor-based or offset pagination to `GET /api/orders`. Add a dedicated `GET /api/orders/stats` endpoint for dashboard aggregates computed by the database.

**`getProducts` fetches all products with no pagination or field selection:**
- Problem: Every catalog page load and every admin products page load fetches all product rows including `description` (long text).
- Files: `backend/src/controllers/productController.ts` (lines 4–12)
- Improvement path: Add pagination and a `select` projection that omits `description` from list responses (return it only on `getProductById`).

**Hero section loads a full-resolution Unsplash image via CSS background:**
- Problem: `bg-[url('https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000')]` requests a 2000px wide image on every page load with no lazy loading or responsive srcset.
- Files: `frontend/src/pages/client/Home.tsx` (line 37)
- Improvement path: Use an `<img>` with `loading="lazy"` and Unsplash's `&w=` + `&dpr=` parameters per viewport, or host the image locally.

---

## Fragile Areas

**`Checkout.tsx` — cart-clear and WhatsApp open happen before navigation, with no rollback:**
- Files: `frontend/src/pages/client/Checkout.tsx` (lines 87–103)
- Why fragile: The flow is: POST order → PATCH whatsapp → `clearCart()` → `window.open(wa.me/...)` → `navigate(...)`. If the WhatsApp tab open is blocked by the browser, or the user's browser session is lost after navigation, the cart is already cleared and the order already created. There is no way to retry the WhatsApp link from the confirmation page.
- Safe modification: Store the WhatsApp URL on the order confirmation page and offer a "Abrir WhatsApp" button there so users can retry.
- Test coverage: No tests exist.

**`CartContext` — localStorage initializer runs synchronously on mount, blocking render:**
- Files: `frontend/src/context/CartContext.tsx` (lines 28–31)
- Why fragile: `useState(() => JSON.parse(...))` is a synchronous call that can throw if localStorage is unavailable (private browsing restrictions in some browsers) or if data is corrupted. The throw is uncaught and will crash the entire app tree.
- Safe modification: Wrap in try/catch. Return `[]` on failure and optionally clear the corrupt key.

**`updateOrderStatus` accepts any string for `status` and `payment_status`:**
- Files: `backend/src/controllers/orderController.ts` (lines 74–91)
- Why fragile: No enum validation — `PATCH /orders/1/status` with `{ status: "Entregado" }` inserts an unknown status string into the database. The `TrackOrder` component's `STATUS_STEPS.indexOf(order.status)` returns `-1` and progress bar renders at 0%.
- Safe modification: Validate `status` and `payment_status` against their allowed string sets before the Prisma update.

---

## Missing Critical Features

**No 404 / catch-all route:**
- Problem: Navigating to any undefined URL (e.g., `/perfumes`, `/about`) renders a blank page. React Router silently renders nothing.
- Blocks: Basic usability and SEO.
- Files: `frontend/src/App.tsx` — no `<Route path="*">` defined.

**No loading state or error UI on the Home catalog:**
- Problem: If the `/api/products` call fails, `products` stays `[]` and the "No encontramos fragancias" empty state is shown with no error message explaining connectivity issues.
- Files: `frontend/src/pages/client/Home.tsx` (lines 12–21)

**No toast / notification system:**
- Problem: Admin actions (delete product, update order status) succeed or fail silently. `handleDelete` and `handleStatusChange` have no user feedback on success or error beyond a console.error.
- Files: `frontend/src/pages/admin/Products.tsx` (lines 27–31), `frontend/src/pages/admin/Orders.tsx` (lines 20–27)

**Dashboard metrics are computed in JavaScript from a full dataset fetch:**
- Problem: `totalSales` and `pendingOrders` are computed in the browser after fetching all orders. This duplicates backend logic and does not scale.
- Files: `frontend/src/pages/admin/Dashboard.tsx` (lines 18–21)

---

## Test Coverage Gaps

**Zero tests exist anywhere in the project:**
- What's not tested: Every controller, middleware, React component, context, utility, and page.
- Files: Entire `backend/src/` and `frontend/src/` — `backend/package.json` script `"test"` runs `echo "Error: no test specified" && exit 1`.
- Risk: Any refactor, Prisma migration, or dependency update can break order creation, authentication, or the cart silently.
- Priority: High — especially for `authMiddleware`, `adminMiddleware`, `createOrder` price logic, and `CartContext`.

---

## Dependencies at Risk

**`express` 5.x (beta/RC) in production:**
- Risk: `express@^5.2.1` is not yet stable. The v5 API has breaking changes from v4 (async error handling behavior, path params). Type definitions (`@types/express@^5.0.6`) are also pre-release.
- Impact: Unexpected behavior on route errors; community support and ecosystem plugins (middleware) primarily target v4.
- Migration plan: Pin to `express@^4.21.0` until v5 is declared stable, or accept v5 and thoroughly test all error-handling paths.

**`lucide-react@^1.17.0` on the frontend:**
- Risk: `lucide-react` reached v1.x but versioning is non-standard — icon names and exports change between minor versions. `^1.17.0` allows any minor bump.
- Impact: A minor version update can rename or remove icons used in production.
- Migration plan: Pin to an exact version (`1.17.0`) and upgrade deliberately.

---

## Scaling Limits

**SQL Server as the database for a small e-commerce store:**
- Current capacity: SQL Server (even Express edition) has a 10 GB database cap and requires Windows licensing or Azure SQL for cloud hosting.
- Limit: Hosting costs and complexity are significantly higher than PostgreSQL or MySQL for this scale of application.
- Scaling path: Migrate Prisma schema to `provider = "postgresql"` (requires adjusting `DATABASE_URL` format and running `prisma migrate`). All model definitions are compatible.

**Rate limiter state is in-process memory (not distributed):**
- Current capacity: `express-rate-limit` default store is in-memory. Works for a single-instance deployment.
- Limit: Horizontal scaling (multiple Node.js processes or containers) makes rate limits ineffective — each process tracks its own counter.
- Scaling path: Add `rate-limit-redis` store when scaling beyond a single process.

---

*Concerns audit: 2026-06-20*
