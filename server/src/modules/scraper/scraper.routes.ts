import { Router } from 'express';
import { scraperService } from './scraper.service';

const router = Router();

/**
 * GET /api/scraper/health
 * Verifica el estado del servicio de scraping
 */
router.get('/health', async (req, res) => {
  try {
    const health = await scraperService.healthCheck();
    res.json(health);
  } catch (error: any) {
    res.status(503).json({
      error: 'Scraper service unavailable',
      message: error.message
    });
  }
});

/**
 * POST /api/scraper/extract-job
 * Extrae datos estructurados de una oferta de empleo
 * 
 * Body: {
 *   url: string,
 *   use_llm?: boolean (default: true)
 * }
 */
router.post('/extract-job', async (req, res) => {
  try {
    const { url, use_llm = true } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const result = await scraperService.extractJobData(url, use_llm);
    res.json(result);
  } catch (error: any) {
    console.error('Extract job error:', error);
    res.status(500).json({
      error: 'Failed to extract job data',
      message: error.message
    });
  }
});

/**
 * POST /api/scraper/extract-multiple
 * Extrae datos de múltiples ofertas de empleo
 * 
 * Body: {
 *   urls: string[],
 *   use_llm?: boolean (default: true),
 *   concurrent?: number (default: 3)
 * }
 */
router.post('/extract-multiple', async (req, res) => {
  try {
    const { urls, use_llm = true, concurrent = 3 } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }
    
    const results = await scraperService.extractMultipleJobs(urls, use_llm, concurrent);
    
    res.json({
      total: urls.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error: any) {
    console.error('Extract multiple jobs error:', error);
    res.status(500).json({
      error: 'Failed to extract multiple jobs',
      message: error.message
    });
  }
});

/**
 * POST /api/scraper/extract-listings
 * Extrae URLs de ofertas desde una página de listado
 * 
 * Body: {
 *   listing_url: string
 * }
 */
router.post('/extract-listings', async (req, res) => {
  try {
    const { listing_url } = req.body;
    
    if (!listing_url) {
      return res.status(400).json({ error: 'listing_url is required' });
    }
    
    const urls = await scraperService.extractJobListings(listing_url);
    
    res.json({
      listing_url,
      found: urls.length,
      urls
    });
  } catch (error: any) {
    console.error('Extract listings error:', error);
    res.status(500).json({
      error: 'Failed to extract job listings',
      message: error.message
    });
  }
});

export default router;
