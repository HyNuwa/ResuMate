import { pool } from '../../../config/database';
import { OpenAIEmbeddings } from "@langchain/openai";
import type { NewKnowledgeBase } from '../../../db/schema';

// Gemini Embeddings via OpenRouter (same config as rag.service)
const embeddings = new OpenAIEmbeddings({
  modelName: "google/gemini-embedding-001",
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  dimensions: 768,
});

/**
 * Añadir conocimiento a la knowledge base
 */
export async function addKnowledge(data: {
  type: string;
  role?: string;
  seniority?: string;
  category?: string;
  content: string;
  source: string;
  confidence?: number;
}): Promise<number> {
  // Generar embedding del contenido
  const embedding = await embeddings.embedQuery(data.content);
  
  const result = await pool.query(
    `INSERT INTO knowledge_base 
      (type, role, seniority, category, content, embedding, source, confidence)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      data.type,
      data.role ?? null,
      data.seniority ?? null,
      data.category ?? null,
      data.content,
      JSON.stringify(embedding),
      data.source,
      data.confidence ?? 100
    ]
  );
  
  console.log(`✅ Added knowledge: ${data.type} - ${data.role || 'general'}`);
  return result.rows[0].id;
}

/**
 * Buscar conocimiento relevante usando RAG
 */
export async function findRelevantCriteria(params: {
  role?: string;
  seniority?: string;
  queryText: string;
  topK?: number;
}): Promise<any[]> {
  const { role, seniority, queryText, topK = 5 } = params;
  
  // Generar embedding de la query
  const queryEmbedding = await embeddings.embedQuery(queryText);
  
  // Construir query SQL con filtros opcionales
  let query = `
    SELECT 
      type, role, seniority, category, content, source,
      1 - (embedding <=> $1::vector) as similarity
    FROM knowledge_base
    WHERE 1=1
  `;
  const queryParams: any[] = [JSON.stringify(queryEmbedding)];
  let paramIndex = 2;
  
  if (role) {
    query += ` AND role ILIKE $${paramIndex}`;
    queryParams.push(`%${role}%`);
    paramIndex++;
  }
  
  if (seniority) {
    query += ` AND seniority = $${paramIndex}`;
    queryParams.push(seniority);
    paramIndex++;
  }
  
  query += `
    ORDER BY embedding <=> $1::vector
    LIMIT $${paramIndex}
  `;
  queryParams.push(topK);
  
  const result = await pool.query(query, queryParams);
  
  console.log(`🔍 Found ${result.rows.length} relevant knowledge items`);
  return result.rows;
}

/**
 * Obtener ATS best practices
 */
export async function getATSBestPractices(): Promise<any[]> {
  const result = await pool.query(
    `SELECT content, source, category
     FROM knowledge_base
     WHERE type = 'ats_best_practices'
     ORDER BY confidence DESC
     LIMIT 10`
  );
  
  return result.rows;
}

/**
 * Obtener tech trends recientes
 */
export async function getTechTrends(category?: string): Promise<any[]> {
  let query = `
    SELECT content, source, category
    FROM knowledge_base
    WHERE type = 'tech_trends'
      AND created_at > NOW() - INTERVAL '90 days'
  `;
  
  const params: string[] = [];
  if (category) {
    query += ` AND category = $1`;
    params.push(category);
  }
  
  query += ` ORDER BY created_at DESC LIMIT 5`;
  
  const result = await pool.query(query, params);
  return result.rows;
}
