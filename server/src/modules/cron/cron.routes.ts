import { Router } from 'express';
import { cronJobService } from './cron.service';

const router = Router();

/**
 * GET /api/cron/status
 * Obtiene el estado de todos los cron jobs
 */
router.get('/status', (req, res) => {
  const status = cronJobService.getStatus();
  res.json({
    jobs: status,
    total: status.length,
    running: status.filter(j => j.running).length
  });
});

/**
 * POST /api/cron/run-scraping
 * Ejecuta manualmente el job de scraping (para testing)
 */
router.post('/run-scraping', async (req, res) => {
  try {
    res.json({ message: 'Scraping iniciado en segundo plano' });
    
    // Ejecutar en segundo plano para no bloquear la respuesta
    cronJobService.runScrapingNow().catch(error => {
      console.error('Error en scraping manual:', error);
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to start scraping',
      message: error.message
    });
  }
});

export default router;
