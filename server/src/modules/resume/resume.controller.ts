import { type Request, type Response, type NextFunction } from 'express';
import { resumeService, NotFoundError, ValidationError } from './resume.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function handleError(err: unknown, next: NextFunction): void {
  if (err instanceof NotFoundError || err instanceof ValidationError) {
    next(err);
  } else {
    next(err);
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/resumes
 * List all CVs (optionally filtered by userId from session in future phases)
 */
export async function listResumes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.query['userId'] as string | undefined;
    const cvs = await resumeService.getAll(userId);
    res.json({ success: true, data: cvs });
  } catch (err) {
    handleError(err, next);
  }
}

/**
 * GET /api/resumes/:id
 */
export async function getResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const cv = await resumeService.getById(id);
    res.json({ success: true, data: cv });
  } catch (err) {
    handleError(err, next);
  }
}

/**
 * POST /api/resumes
 * Create a new CV. Body: { title?, data?, locale? }
 */
export async function createResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, data, locale } = req.body as {
      title?: string;
      data?: unknown;
      locale?: string;
    };

    const cv = await resumeService.create({ title, data, locale });
    res.status(201).json({ success: true, data: cv });
  } catch (err) {
    handleError(err, next);
  }
}

/**
 * PUT /api/resumes/:id
 * Full update / upsert. Body: { title?, data?, locale? }
 */
export async function updateResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const { title, data, locale } = req.body as {
      title?: string;
      data?: unknown;
      locale?: string;
    };

    const { cv, created } = await resumeService.upsert(id, { title, data, locale });

    res.status(created ? 201 : 200).json({ success: true, data: cv, created });
  } catch (err) {
    handleError(err, next);
  }
}

/**
 * PATCH /api/resumes/:id
 * Partial update.
 */
export async function patchResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const { title, data, locale } = req.body as {
      title?: string;
      data?: unknown;
      locale?: string;
    };

    const cv = await resumeService.update(id, { title, data, locale });
    res.json({ success: true, data: cv });
  } catch (err) {
    handleError(err, next);
  }
}

/**
 * DELETE /api/resumes/:id
 */
export async function deleteResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    await resumeService.delete(id);
    res.json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    handleError(err, next);
  }
}
