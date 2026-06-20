import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Pilar 1: CORS — Debe ir ANTES que Helmet ───
const allowedOrigins: string[] = ['http://localhost:5173'];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

console.log('✅ Orígenes CORS permitidos:', allowedOrigins);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
    return callback(new Error('Bloqueado por política CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Responder a todas las peticiones OPTIONS (preflight) antes de cualquier otro middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ─── Pilar 4: Helmet — Oculta cabeceras sensibles ───
app.use(helmet());

// ─── Body parsing ───
app.use(express.json({ limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Pilar 4: Rate Limiters — Protección contra fuerza bruta ───

// Limiter global: 100 peticiones por IP cada 15 minutos
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' },
});
app.use(globalLimiter);

// Limiter estricto para auth: 10 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
});

// Limiter para checkout: 20 órdenes por IP cada 15 minutos
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados pedidos. Intenta de nuevo más tarde.' },
});

// ─── Rutas ───
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', checkoutLimiter, orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GABBYPERFUM API is running' });
});

// ─── Manejador global de errores ───
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === 'Bloqueado por política CORS') {
    res.status(403).json({ message: 'Origen no autorizado.' });
    return;
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`🛡️  GabbyPerfum API corriendo en puerto ${PORT} [Modo: ${process.env.NODE_ENV || 'development'}]`);
});
