import { type Request, type Response, type NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
  errors?: unknown;
}

/**
 * Global Express error handler.
 *
 * Must be registered AFTER all routes and other middleware.
 * Follows the Express 4/5 4-argument signature so Express identifies it
 * as an error handler.
 */
export function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const isDev = process.env.NODE_ENV !== 'production';

  const status = err.status ?? 500;

  const body = {
    error: isDev ? err.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(isDev && {
      stack: err.stack,
      code: err.code,
      details: err.errors,
    }),
  };

  console.error(`[error] ${req.method} ${req.originalUrl} — ${status}:`, err.message);
  if (isDev && err.stack) console.error(err.stack);

  res.status(status).json(body);
}

/**
 * 404 catch-all handler.
 * Register AFTER all routes but BEFORE the global error handler.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
}
