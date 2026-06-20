# Coding Conventions

**Analysis Date:** 2026-06-20

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` — `ProductCard.tsx`, `CartDrawer.tsx`, `ProductModal.tsx`
- Layouts: PascalCase `.tsx` under `frontend/src/layouts/` — `AdminLayout.tsx`, `ClientLayout.tsx`
- Pages: PascalCase `.tsx` under `frontend/src/pages/<area>/` — `Home.tsx`, `Checkout.tsx`, `Orders.tsx`
- Context files: PascalCase `.tsx` under `frontend/src/context/` — `CartContext.tsx`
- Backend controllers: camelCase with `Controller` suffix — `authController.ts`, `productController.ts`
- Backend routes: camelCase with `Routes` suffix — `authRoutes.ts`, `productRoutes.ts`
- Backend middlewares: camelCase with `Middleware` suffix — `authMiddleware.ts`, `adminMiddleware.ts`

**Functions:**
- React components: PascalCase function declarations, `export default function ComponentName`
- Backend controller functions: camelCase named exports — `createOrder`, `getProductById`, `updateOrderStatus`
- Middleware functions: camelCase named exports — `authMiddleware`, `adminMiddleware`
- Event handlers: camelCase prefixed with `handle` — `handleLogin`, `handleSubmit`, `handleDelete`, `handleEdit`, `handleStatusChange`
- Helper/utility functions: camelCase verb-noun — `formatCOP`, `buildWhatsAppMessage`, `getJwtSecret`

**Variables:**
- `const` by default throughout; `let` only when reassignment is needed
- State variables: camelCase noun — `products`, `orders`, `loading`, `error`, `showModal`
- Boolean state: prefixed with `is`/`show` — `isCartOpen`, `showModal`, `loading` (exception)
- Destructured API responses: `const { data } = await api.get(...)` (frontend pattern)

**Types:**
- `interface` for object shapes — `CartContextType`, `ContactForm`, `AuthRequest`
- `type` for union types and aliases — `PaymentMethod = "PSE" | "Contra entrega"`
- PascalCase for all type and interface names
- `CartItem` interface exported from `frontend/src/context/CartContext.tsx`
- `AuthRequest` interface exported from `backend/src/middlewares/authMiddleware.ts`

## Code Style

**Formatting:**
- No `.prettierrc` detected in either workspace — relies on editor defaults
- Single quotes used throughout backend (`'express'`, `'bcryptjs'`)
- Mixed quote styles in frontend: single quotes dominant but Checkout uses double quotes (`"react"`, `"PSE"`)
- Semicolons used in all files
- 2-space indentation throughout

**Linting (Frontend):**
- Config: `frontend/eslint.config.js`
- Extends `@eslint/js` recommended + `typescript-eslint` recommended + `react-hooks` + `react-refresh`
- Targets `**/*.{ts,tsx}` files only
- `dist/` directory ignored

**Linting (Backend):**
- No ESLint config detected
- TypeScript strict mode active (`"strict": true` in `backend/tsconfig.json`)

## Import Organization

**Frontend order (observed):**
1. React and React ecosystem (`react`, `react-dom`, `react-router-dom`)
2. Third-party UI libraries (`lucide-react`)
3. Internal context (`../context/CartContext`)
4. Internal components (`../components/ProductCard`)
5. Internal lib (`../../lib/api`)

**Path aliases:**
- No `@/` path alias configured in frontend `tsconfig.app.json`; all imports use relative paths (`../../lib/api`, `../context/CartContext`)

**Backend import order (observed):**
1. Framework imports (`express`, `cors`, `helmet`)
2. Internal modules (`./routes/authRoutes`, `../prismaClient`)

**Type-only imports:**
- `type` keyword used for type-only imports where detected — `import { useState, type FormEvent } from "react"` in `frontend/src/pages/client/Checkout.tsx`
- Pattern not consistently applied across all files (CartContext uses plain `import` for `ReactNode`)

## Error Handling

**Frontend — async data fetching:**
- Pattern: `try/catch` with `console.error(err)` in the catch block; no user-visible fallback in most cases
- Errors shown to user only in form-submitting pages (`Login.tsx`, `Checkout.tsx`) via `useState` error string + inline error UI
- `Checkout.tsx` catch: `catch (err: any)` — uses `any` on caught errors, then accesses `err.response?.data?.message`
- `Login.tsx` catch: same `err: any` pattern
- Non-form pages (Home, Products, Orders, Dashboard) log errors silently with `console.error`

**Backend — controllers:**
- Universal pattern: each handler wraps its body in `try { ... } catch (error) { res.status(500).json({ message: 'Server error' }) }`
- `error` variable is typed as `unknown` implicitly but treated as opaque — not narrowed before use
- Some controllers pass `error` object directly in response: `res.status(500).json({ message: 'Server error', error })` — leaks internal error details in `productController.ts` and `orderController.ts`
- Auth errors use generic `'Invalid credentials'` message (safe, intentional)
- Global error handler in `backend/src/server.ts` catches Express errors and returns 500 JSON

**JWT secret validation:**
- Helper `getJwtSecret()` defined identically in both `backend/src/controllers/authController.ts` and `backend/src/middlewares/authMiddleware.ts` — duplicated logic, not shared

## Logging

**Frontend:**
- `console.error(err)` in every catch block across all page components
- No structured logging; no log levels; errors not reported to any service

**Backend:**
- `morgan` used for HTTP request logging — `'dev'` in development, `'combined'` in production (`backend/src/server.ts`)
- `console.error(err.stack)` in the global error handler
- `console.log` for server startup message
- `console.error(error)` in `orderController.ts` `createOrder` handler only
- No structured logging library; no log aggregation

## Comments

**Backend:**
- Section-delimiter comments used in `backend/src/server.ts` with `─── Name ───` style separators
- Inline comments explain business rules — `// Forzar rol Cliente — solo un superadmin puede crear admins manualmente`
- Comments written in Spanish (matching project language)

**Frontend:**
- Sparse comments; only in `CartDrawer.tsx` — `// Próximamente Fase 6`
- `Checkout.tsx` has `// Mark WhatsApp sent`, `// Clear cart`, `// Build and encode WhatsApp message` inline labels
- No JSDoc or TSDoc used anywhere

## Function Design

**React components:**
- Props typed inline in the function signature rather than a separate interface — `{ product, onOpen }: { product: any, onOpen: () => void }` in `ProductCard.tsx` and `ProductModal.tsx`
- Exception: `CartProvider` destructures `{ children }: { children: ReactNode }`
- Components do not declare explicit return types (no `: JSX.Element` or `: React.ReactNode` annotations)
- Single default export per file, always a function

**Backend controllers:**
- All handlers typed as `async (req: Request, res: Response): Promise<void>`
- Named exports (not default exports) for controllers and middlewares
- Each function handles one HTTP operation; no composition or reuse

## Module Design

**Frontend:**
- React components: `export default function Name` pattern universally
- Context: named exports for provider and hook — `export const CartProvider`, `export const useCart`; `export interface CartItem`
- API client: `export default api` (default export from `frontend/src/lib/api.ts`)
- No barrel `index.ts` files; all imports use direct file paths

**Backend:**
- Controllers: all named exports (`export const functionName`)
- Routes: `export default router`
- Middlewares: named exports (`export const authMiddleware`, `export interface AuthRequest`)
- Prisma client: `export default prisma` from `backend/src/prismaClient.ts`
- Server: no exports — entry point only

## TypeScript Configuration

**Frontend (`frontend/tsconfig.app.json`):**
- Target ES2023, module ESNext, `moduleResolution: bundler`
- `verbatimModuleSyntax: true` — enforces `import type` syntax
- `noUnusedLocals: true`, `noUnusedParameters: true`, `erasableSyntaxOnly: true`
- `noFallthroughCasesInSwitch: true`
- Notably: `strict` mode is NOT explicitly set; no `noImplicitAny` or `exactOptionalPropertyTypes`

**Backend (`backend/tsconfig.json`):**
- Target ES2022, module NodeNext, `moduleResolution: NodeNext`
- `strict: true` — enables strict null checks and implicit any
- `esModuleInterop: true`, `allowSyntheticDefaultImports: true`

## Tailwind CSS Usage

**Version:** Tailwind CSS v4 via `@tailwindcss/vite` plugin (not PostCSS config-file approach)
**Setup:** `@import "tailwindcss"` in `frontend/src/index.css`
**Custom theme tokens defined in `frontend/src/index.css`:**
- `--color-gold-400: #e5c158`, `--color-gold-500: #d4af37`, `--color-gold-600: #c5a028`
- Despite theme tokens, components use hardcoded hex values (`bg-[#d4af37]`, `text-[#d4af37]`) throughout — theme tokens not consumed
- Classes applied inline in JSX as Tailwind utility strings
- No `cn()` utility or `clsx`/`tailwind-merge` used; conditional classes via template literals

---

*Convention analysis: 2026-06-20*
