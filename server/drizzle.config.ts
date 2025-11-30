import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

// Construir URL de conexión desde parámetros individuales o usar DATABASE_URL
const connectionUrl = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'resumate'}`;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionUrl,
  },
  verbose: true,
  strict: true,
});
