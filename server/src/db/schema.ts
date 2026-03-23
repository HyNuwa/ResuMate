import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  vector,
  uuid,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 tables (Fase 1 — Schema & DB)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Users — authentication and profile information.
 * Auth (Fase 2) will add password_hash and OAuth fields on top.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash'),
  name: text('name'),
  locale: text('locale').default('en').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * user_cvs — the core table storing resume documents.
 *
 * Key changes vs. original:
 *  - user_id FK to users
 *  - slug for shareable URLs
 *  - schema_version to track which @resumate/schema version the data conforms to
 *  - visibility: private | public | link
 *  - password_hash for link-protected CVs
 *  - view_count / locale
 */
export const userCvs = pgTable('user_cvs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull().default('Untitled CV'),
  slug: text('slug').unique(),
  schemaVersion: text('schema_version').notNull().default('1.0.0'),
  /** Validated ResumeData object (see @resumate/schema) */
  data: jsonb('data').notNull(),
  visibility: text('visibility', { enum: ['private', 'public', 'link'] })
    .notNull()
    .default('private'),
  passwordHash: text('password_hash'),
  viewCount: integer('view_count').notNull().default(0),
  locale: text('locale').notNull().default('en'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * cv_views — anonymous tracking of shareable CV views.
 * IP is hashed before storage (privacy-first).
 */
export const cvViews = pgTable('cv_views', {
  id: serial('id').primaryKey(),
  cvId: uuid('cv_id')
    .references(() => userCvs.id, { onDelete: 'cascade' })
    .notNull(),
  viewerIpHash: text('viewer_ip_hash'),
  userAgent: text('user_agent'),
  viewedAt: timestamp('viewed_at').notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Legacy / AI tables (unchanged, kept for backward compat during refactor)
// ─────────────────────────────────────────────────────────────────────────────

/** Stores raw parsed CV text (used by the Python scraper / RAG pipeline). */
export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').default('anonymous').notNull(),
  originalText: text('original_text').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/** Vector chunks for the RAG pipeline. */
export const resumeChunks = pgTable('resume_chunks', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id')
    .references(() => resumes.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1024 }),
  chunkIndex: integer('chunk_index'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

/** AI optimization results. */
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

/** RAG knowledge base for ATS criteria. */
export const knowledgeBase = pgTable('knowledge_base', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  role: text('role'),
  seniority: text('seniority'),
  category: text('category'),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  source: text('source'),
  confidence: integer('confidence').default(100),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  cvs: many(userCvs),
}));

export const userCvsRelations = relations(userCvs, ({ one, many }) => ({
  user: one(users, {
    fields: [userCvs.userId],
    references: [users.id],
  }),
  views: many(cvViews),
}));

export const cvViewsRelations = relations(cvViews, ({ one }) => ({
  cv: one(userCvs, {
    fields: [cvViews.cvId],
    references: [userCvs.id],
  }),
}));

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

// ─────────────────────────────────────────────────────────────────────────────
// Inferred TypeScript types
// ─────────────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserCv = typeof userCvs.$inferSelect;
export type NewUserCv = typeof userCvs.$inferInsert;

export type CvView = typeof cvViews.$inferSelect;
export type NewCvView = typeof cvViews.$inferInsert;

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;

export type ResumeChunk = typeof resumeChunks.$inferSelect;
export type NewResumeChunk = typeof resumeChunks.$inferInsert;

export type Optimization = typeof optimizations.$inferSelect;
export type NewOptimization = typeof optimizations.$inferInsert;

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type NewKnowledgeBase = typeof knowledgeBase.$inferInsert;
