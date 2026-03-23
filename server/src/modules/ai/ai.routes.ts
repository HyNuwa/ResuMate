/**
 * AI module routes — mounted at /api/ai in app.ts (Fase 5 will implement these fully).
 *
 * For now this module re-exports the legacy model routes under a clean path.
 * During Fase 5 (AI Integration) the services will be moved here and the
 * legacy /api/resume routes will be removed.
 *
 * Current endpoints (via legacy model routes):
 *   POST /api/resume/optimize       → PDF upload + ATS optimization
 *   POST /api/resume/cover-letter   → Cover letter generation
 *   GET  /api/resume/:id            → Fetch parsed resume
 */

export { default } from '../model/routes/resumes.routes';
