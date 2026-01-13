import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Gemini 2.0 Flash Exp via OpenRouter (FREE)
const createLLM = () => new ChatOpenAI({
  modelName: process.env.LLM_MODEL || "google/gemini-2.0-flash-exp:free",
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
      "X-Title": process.env.APP_NAME || "ResuMate",
    },
  },
  temperature: 0.3,
  maxTokens: 2000,
});

// Prompt para extraer keywords de la Job Description
const keywordExtractionPrompt = PromptTemplate.fromTemplate(`
Analiza esta Job Description y extrae SOLO:
1. Tecnologías específicas (frameworks, lenguajes, herramientas)
2. Skills técnicos clave
3. Certificaciones o metodologías mencionadas

Job Description:
{jobDescription}

Devuelve ÚNICAMENTE una lista separada por comas, sin explicaciones.
Ejemplo: Python, Django, AWS, Docker, Scrum, CI/CD
`);

// ==================================================
// PASO 1: Gap Analysis - Detectar qué métricas existen
// ==================================================
const gapAnalysisPrompt = PromptTemplate.fromTemplate(`
Eres un analista técnico experto en CVs. Tu misión es identificar qué información cuantificable EXISTE en la experiencia original.

EXPERIENCIA ORIGINAL:
{originalExperience}

REQUISITOS DE LA JD:
{jobDescription}

ANALIZA Y DEVUELVE JSON:
{{
  "metricsFound": ["lista de TODAS las métricas/números encontrados en el original"],
  "techStack": ["tecnologías mencionadas"],
  "missingMetrics": ["qué tipos de métricas faltan para ser un bullet ATS-friendly"],
  "keywordMatches": ["keywords de la JD que aparecen en la experiencia"]
}}

EJEMPLO:
Original: "Desarrollé microservicios en AWS que mejoraron el rendimiento"
JSON:
{{
  "metricsFound": [],
  "techStack": ["AWS", "microservicios"],
  "missingMetrics": ["cantidad de microservicios", "% mejora rendimiento", "tiempo de respuesta"],
  "keywordMatches": ["AWS"]
}}

DEVUELVE SOLO EL JSON, SIN EXPLICACIONES.
`);

// ==================================================
// PASO 2: Optimización con Few-Shot Examples
// ==================================================
const fewShotOptimizationPrompt = PromptTemplate.fromTemplate(`
Eres un experto en CVs técnicos para sistemas ATS. Transforma bullets mediocres en logros de alto impacto.

📚 EJEMPLOS DE TRANSFORMACIÓN:

✅ Ejemplo 1 (CON métrica real):
❌ Original: "Trabajé en optimización de queries de base de datos"
✅ Optimizado: "Optimicé 15+ queries PostgreSQL reduciendo el tiempo de respuesta de 2.5s a 400ms, mejorando la experiencia de 50K+ usuarios activos"

✅ Ejemplo 2 (SIN métrica - usar placeholder):
❌ Original: "Implementé pipeline CI/CD en GitLab"
✅ Optimizado: "Diseñé e implementé pipeline CI/CD automatizado en GitLab usando Docker y Kubernetes, logrando [MÉTRICA: % reducción en tiempo de deploy o frecuencia de deploys/semana]"

✅ Ejemplo 3 (Multilingüe con métrica parcial):
❌ Original: "Led a team developing REST APIs"
✅ Optimizado: "Lideré equipo de [MÉTRICA: número de developers] en desarrollo de APIs REST con Node.js + Express, procesando [MÉTRICA: requests/segundo o total usuarios]"

✅ Ejemplo 4 (Migración técnica):
❌ Original: "Migré sistema legacy a arquitectura moderna"
✅ Optimizado: "Orquesté migración de monolito legacy a arquitectura de microservicios usando Spring Boot + Kafka, reduciendo [MÉTRICA: downtime, costos de infra, o tiempo de desarrollo de features]"

---

📊 CONTEXTO DE ESTA TAREA:
Experiencia Original: {originalExperience}
Métricas Encontradas: {metricsFound}
Métricas Faltantes: {missingMetrics}
Keywords Objetivo: {keywords}

🎯 REGLAS CRÍTICAS:
1. Si hay métrica REAL en "Métricas Encontradas" → úsala exactamente como está
2. Si NO hay métrica → usa formato [MÉTRICA: descripción específica de qué medir]
3. Máximo 2 líneas por bullet (25 palabras)
4. Verbos de impacto: Arquitecté, Lideré, Optimicé, Escalé, Automaticé, Consolidé
5. Integra keywords de forma NATURAL, no forzada
6. PROHIBIDO inventar números o porcentajes

📝 SALIDA:
Devuelve SOLO los bullet points optimizados, uno por línea, empezando con "•".
NO agregues títulos, explicaciones ni secciones adicionales.
Máximo 5 bullets.
`);

// ==================================================
// Cadenas de procesamiento
// ==================================================
const keywordChain = keywordExtractionPrompt
  .pipe(createLLM())
  .pipe(new StringOutputParser());

