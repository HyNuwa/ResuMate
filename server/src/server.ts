// Load env vars FIRST — before any other imports
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { initDatabase } from './db';
import { GeoUtils } from './modules/utils/geo_utils';
import { cronJobService } from './modules/cron';

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  // ── 1. Database ─────────────────────────────────────────────────────────────
  const dbConfigured =
    process.env.DB_PORT && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

  if (dbConfigured) {
    try {
      await initDatabase();
      console.log('PostgreSQL + pgvector: connected');
    } catch (err) {
      console.error('Database initialization failed:', err);
      // Don't crash — allow the server to start so health checks still work
    }
  } else {
    console.warn('Database env vars not set — skipping DB init');
  }

  // ── 2. Express app ──────────────────────────────────────────────────────────
  const app = createApp();

  // ── 3. Listen ───────────────────────────────────────────────────────────────
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Env: ${process.env.NODE_ENV ?? 'development'}`);
    console.log(`Geo service: ${GeoUtils.checkServiceStatus()}`);
    console.log(`LLM model: ${process.env.LLM_MODEL ?? 'not configured'}`);

    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEY not set');
    }
  });

  // ── 4. Cron jobs ────────────────────────────────────────────────────────────
  cronJobService.start();

  // ── 5. Graceful shutdown ────────────────────────────────────────────────────
  const shutdown = (signal: string): void => {
    console.log(`\nReceived ${signal} — shutting down gracefully`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10s if connections don't drain
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
