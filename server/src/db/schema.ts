import { pgTable, serial, text, integer, timestamp, jsonb, vector, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabla para almacenar CVs parseados
export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').default('anonymous').notNull(),
  originalText: text('original_text').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabla para chunks de CV con embeddings vectoriales
export const resumeChunks = pgTable('resume_chunks', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id')
    .references(() => resumes.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1024 }), // BAAI/bge-m3 - optimized for multilingual RAG
  chunkIndex: integer('chunk_index'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla para optimizaciones generadas
export const optimizations = pgTable('optimizations', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id')
    .references(() => resumes.id, { onDelete: 'cascade' })
    .notNull(),
  jobDescription: text('job_description').notNull(),
  optimizedContent: text('optimized_content').notNull(),
  keywords: jsonb('keywords'),
  modelUsed: text('model_used'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla para CVs creados manualmente por usuarios
export const userCvs = pgTable('user_cvs', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull().default('Untitled CV'),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tabla para knowledge base (RAG de CRITERIOS)
export const knowledgeBase = pgTable('knowledge_base', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'job_requirements' | 'ats_best_practices' | 'tech_trends'
  role: text('role'), // 'Frontend Developer', 'Backend Engineer', etc.
  seniority: text('seniority'), // 'Junior', 'Mid', 'Senior'
  category: text('category'), // 'skills', 'formatting', 'keywords', 'responsibilities'
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }), // gemini-embedding-001 (768 dims)
  source: text('source'), // 'Manual', 'Indeed', 'GitHub Trends', URL
  confidence: integer('confidence').default(100), // 0-100 score
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relaciones
export const resumesRelations = relations(resumes, ({ many }) => ({
  chunks: many(resumeChunks),
  optimizations: many(optimizations),
}));

export const resumeChunksRelations = relations(resumeChunks, ({ one }) => ({
  resume: one(resumes, {
    fields: [resumeChunks.resumeId],
    references: [resumes.id],
  }),
}));

export const optimizationsRelations = relations(optimizations, ({ one }) => ({
  resume: one(resumes, {
    fields: [optimizations.resumeId],
    references: [resumes.id],
  }),
}));

// Types para TypeScript
export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;

export type ResumeChunk = typeof resumeChunks.$inferSelect;
export type NewResumeChunk = typeof resumeChunks.$inferInsert;

export type Optimization = typeof optimizations.$inferSelect;
export type NewOptimization = typeof optimizations.$inferInsert;

export type UserCv = typeof userCvs.$inferSelect;
export type NewUserCv = typeof userCvs.$inferInsert;

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type NewKnowledgeBase = typeof knowledgeBase.$inferInsert;

