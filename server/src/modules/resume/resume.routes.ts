import { Router } from 'express';
import {
  listResumes,
  getResume,
  createResume,
  updateResume,
  patchResume,
  deleteResume,
} from './resume.controller';
import { validateResumeBody } from '../../middleware/validation';

/**
 * Resume CRUD routes — mounted at /api/resumes in app.ts
 *
 * GET    /api/resumes          → list all (or filtered by userId)
 * POST   /api/resumes          → create new CV (AJV-validated)
 * GET    /api/resumes/:id      → get by ID
 * PUT    /api/resumes/:id      → full update / upsert (AJV-validated)
 * PATCH  /api/resumes/:id      → partial update
 * DELETE /api/resumes/:id      → delete
 */
const router = Router();

router.get('/', listResumes);
router.post('/', validateResumeBody, createResume);

router.get('/:id', getResume);
router.put('/:id', validateResumeBody, updateResume);
router.patch('/:id', patchResume);
router.delete('/:id', deleteResume);

export default router;
