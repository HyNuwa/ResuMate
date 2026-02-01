import axios from 'axios';

const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:8000';

export interface ScraperHealthResponse {
  status: string;
  service: string;
  crawl4ai: string;
}

export interface ExtractJobRequest {
  url: string;
  use_llm?: boolean;
}

export interface JobData {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  employment_type?: string;
  experience_level?: string;
  posted_date?: string;
  application_deadline?: string;
  technologies?: string[];
}

export interface ExtractJobResponse {
  url: string;
  success: boolean;
  job_data?: JobData;
  raw_content?: string;
  error?: string;
}

/**
 * Servicio para interactuar con el microservicio de scraping
 */
export class ScraperService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SCRAPER_URL;
  }

  /**
   * Verifica el estado del servicio de scraping
   */
  async healthCheck(): Promise<ScraperHealthResponse> {
    try {
      const response = await axios.get<ScraperHealthResponse>(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      throw new Error(`Scraper health check failed: ${error}`);
    }
  }

  /**
   * Extrae contenido general de una URL
   */
  async extractContent(url: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/extract`, { url });
      return response.data.content || '';
    } catch (error) {
      throw new Error(`Failed to extract content from ${url}: ${error}`);
    }
  }

  /**
   * Extrae datos estructurados de una oferta de empleo
   * @param url - URL de la oferta de empleo
   * @param use_llm - Si usar LLM (Gemini) para extracción estructurada
   */
  async extractJobData(url: string, use_llm: boolean = true): Promise<ExtractJobResponse> {
    try {
      const response = await axios.post<ExtractJobResponse>(
        `${this.baseUrl}/extract-job`,
        { url, use_llm },
        { timeout: 60000 } // 60 segundos timeout (LLM puede tardar)
      );
      
      return response.data;
    } catch (error: any) {
      console.error(`Failed to extract job data from ${url}:`, error.message);
      
      return {
        url,
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  /**
   * Extrae datos de múltiples ofertas de empleo
   * @param urls - Array de URLs de ofertas
   * @param use_llm - Si usar LLM para extracción
   * @param concurrent - Número de scrapes concurrentes (default: 3)
   */
  async extractMultipleJobs(
    urls: string[],
    use_llm: boolean = true,
    concurrent: number = 3
  ): Promise<ExtractJobResponse[]> {
    const results: ExtractJobResponse[] = [];
    
    // Procesar en lotes para no sobrecargar el scraper
    for (let i = 0; i < urls.length; i += concurrent) {
      const batch = urls.slice(i, i + concurrent);
      const batchResults = await Promise.all(
        batch.map(url => this.extractJobData(url, use_llm))
      );
      results.push(...batchResults);
      
      // Pequeña pausa entre lotes
      if (i + concurrent < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Extrae ofertas de una página de listado usando el motor de Crawl4AI
   * Mucho más robusto que Regex puro.
   */
  async extractJobListings(listingUrl: string): Promise<string[]> {
    try {
      console.log(`🔍 Descubriendo ofertas en: ${listingUrl}`);
      
      const response = await axios.post(`${this.baseUrl}/extract`, {
        url: listingUrl,
        only_links: true, // Pedir solo links al microservicio
        bypass_cache: true // Siempre fresco para listings
      });
      
      const links = response.data.internal_links || [];
      
      // Filtrar URLs que parecen ser ofertas de empleo
      // Buscamos patrones comunes en URLs de empleo
      const jobUrlPatterns = [
        '/jobs/', '/careers/', '/position/', '/vacancy/', 
        '/role/', '/apply/', '/o/', '/j/' 
      ];
      
      const jobLinks = links.filter((link: string) => 
        jobUrlPatterns.some(pattern => link.includes(pattern)) &&
        !link.includes('/login') && 
        !link.includes('/signin')
      );

      console.log(`    ✓ Encontrados ${links.length} links totales, ${jobLinks.length} parecen ofertas.`);
      
      // Eliminar duplicados
      return [...new Set(jobLinks)] as string[];
    } catch (error) {
      console.error(`Failed to extract job listings from ${listingUrl}:`, error);
      return [];
    }
  }
}

// Exportar instancia singleton
export const scraperService = new ScraperService();
