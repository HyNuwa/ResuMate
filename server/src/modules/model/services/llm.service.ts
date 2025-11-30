import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// OpenRouter configurado como OpenAI con base URL custom
const createLLM = () => new ChatOpenAI({
  modelName: process.env.LLM_MODEL || "groq/llama-3.3-70b-versatile",
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

// Prompt principal con fórmula XYZ + Anti-AI
const resumeOptimizationPrompt = PromptTemplate.fromTemplate(`
Eres un experto en redacción de CVs técnicos para pasar sistemas ATS y impresionar reclutadores.

REGLAS CRÍTICAS (OBLIGATORIAS):
1. FÓRMULA XYZ: "Logré [X resultado] medido por [Y métrica], mediante [Z acción técnica]"
2. PROHIBIDO: adjetivos genéricos (apasionado, dinámico, proactivo, innovador, líder nato)
3. CUANTIFICA TODO: números, porcentajes, tiempo, usuarios, rendimiento
4. SÉ TÉCNICO: menciona frameworks exactos, arquitecturas, versiones
5. VERBOS DE ACCIÓN: Diseñé, Implementé, Reduje, Optimicé, Escalé, Migré, Automaticé
6. KEYWORDS NATURALES: integra términos de la JD sin forzar

CONTEXTO DEL CANDIDATO:
{originalExperience}

REQUISITOS DE LA OFERTA:
{jobDescription}

KEYWORDS CLAVE A INTEGRAR:
{keywords}

TAREA:
Reescribe los bullet points de experiencia laboral. Cada uno debe:
- Empezar con verbo de acción fuerte en pasado
- Incluir métrica cuantificable (%, tiempo, cantidad)
- Mencionar tecnologías/herramientas específicas
- Ser conciso (máximo 2 líneas)

FORMATO DE SALIDA:
Devuelve SOLO los bullet points mejorados, uno por línea, empezando con "•".
NO agregues títulos, secciones ni explicaciones adicionales.
Máximo 5 bullet points.
`);

// Cadenas de procesamiento
const keywordChain = keywordExtractionPrompt
  .pipe(createLLM())
  .pipe(new StringOutputParser());

const optimizationChain = resumeOptimizationPrompt
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

interface OptimizationResult {
  optimized: string;
  keywords: string[];
  model: string | undefined;
}

/**
 * Optimiza un CV usando la experiencia relevante y la JD
 */
export async function optimizeResume(originalExperience: string, jobDescription: string): Promise<OptimizationResult> {
  try {
    console.log('🤖 Optimizing resume with LLM...');
    
    // 1. Extrae keywords
    const keywords = await extractKeywords(jobDescription);
    
    // 2. Genera contenido optimizado
    const optimized = await optimizationChain.invoke({
      originalExperience,
      jobDescription,
      keywords: keywords.join(", "),
    });
    
    return {
      optimized: optimized.trim(),
      keywords,
      model: process.env.LLM_MODEL,
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
