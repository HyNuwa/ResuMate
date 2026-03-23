import express, { type Express } from 'express';

import { applySecurityMiddleware, apiLimiter } from './middleware/security';
import { geolocationMiddleware } from './middleware/geolocation';
import { globalErrorHandler, notFoundHandler } from './middleware/error-handler';
import { GeoUtils } from './modules/utils/geo_utils';

// ── Route imports (legacy + new) ──────────────────────────────────────────────
import resumeRoutes from './modules/resume/resume.routes';      // NEW — Fase 2
import legacyModelRoutes from './modules/model/routes/resumes.routes';
import cvSyncRoutes from './modules/cv-sync/routes/cv-sync.routes';
import scraperRoutes from './modules/scraper/scraper.routes';
import cronRoutes from './modules/cron/cron.routes';

// Global type extensions live here so they are loaded when app.ts is imported
declare global {
  namespace Express {
    interface Request {
      realIp?: string;
      geo?: {
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        loc?: [number, number];
        timezone?: string;
        isProxy?: boolean;
        anonymizedIp?: string;
        org?: string;
      };
      /** Typed, AJV-validated resume payload (set by validateResumeBody middleware) */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validatedData?: any;
    }
  }
}

/**
 * Creates and configures the Express application.
 *
 * Separating the app factory from `server.ts` (which calls `app.listen()`)
 * makes the app trivially testable — just import `createApp()` in tests.
 */
export function createApp(): Express {
  const app = express();

  // ── 1. Security (Helmet, CORS, body parsers, sessions, passport) ───────────
  applySecurityMiddleware(app);

  // ── 2. Rate limiter on all /api routes ─────────────────────────────────────
  app.use('/api', apiLimiter);

  // ── 3. Geolocation ─────────────────────────────────────────────────────────
  app.use(geolocationMiddleware);

  // ── 4. Routes ──────────────────────────────────────────────────────────────

  // New modular resume CRUD (Fase 2)
  app.use('/api/resumes', resumeRoutes);

  // Legacy AI / RAG pipeline (to be refactored in Fase 5)
  app.use('/api/resume', legacyModelRoutes);

  // Legacy CV sync (Fase 2 — still used by frontend during transition)
  app.use('/api/cv-sync', cvSyncRoutes);

  // Scraper + cron (unchanged)
  app.use('/api/scraper', scraperRoutes);
  app.use('/api/cron', cronRoutes);

  // ── 5. Health & status ─────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      model: process.env.LLM_MODEL,
      database: 'PostgreSQL + pgvector',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/status', (req, res) => {
    res.json({
      status: 'OK',
      env: process.env.NODE_ENV,
      clientIp: GeoUtils.shouldAnonymize() ? req.geo?.anonymizedIp : req.realIp,
      geo: req.geo,
      services: {
        database: 'connected',
        authentication: 'active',
        geo: req.geo?.country !== 'XX' ? 'active' : 'inactive',
        geoProvider:
          GeoUtils.checkServiceStatus() === 'active' ? 'ipinfo.io' : 'geoip-lite',
        llm: process.env.LLM_MODEL ?? 'not configured',
        openrouter: process.env.OPENROUTER_API_KEY ? 'configured' : 'not configured',
      },
    });
  });

  // ── 6. 404 + global error handler (must be last) ───────────────────────────
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
