import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Configuración para PostgreSQL local
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'resumate',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);
export { pool };

// Inicializar extensión pgvector y verificar conexión
export async function initDatabase(): Promise<void> {
  try {
    console.log('🔄 Initializing database...');
    
    // Verificar conexión
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    client.release();
    
    // Crear extensión pgvector
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('✅ pgvector extension enabled');
    
    console.log('✅ Database initialized successfully');
    console.log('💡 Use "npm run db:push" to sync schema with database');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

export * from './schema';
