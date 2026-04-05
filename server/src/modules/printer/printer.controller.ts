import { type Request, type Response, type NextFunction } from 'express';
import { printerService } from './printer.service';
import { NotFoundError, ValidationError } from '../resume/resume.service';

function handleError(err: unknown, next: NextFunction): void {
  if (err instanceof NotFoundError || err instanceof ValidationError) {
    next(err);
  } else {
    next(err);
  }
}

export async function generatePDF(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const resumeId = req.params['id'] as string;

    if (!resumeId) {
      throw new ValidationError('Resume ID is required');
    }

    const { format = 'a4' } = req.body as { format?: 'a4' | 'letter' } ?? {};

    const result = await printerService.printResumeAsPDF(resumeId, { format });

    const filename = `resume-${resumeId}.pdf`;

    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': result.buffer.length,
    });

    res.send(result.buffer);
  } catch (err) {
    handleError(err, next);
  }
}