import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB, { getDatabaseStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import permitRoutes from './routes/permitRoutes.js';

dotenv.config();

const app = express();
const allowedOrigins = new Set([
  ...(process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ajeer-qiwa-hrs-com.vercel.app',
]);
const vercelPreviewOrigin = /^https:\/\/ajeer-qiwa{1,2}-hrs-[a-z0-9-]+\.vercel\.app$/i;

const getDiagnostics = () => ({
  databases: getDatabaseStatus(),
  environment: {
    mongoUriConfigured: Boolean(process.env.MONGO_URI),
    databaseNameConfigured: Boolean(process.env.MONGO_DB_NAME),
    jwtSecretConfigured: Boolean(process.env.JWT_SECRET),
    adminUsernameConfigured: Boolean(process.env.ADMIN_USERNAME),
    adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD),
    frontendUrlConfigured: Boolean(process.env.FRONTEND_URL),
  },
  endpoints: {
    root: 'GET /',
    health: 'GET /api/health',
    login: 'POST /auth/login',
    permits: '/permits',
  },
  loginHint: 'A 401 means submitted credentials do not match the backend deployment environment or a database user.',
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || vercelPreviewOrigin.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Request database connection failed:', error.message);
    res.status(503).json({
      status: 'error',
      message: 'Database is temporarily unavailable',
      errorType: error.name,
      diagnostics: getDiagnostics(),
    });
  }
});

app.get(['/', '/health', '/api/health'], (req, res) => {
  const diagnostics = getDiagnostics();
  const databaseReady = diagnostics.databases.primaryConnected;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'error',
    message: databaseReady ? 'Ajeer backend is running' : 'Ajeer database is disconnected',
    ...diagnostics,
  });
});

app.use(['/auth', '/api/auth'], authRoutes);
app.use(['/permits', '/api/permits'], permitRoutes);

export default app;