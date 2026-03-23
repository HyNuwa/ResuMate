import AjvModule, { type ValidateFunction } from 'ajv';
import addFormatsModule from 'ajv-formats';
import addMetaSchema2020Src from 'ajv/dist/refs/json-schema-2020-12/index.js';

// ESM/CJS interop for all modules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ajv = (AjvModule as any).default ?? AjvModule;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFormats = (addFormatsModule as any).default ?? addFormatsModule;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addMetaSchema2020 = (addMetaSchema2020Src as any).default ?? addMetaSchema2020Src;
import resumeSchema from './resume.schema.json' with { type: 'json' };
import type { ResumeData } from './types.js';

// ── AJV instance (singleton) ──────────────────────────────────────────────────

const ajv = new Ajv({
  allErrors: true,       // collect all errors, not just the first
  strict: false,         // allow unknown keywords like $version
  useDefaults: true,     // fill in default values defined in the schema
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(addMetaSchema2020 as any).call(ajv);
addFormats(ajv);

/**
 * Compiled validator for the full ResumeData document.
 * Re-use this across requests to avoid re-compilation overhead.
 */
export const validateResume: ValidateFunction<ResumeData> = ajv.compile(
  resumeSchema,
) as ValidateFunction<ResumeData>;

// ── Validation result types ───────────────────────────────────────────────────

export interface ValidationSuccess {
  valid: true;
  data: ResumeData;
}

export interface ValidationFailure {
  valid: false;
  errors: NonNullable<typeof validateResume.errors>;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Validates an unknown value against the ResumeData JSON Schema.
 *
 * @example
 * const result = validateResumeData(req.body.data);
 * if (!result.valid) {
 *   return res.status(400).json({ error: 'Invalid resume data', details: result.errors });
 * }
 * // result.data is now typed as ResumeData
 */
export function validateResumeData(data: unknown): ValidationResult {
  const valid = validateResume(data);

  if (valid) {
    return { valid: true, data: data as ResumeData };
  }

  return {
    valid: false,
    errors: validateResume.errors ?? [],
  };
}

/**
 * Asserts that a value is valid ResumeData.
 * Throws a descriptive error if validation fails.
 *
 * Useful for seeding / migrations where you want a hard failure.
 */
export function assertValidResumeData(data: unknown, context = 'ResumeData'): ResumeData {
  const result = validateResumeData(data);

  if (!result.valid) {
    const messages = result.errors
      .map((e) => `  ${e.instancePath || '/'} — ${e.message}`)
      .join('\n');
    throw new Error(`[${context}] Schema validation failed:\n${messages}`);
  }

  return result.data;
}

/**
 * Returns a human-readable string summarising validation errors.
 */
export function formatValidationErrors(
  errors: NonNullable<typeof validateResume.errors>,
): string {
  return errors
    .map((e) => `${e.instancePath || '/'}: ${e.message}`)
    .join('; ');
}
