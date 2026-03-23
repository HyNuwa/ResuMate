import { resumeRepository, type CreateResumeInput, type UpdateResumeInput } from './resume.repository';
import { validateResumeData, createEmptyResume, type ResumeData } from '@resumate/schema';
import type { UserCv } from '../../db/schema';

// ── Service errors ────────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  status = 404;
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  status = 400;
  constructor(details: string) {
    super(`Validation failed: ${details}`);
    this.name = 'ValidationError';
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Business logic for resume CRUD.
 *
 * - Validates incoming data with AJV before persisting
 * - Fills defaults for new empty CVs
 * - Delegates all DB access to resumeRepository
 */
export const resumeService = {
  async getAll(userId?: string): Promise<UserCv[]> {
    return resumeRepository.findAll(userId);
  },

  async getById(id: string): Promise<UserCv> {
    const cv = await resumeRepository.findById(id);
    if (!cv) throw new NotFoundError('Resume', id);
    return cv;
  },

  async getBySlug(slug: string): Promise<UserCv> {
    const cv = await resumeRepository.findBySlug(slug);
    if (!cv) throw new NotFoundError('Resume', slug);
    return cv;
  },

  async create(input: {
    title?: string;
    data?: unknown;
    userId?: string;
    locale?: string;
  }): Promise<UserCv> {
    // Start from a valid empty resume, then merge caller-supplied data
    const base: ResumeData = createEmptyResume();
    const raw = input.data ?? base;

    const validation = validateResumeData(raw);
    if (!validation.valid) {
      throw new ValidationError(
        validation.errors.map((e) => `${e.instancePath}: ${e.message}`).join('; '),
      );
    }

    return resumeRepository.create({
      title: input.title ?? 'Untitled CV',
      data: validation.data,
      userId: input.userId,
      locale: input.locale ?? 'en',
    });
  },

  async update(id: string, input: { title?: string; data?: unknown; locale?: string }): Promise<UserCv> {
    // Verify it exists
    const existing = await resumeRepository.findById(id);
    if (!existing) throw new NotFoundError('Resume', id);

    const patch: UpdateResumeInput = {};

    if (input.title !== undefined) patch.title = input.title;
    if (input.locale !== undefined) patch.locale = input.locale;

    if (input.data !== undefined) {
      const validation = validateResumeData(input.data);
      if (!validation.valid) {
        throw new ValidationError(
          validation.errors.map((e) => `${e.instancePath}: ${e.message}`).join('; '),
        );
      }
      patch.data = validation.data;
    }

    const updated = await resumeRepository.update(id, patch);
    if (!updated) throw new NotFoundError('Resume', id);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const deleted = await resumeRepository.delete(id);
    if (!deleted) throw new NotFoundError('Resume', id);
  },

  async upsert(id: string | undefined, input: {
    title?: string;
    data?: unknown;
    userId?: string;
    locale?: string;
  }): Promise<{ cv: UserCv; created: boolean }> {
    if (id) {
      const existing = await resumeRepository.findById(id);
      if (existing) {
        const cv = await this.update(id, input);
        return { cv, created: false };
      }
    }
    const cv = await this.create(input);
    return { cv, created: true };
  },
};
