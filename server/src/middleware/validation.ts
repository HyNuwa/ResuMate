import { type Request, type Response, type NextFunction } from 'express';
import { validateResumeData, formatValidationErrors } from '@resumate/schema';

/**
 * Express middleware that validates `req.body.data` against the ResumeData
 * JSON Schema using AJV.
 *
 * Use on any route that accepts a resume payload:
 *
 *   router.post('/cv', validateResumeBody, controller.create)
 *   router.put('/cv/:id', validateResumeBody, controller.update)
 */
export function validateResumeBody(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = validateResumeData(req.body?.data);

  if (!result.valid) {
    res.status(400).json({
      error: 'Invalid resume data',
      details: formatValidationErrors(result.errors),
      errors: result.errors,
    });
    return;
  }

  // Attach typed data to request so controllers don't need to re-cast
  req.body.validatedData = result.data;
  next();
}

/**
 * Variant that validates the entire `req.body` as ResumeData
 * (for endpoints that send the resume directly as the body, not nested).
 */
export function validateResumeBodyDirect(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = validateResumeData(req.body);

  if (!result.valid) {
    res.status(400).json({
      error: 'Invalid resume data',
      details: formatValidationErrors(result.errors),
      errors: result.errors,
    });
    return;
  }

  req.body = result.data;
  next();
}
