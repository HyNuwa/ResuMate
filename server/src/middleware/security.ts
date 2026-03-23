import { type Express, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { GeoUtils } from '../modules/utils/geo_utils';

// ── CORS origins ──────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL ?? 'http://localhost:5173',
  'http://localhost:5174',
  process.env.ADMIN_CLIENT_URL ?? 'http://localhost:5175',
  'http://localhost:3000',
];

// ── Rate limiter ──────────────────────────────────────────────────────────────

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => GeoUtils.getValidIP(req),
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please try again in 15 minutes.',
    });
  },
});

// ── Session configuration ─────────────────────────────────────────────────────

function buildSessionConfig(): session.SessionOptions {
  const config: session.SessionOptions = {
    secret: process.env.SESSION_SECRET ?? 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 h
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
    name: 'sessionId',
    rolling: true,
  };

  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pgSession = require('connect-pg-simple')(session);
      config.store = new pgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'user_sessions',
      });
      console.log('Session store: PostgreSQL');
    } catch {
      console.warn('PostgreSQL session store unavailable, using MemoryStore');
    }
  } else {
    console.log('Session store: MemoryStore (development)');
  }

  return config;
}

// ── Security headers (beyond Helmet defaults) ─────────────────────────────────

function additionalHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

// ── Mount all security middleware on app ──────────────────────────────────────

export function applySecurityMiddleware(app: Express): void {
  app.set('trust proxy', true);

  // Helmet — sets sensible HTTP security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Forwarded-For',
        'Range',
        'Accept-Ranges',
      ],
      exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
    }),
  );

  // Body parsers
  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Sessions
  app.use(session(buildSessionConfig()));

  // Passport (initialised here; strategies configured in modules/auth)
  app.use(passport.initialize());
  app.use(passport.session());

  // Extra headers
  app.use(additionalHeaders);
}