const gapAnalysisChain = gapAnalysisPrompt
  .pipe(createLLM())
  .pipe(new StringOutputParser());

const optimizationChain = fewShotOptimizationPrompt
  .pipe(createLLM())
  .pipe(new StringOutputParser());

const coverLetterPrompt = PromptTemplate.fromTemplate(`
Eres un experto creando cover letters técnicas personalizadas.

DATOS:
Empresa objetivo: {companyName}
Noticias recientes relevantes:
{news}

Experiencia del candidato:
{originalExperience}

Requisitos de la oferta:
{jobDescription}

Instrucciones:
- Redacta una cover letter breve (150-250 palabras).
- Menciona explícitamente una noticia de la empresa y cómo conecta con la experiencia.
- Integra keywords de la JD de forma natural.
- Mantén tono profesional y directo.
`);

const coverLetterChain = coverLetterPrompt
  .pipe(createLLM())
  .pipe(new StringOutputParser());

/**
 * Extrae keywords técnicos de una Job Description
 */
export async function extractKeywords(jobDescription: string): Promise<string[]> {
  try {
    const result = await keywordChain.invoke({ jobDescription });
    const keywords = result
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    console.log(`🔑 Extracted ${keywords.length} keywords`);
    return keywords;
  } catch (error) {
    console.error("Error extracting keywords:", error);
    return [];
  }
}

interface GapAnalysis {
  metricsFound: string[];
  techStack: string[];
  missingMetrics: string[];
  keywordMatches: string[];
}

interface OptimizationResult {
  optimized: string;
  keywords: string[];
  model: string | undefined;
  gaps: GapAnalysis; // Información sobre qué falta para que el usuario complete
}

/**
 * Optimiza un CV usando sistema de 2 pasos: Gap Analysis + Few-Shot Optimization
 * Esto previene alucinaciones forzando al LLM a usar solo métricas reales o placeholders
 */
export async function optimizeResume(originalExperience: string, jobDescription: string): Promise<OptimizationResult> {
  try {
    console.log('🤖 Starting 2-step optimization process...');
    
    // PASO 1: Gap Analysis - Identificar qué métricas existen
    console.log('📊 Step 1/3: Analyzing gaps...');
    const gapAnalysisResult = await gapAnalysisChain.invoke({
      originalExperience,
      jobDescription
    });
    
    // Parse del JSON devuelto por el LLM
    let gaps: GapAnalysis;
    try {
      // Limpiar posibles markdown wrappers
      const cleanJson = gapAnalysisResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      gaps = JSON.parse(cleanJson);
    } catch (parseError) {
      console.warn('⚠️ Gap analysis JSON parse failed, using defaults');
      gaps = {
        metricsFound: [],
        techStack: [],
        missingMetrics: ['métricas de impacto', 'resultados cuantificables'],
        keywordMatches: []
      };
    }
    
    console.log(`✅ Gap Analysis: ${gaps.metricsFound.length} metrics found, ${gaps.missingMetrics.length} missing`);
    
    // PASO 2: Extracción de keywords de la JD
    console.log('🔑 Step 2/3: Extracting keywords...');
    const keywords = await extractKeywords(jobDescription);
    
    // PASO 3: Optimización con contexto de gaps
    console.log('✨ Step 3/3: Generating optimized content...');
    const optimized = await optimizationChain.invoke({
      originalExperience,
      metricsFound: gaps.metricsFound.length > 0 
        ? gaps.metricsFound.join(", ") 
        : "Ninguna métrica cuantificable encontrada",
      missingMetrics: gaps.missingMetrics.join(", "),
      keywords: keywords.join(", "),
    });
    
    console.log('✅ Optimization complete with gap-aware approach');
    
    return {
      optimized: optimized.trim(),
      keywords,
      model: process.env.LLM_MODEL,
      gaps, // Devolvemos gaps para que el frontend pueda mostrar qué falta
    };
  } catch (error: any) {
    console.error("Error optimizing resume:", error);
    throw new Error(`LLM Error: ${error.message}`);
  }
}

interface CoverLetterResult {
  letter: string;
  model: string | undefined;
}

export async function generateCoverLetter(originalExperience: string, jobDescription: string, news: string, companyName: string): Promise<CoverLetterResult> {
  try {
    const letter = await coverLetterChain.invoke({
      originalExperience,
      jobDescription,
      news,
      companyName
    });
    return {
      letter: letter.trim(),
      model: process.env.LLM_MODEL
    };
  } catch (error: any) {
    throw new Error(`LLM Error: ${error.message}`);
  }
}

/**
 * Cambiar modelo dinámicamente (para testing)
 */
export function switchModel(modelName: string): void {
  const validModels = [
    "groq/llama-3.3-70b-versatile",
    "meta-llama/llama-3.1-8b-instruct",
    "qwen/qwen-2.5-72b-instruct",
  ];
  
  if (!validModels.includes(modelName)) {
    throw new Error(`Invalid model. Choose from: ${validModels.join(", ")}`);
  }
  
  process.env.LLM_MODEL = modelName;
  console.log(`🔄 Switched to model: ${modelName}`);
}
