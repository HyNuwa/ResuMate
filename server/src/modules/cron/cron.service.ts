import * as cron from 'node-cron';
import { scraperService, ExtractJobResponse } from '../scraper';

/**
 * URLs de fuentes de ofertas de empleo para scraping automático
 * Puedes personalizar estas URLs según tus fuentes preferidas
 */
const JOB_SOURCES = [
  'https://www.ycombinator.com/jobs', // Fuente real rica en datos y links
  // 'https://weworkremotely.com/remote-programming-jobs', // Ejemplo alternativo
];

export class CronJobService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Inicia todos los cron jobs
   */
  start() {
    console.log('🕐 Iniciando servicios de cron jobs...');
    
    // Job semanal: Scraping de ofertas de empleo
    // Corre cada domingo a las 2 AM
    this.scheduleWeeklyJobScraping();
    
    console.log('✅ Cron jobs iniciados correctamente');
  }

  /**
   * Job semanal para scrapear ofertas de empleo
   * Corre cada domingo a las 2:00 AM
   */
  private scheduleWeeklyJobScraping() {
    const task = cron.schedule('0 2 * * 0', async () => {
      console.log('\n═══════════════════════════════════════');
      console.log('🔄 Iniciando scraping semanal de ofertas...');
      console.log('═══════════════════════════════════════\n');
      
      try {
        await this.scrapeJobPostings();
        console.log('\n✅ Scraping semanal completado');
      } catch (error) {
        console.error('\n❌ Error en scraping semanal:', error);
      }
    }, {
      timezone: 'America/Argentina/Buenos_Aires' // Ajustar según tu zona horaria
    });

    this.jobs.set('weekly_job_scraping', task);
    console.log('✅ Job semanal configurado: Domingos 2:00 AM (scraping ofertas)');
  }

  /**
   * Función principal de scraping
   * Extrae ofertas de las fuentes configuradas
   */
  private async scrapeJobPostings(): Promise<void> {
    const allJobUrls: string[] = [];

    // Paso 1: Obtener URLs de ofertas de cada fuente
    console.log('📋 Extrayendo URLs de ofertas...');
    for (const source of JOB_SOURCES) {
      try {
        console.log(`  - Procesando: ${source}`);
        const urls = await scraperService.extractJobListings(source);
        allJobUrls.push(...urls);
        console.log(`    ✓ Encontradas ${urls.length} ofertas`);
      } catch (error) {
        console.error(`    ✗ Error en ${source}:`, error);
      }
    }

    console.log(`\n📊 Total de ofertas encontradas: ${allJobUrls.length}`);

    if (allJobUrls.length === 0) {
      console.log('⚠️  No se encontraron ofertas para procesar');
      return;
    }

    // Paso 2: Extraer datos de cada oferta (en lotes)
    console.log('\n🔍 Extrayendo datos de ofertas...');
    const results = await scraperService.extractMultipleJobs(allJobUrls, true, 3);

    // Paso 3: Procesar resultados
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Exitosas: ${successful.length}`);
    console.log(`❌ Fallidas: ${failed.length}`);

    // Paso 4: Guardar ofertas en la base de datos (implementar según tu esquema)
    if (successful.length > 0) {
      console.log('\n💾 Guardando ofertas en la base de datos...');
      await this.saveJobPostings(successful);
      console.log('✅ Ofertas guardadas');
    }

    // Paso 5: Generar resumen
    this.generateSummary(successful, failed);
  }

  /**
   * Guarda las ofertas extraídas en la base de datos
   * TODO: Implementar según tu esquema de base de datos
   */
  private async saveJobPostings(jobs: ExtractJobResponse[]): Promise<void> {
    // Por ahora solo logueamos, deberás implementar la lógica de guardado
    console.log('TODO: Implementar guardado en base de datos');
    console.log(`  - Ofertas a guardar: ${jobs.length}`);
    
    // Ejemplo de estructura que podrías guardar:
    for (const job of jobs.slice(0, 3)) { // Solo mostrar 3 ejemplos
      if (job.job_data) {
        console.log(`  - ${job.job_data.title} en ${job.job_data.company}`);
      }
    }
  }

  /**
   * Genera un resumen del scraping
   */
  private generateSummary(successful: ExtractJobResponse[], failed: ExtractJobResponse[]): void {
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMEN DE SCRAPING');
    console.log('═══════════════════════════════════════');
    console.log(`Fuentes procesadas: ${JOB_SOURCES.length}`);
    console.log(`Ofertas exitosas: ${successful.length}`);
    console.log(`Ofertas fallidas: ${failed.length}`);
    console.log(`Tasa de éxito: ${((successful.length / (successful.length + failed.length)) * 100).toFixed(1)}%`);
    
    if (successful.length > 0) {
      console.log('\n✅ Primeras 5 ofertas exitosas:');
      successful.slice(0, 5).forEach((job, idx) => {
        if (job.job_data) {
          console.log(`  ${idx + 1}. ${job.job_data.title || 'Sin título'} - ${job.job_data.company || 'Sin empresa'}`);
        }
      });
    }
    
    console.log('═══════════════════════════════════════\n');
  }

  /**
   * Detiene todos los cron jobs
   */
  stop() {
    console.log('🛑 Deteniendo cron jobs...');
    this.jobs.forEach((task, name) => {
      task.stop();
      console.log(`  - Detenido: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Ejecuta manualmente el job de scraping (para testing)
   */
  async runScrapingNow(): Promise<void> {
    console.log('🚀 Ejecutando scraping manual...');
    await this.scrapeJobPostings();
  }

  /**
   * Obtiene el estado de todos los jobs
   */
  getStatus(): { name: string; running: boolean }[] {
    return Array.from(this.jobs.entries()).map(([name, task]) => ({
      name,
      running: task.getStatus() === 'scheduled'
    }));
  }
}

// Exportar instancia singleton
export const cronJobService = new CronJobService();
