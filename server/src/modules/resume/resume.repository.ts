import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../../db';
import { userCvs, type UserCv, type NewUserCv } from '../../db/schema';
import type { ResumeData } from '@resumate/schema';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateResumeInput {
  title: string;
  data: ResumeData;
  userId?: string;
  locale?: string;
  schemaVersion?: string;
}

export interface UpdateResumeInput {
  title?: string;
  data?: ResumeData;
  locale?: string;
  visibility?: 'private' | 'public' | 'link';
  passwordHash?: string;
  slug?: string;
}

// ── Repository ────────────────────────────────────────────────────────────────

/**
 * Data-access layer for user_cvs.
 * All DB queries live here; no business logic.
 */
export const resumeRepository = {
  async findAll(userId?: string): Promise<UserCv[]> {
    if (userId) {
      return db
        .select()
        .from(userCvs)
        .where(eq(userCvs.userId, userId))
        .orderBy(desc(userCvs.updatedAt));
    }
    return db.select().from(userCvs).orderBy(desc(userCvs.updatedAt));
  },

  async findById(id: string): Promise<UserCv | undefined> {
    const rows = await db.select().from(userCvs).where(eq(userCvs.id, id)).limit(1);
    return rows[0];
  },

  async findBySlug(slug: string): Promise<UserCv | undefined> {
    const rows = await db.select().from(userCvs).where(eq(userCvs.slug, slug)).limit(1);
    return rows[0];
  },

  async create(input: CreateResumeInput): Promise<UserCv> {
    const values: NewUserCv = {
      title: input.title,
      data: input.data as unknown as Record<string, unknown>,
      schemaVersion: input.schemaVersion ?? '1.0.0',
      locale: input.locale ?? 'en',
      ...(input.userId ? { userId: input.userId } : {}),
    };

    const rows = await db.insert(userCvs).values(values).returning();
    return rows[0]!;
  },

  async update(id: string, input: UpdateResumeInput): Promise<UserCv | undefined> {
    const set: Partial<NewUserCv> = { updatedAt: new Date() };

    if (input.title !== undefined) set.title = input.title;
    if (input.data !== undefined) set.data = input.data as unknown as Record<string, unknown>;
    if (input.locale !== undefined) set.locale = input.locale;
    if (input.visibility !== undefined) set.visibility = input.visibility;
    if (input.passwordHash !== undefined) set.passwordHash = input.passwordHash;
    if (input.slug !== undefined) set.slug = input.slug;

    const rows = await db.update(userCvs).set(set).where(eq(userCvs.id, id)).returning();
    return rows[0];
  },

  async delete(id: string): Promise<UserCv | undefined> {
    const rows = await db.delete(userCvs).where(eq(userCvs.id, id)).returning();
    return rows[0];
  },

  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(userCvs)
      .set({ viewCount: sql`${userCvs.viewCount} + 1` })
      .where(eq(userCvs.id, id));
  },
};
