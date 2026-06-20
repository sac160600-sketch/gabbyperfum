# Testing Patterns

**Analysis Date:** 2026-06-20

## Test Framework

**Runner:**
- None configured — no test framework installed in either `frontend/` or `backend/`
- `backend/package.json` test script: `"test": "echo \"Error: no test specified\" && exit 1"`
- `frontend/package.json` has no test script at all

**Assertion Library:**
- None

**Run Commands:**
```bash
# No test commands available
# backend test script exits with error by default
cd backend && npm test  # Fails immediately — not implemented
```

## Test File Organization

**Location:**
- No test files exist anywhere in the repository
- `find` across the full repo returns zero `.test.*` or `.spec.*` files

**Naming:**
- No established convention — no examples exist

**Structure:**
- No test directory structure established

## Test Structure

**Suite Organization:**
- Not applicable — no tests exist

## Mocking

**Framework:**
- None installed

**What to Mock (guidance for when tests are added):**
- `frontend/src/lib/api.ts` — the axios instance; all components depend on it for data fetching
- `frontend/src/context/CartContext.tsx` — `useCart` hook; consumed by `CartDrawer`, `ProductCard`, `ProductModal`, `ClientLayout`
- `localStorage` — used for `ayra_token`, `ayra_user`, `ayra_cart` keys across `ProtectedRoute`, `AdminLayout`, `ClientLayout`, `CartContext`
- `window.open` — called in `Checkout.tsx` to open WhatsApp link

## Fixtures and Factories

**Test Data:**
- No fixtures or factories defined

**Location:**
- No fixture directory exists

## Coverage

**Requirements:**
- None enforced — no coverage tooling configured

**View Coverage:**
```bash
# Not available
```

## Test Types

**Unit Tests:**
- Not implemented

**Integration Tests:**
- Not implemented

**E2E Tests:**
- Not implemented

## Current State Summary

Neither the `frontend/` nor `backend/` workspace has any testing infrastructure. The backend `package.json` declares a placeholder test script that fails on execution. The frontend has no test script at all.

**What needs to be added to achieve basic test coverage:**

### Frontend — Recommended setup

```bash
# Install
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Add to `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})
```

Co-locate test files with components: `frontend/src/components/ProductCard.test.tsx`

### Backend — Recommended setup

```bash
# Install
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

Place tests under `backend/src/__tests__/` or alongside source files as `*.test.ts`.

### Critical gaps to test first (in priority order)

1. `frontend/src/context/CartContext.tsx` — cart state mutations (`addToCart`, `updateQuantity`, `removeFromCart`), localStorage persistence, `totalItems` and `subtotal` derived values
2. `frontend/src/components/ProtectedRoute.tsx` — redirects to `/admin/login` when no token present
3. `backend/src/middlewares/authMiddleware.ts` — rejects missing/invalid/expired JWT tokens; passes valid tokens
4. `backend/src/middlewares/adminMiddleware.ts` — blocks non-Admin roles, passes Admin role
5. `backend/src/controllers/authController.ts` — login validation, bcrypt comparison, JWT issuance
6. `frontend/src/lib/api.ts` — `Authorization` header injection from localStorage token
7. `frontend/src/pages/client/Checkout.tsx` — form submission calls `api.post('/orders')`, then `api.patch(…/whatsapp)`, then opens WhatsApp URL

---

*Testing analysis: 2026-06-20*
