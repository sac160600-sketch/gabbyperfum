# Technology Stack

**Analysis Date:** 2026-06-20

## Languages

**Primary:**
- TypeScript 6.x - All source files in both `frontend/src/**/*.ts`, `frontend/src/**/*.tsx` and `backend/src/**/*.ts`

**Secondary:**
- CSS - Global styles (`frontend/src/index.css`, `frontend/src/App.css`)
- JSON - Configuration files (`tsconfig.json`, `package.json`)
- Prisma SDL - Database schema (`backend/prisma/schema.prisma`)

## Runtime

**Environment:**
- Node.js 24.16.0 (local); no pinned version declared in `.nvmrc` or CI config

**Package Manager:**
- npm (frontend: `package-lock.json` present; backend: `package-lock.json` present)
- Root workspace has a minimal `package-lock.json` with no packages (lockfileVersion: 3)
- Lockfile: present in both `frontend/` and `backend/`

## Frameworks

### Frontend (`frontend/`)

**Core:**
- React 19.2.6 - UI rendering (`frontend/src/`)
- React DOM 19.2.6 - DOM binding
- React Router DOM 7.17.0 - Client-side routing (`frontend/src/App.tsx`)
- Vite 8.0.12 - Dev server and bundler (`frontend/vite.config.ts`)
- Tailwind CSS 4.3.0 - Utility-first CSS, integrated via `@tailwindcss/vite` plugin

**Build/Dev:**
- `@vitejs/plugin-react` 6.0.1 - Vite plugin for React JSX transform
- `@tailwindcss/vite` 4.3.0 - Tailwind v4 Vite integration (no separate `tailwind.config.*` needed)
- `postcss` 8.5.15 + `autoprefixer` 10.5.0 - CSS post-processing
- TypeScript compiler (`tsc -b`) - Type checking before build

**Linting:**
- ESLint 10.3.0 - Config at `frontend/eslint.config.js`
- `typescript-eslint` 8.59.2 - TypeScript rules
- `eslint-plugin-react-hooks` 7.1.1 - Hooks rules
- `eslint-plugin-react-refresh` 0.5.2 - HMR safety

**Testing:**
- Not configured — no test runner detected in `frontend/package.json`

### Backend (`backend/`)

**Core:**
- Express 5.2.1 - HTTP server (`backend/src/server.ts`)
- Prisma 5.22.0 + `@prisma/client` 5.22.0 - ORM and type-safe DB client
- `bcryptjs` 3.0.3 - Password hashing
- `jsonwebtoken` 9.0.3 - JWT signing and verification

**Security:**
- `helmet` 8.2.0 - Secure HTTP headers
- `express-rate-limit` 8.5.2 - Rate limiting (global 100 req/15min; auth 10 req/15min; checkout 20 req/15min)
- `cors` 2.8.6 - CORS policy enforcement

**Observability:**
- `morgan` 1.11.0 - HTTP request logging (`combined` in prod, `dev` in development)
- `dotenv` 17.4.2 - Environment variable loading

**Build/Dev:**
- `tsx` 4.22.4 - TypeScript execution for dev server
- `nodemon` 3.1.14 - File watcher for auto-restart (`backend/src/server.ts`)
- TypeScript compiler (`tsc`) - Compiles to `backend/dist/`

**Testing:**
- Not configured — `backend/package.json` scripts.test is a placeholder stub

## Key Dependencies

**Critical:**
- `@prisma/client` 5.22.0 - Must run `prisma generate` before `tsc` (enforced in `build` script). Engine type set to `library` in `backend/prisma/schema.prisma`
- `react-router-dom` 7.17.0 - All client-side routing; uses React Router v7 API (`BrowserRouter`, `Routes`, `Route`)
- `jsonwebtoken` 9.0.3 - JWT tokens signed with `JWT_SECRET` env var; minimum 32-character secret enforced at runtime
- `axios` 1.17.0 - HTTP client in frontend; configured as singleton at `frontend/src/lib/api.ts` with auth interceptor

**Infrastructure:**
- `express-rate-limit` 8.5.2 - Multiple limiter instances per route group; misconfiguration here affects brute-force protection
- `lucide-react` 1.17.0 - Icon library used across frontend components

## Configuration

**Frontend TypeScript:**
- `frontend/tsconfig.app.json`: `target: es2023`, `module: esnext`, `moduleResolution: bundler`, strict linting flags (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`), `jsx: react-jsx`, `verbatimModuleSyntax: true`
- No `strict: true` — strict mode is NOT enabled in the frontend TypeScript config
- `frontend/tsconfig.node.json`: separate config for Vite config file itself

**Backend TypeScript:**
- `backend/tsconfig.json`: `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `strict: true`, `outDir: ./dist`, `rootDir: ./src`, `sourceMap: true`

**Environment:**
- Frontend: `VITE_API_URL` — backend base URL (example in `frontend/.env.example`)
- Backend: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`, `FRONTEND_URL` (documented in `backend/.env.example`)
- `.env.example` files present in both packages; actual `.env` files not committed

**Build Scripts:**
- Frontend: `yarn dev` → `vite`; `yarn build` → `tsc -b && vite build`; `yarn preview` → `vite preview`
- Backend: `npm run dev` → `nodemon --exec tsx src/server.ts`; `npm run build` → `npx prisma generate && tsc`; `npm start` → `node dist/server.js`
- Backend seed: `tsx prisma/seed.ts` (invoked via `npm run prisma db seed`)

## Platform Requirements

**Development:**
- Node.js 24 (or 20+)
- SQL Server instance accessible at `DATABASE_URL` (local or remote)
- `VITE_API_URL` must point to running backend
- `JWT_SECRET` must be set (≥32 chars) before backend starts

**Production:**
- Deployment target not declared (no Dockerfile, no CI/CD config, no `.github/workflows/` detected)
- Frontend can be deployed as static assets (Vite build output in `frontend/dist/`)
- Backend requires Node.js process host with access to SQL Server

---

*Stack analysis: 2026-06-20*
