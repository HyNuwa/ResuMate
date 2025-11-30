import express, { Request, Response } from 'express';
import multer from 'multer';
import { parsePDF, validateResumeContent } from '../services/parser.service';
import { optimizeResume, generateCoverLetter } from '../services/llm.service';
import { storeResumeWithEmbeddings, findRelevantExperience, saveOptimization } from '../services/rag.service';
import { pool } from '../../../config/database';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Configurar multer para uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/resume/optimize
 * Optimiza un CV para una oferta específica
 */
router.post('/optimize', upload.single('resume'), async (req: Request, res: Response): Promise<any> => {
  try {
    const { jobDescription } = req.body;
    const resumeFile = req.file;
    
    // Validaciones
    if (!resumeFile) {
      return res.status(400).json({ 
        error: 'No se recibió archivo de CV' 
      });
    }
    
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ 
        error: 'Job Description inválida (mínimo 50 caracteres)' 
      });
    }
    
    console.log(`\n🚀 Starting optimization for: ${resumeFile.originalname}`);
    const startTime = Date.now();
    
    // 1. Parse del PDF
    const resumeText = await parsePDF(resumeFile.path);
    validateResumeContent(resumeText);
    
    // 2. Almacenar en PostgreSQL con embeddings
    const resumeId = await storeResumeWithEmbeddings(
      resumeText,
      resumeFile.originalname
    );
    
    // 3. RAG: Buscar experiencia relevante
    const relevantChunks = await findRelevantExperience(
      resumeId,
      jobDescription,
      3 // Top 3 chunks más relevantes
    );
    
    const relevantExperience = relevantChunks
      .map(chunk => chunk.content)
      .join('\n\n---\n\n');
    
    // 4. Optimizar con LLM (Groq via OpenRouter)
    const result = await optimizeResume(relevantExperience, jobDescription);
    
    // 5. Guardar optimización en DB
    const optimizationId = await saveOptimization(
      resumeId,
      jobDescription,
      result.optimized,
      result.keywords,
      result.model
    );
    
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Optimization complete in ${processingTime}s\n`);
    
    res.json({
      success: true,
      data: {
        resumeId,
        optimizationId,
        original: resumeText,
        optimized: result.optimized,
        keywords: result.keywords,
        model: result.model,
        relevanceScores: relevantChunks.map(c => ({
          similarity: c.similarity,
          preview: c.content.substring(0, 100) + '...'
        })),
        processingTime: `${processingTime}s`
      }
    });
  } catch (error: any) {
    console.error('❌ Optimization error:', error);
    res.status(500).json({ 
      error: error.message || 'Error al procesar el CV'
    });
  }
});

/**
 * GET /api/resume/:id
 * Obtiene un CV por ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM resumes WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cover-letter', async (req: Request, res: Response): Promise<any> => {
  try {
    const { resumeId, jobDescription, companyName, companyUrl } = req.body;
    if (!resumeId || !jobDescription || !companyName) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const resumeResult = await pool.query(
      'SELECT original_text FROM resumes WHERE id = $1',
      [resumeId]
    );
    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }
    // const resumeText = resumeResult.rows[0].original_text;

    const relevantChunks = await findRelevantExperience(resumeId, jobDescription, 3);
    const relevantExperience = relevantChunks.map(c => c.content).join('\n\n---\n\n');

    let newsText = '';
    if (companyUrl) {
      const resp = await axios.get(companyUrl);
      const $ = cheerio.load(resp.data);
      const titles: string[] = [];
      $('h1, h2, article, .post, .news').each((_, el) => {
        const t = $(el).text().trim();
        if (t && t.length > 30) titles.push(t);
      });
      newsText = titles.slice(0, 3).join('\n');
    } else {
      const query = encodeURIComponent(companyName);
      const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
      const resp = await axios.get(rssUrl);
      const $ = cheerio.load(resp.data, { xmlMode: true });
      const items: string[] = [];
      $('item > title').each((_, el) => {
        items.push($(el).text().trim());
      });
      newsText = items.slice(0, 3).join('\n');
    }

    const result = await generateCoverLetter(relevantExperience, jobDescription, newsText, companyName);

    res.json({
      success: true,
      data: {
        resumeId,
        letter: result.letter,
        model: result.model,
        companyName,
        newsPreview: newsText.split('\n').slice(0, 3),
        relevanceScores: relevantChunks.map(c => ({ similarity: c.similarity }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al generar cover letter' });
  }
});

export default router;
