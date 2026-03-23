import { memo } from 'react';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import type { Resume } from '@/shared/types/resume';
import type { TemplateId } from '@/templates';

interface ResumePreviewProps {
  resume: Resume;
  enabledCategories: string[];
}

// ── Per-template style maps ────────────────────────────────────────────────
// Typography/color values are intentionally left to CSS vars set by the parent
// wrapper (FormBasedEditor injects --preview-* vars on the A4 paper div).
// Anything fixed per template (layout, alignment, spacing) stays hardcoded.

const TEMPLATE_STYLES: Record<TemplateId, {
  doc: string;          // wrapper: layout + spacing (NO font/color — those come from vars)
  name: string;
  contact: string;
  sectionHeading: string;
  entryRow: string;
  entryDates: string;
}> = {
  'jake-ryan': {
    doc:            'leading-[var(--preview-lh-body)]',
    name:           'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] uppercase text-center tracking-widest text-[color:var(--preview-color-text)] mb-0.5',
    contact:        'flex flex-wrap justify-center gap-x-2 text-[11px] text-gray-500 text-center mb-2',
    sectionHeading: 'text-[11px] font-bold uppercase tracking-widest border-b pb-0.5 mt-3 mb-1 border-[color:var(--preview-color-primary)] text-[color:var(--preview-color-primary)]',
    entryRow:       'flex justify-between items-baseline gap-2',
    entryDates:     'text-[11px] text-gray-500 whitespace-nowrap shrink-0',
  },
  'harvard': {
    doc:            'leading-[var(--preview-lh-body)]',
    name:           'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] text-center tracking-wide text-[color:var(--preview-color-text)] mb-1',
    contact:        'flex flex-wrap justify-center gap-x-3 text-[11px] text-gray-500 mb-4',
    sectionHeading: 'text-[12px] font-semibold uppercase tracking-widest border-b-2 pb-0.5 mt-4 mb-2 border-[color:var(--preview-color-primary)] text-[color:var(--preview-color-primary)]',
    entryRow:       'flex justify-between items-start gap-2',
    entryDates:     'text-[11px] italic text-gray-500 whitespace-nowrap shrink-0',
  },
  'mit': {
    doc:            'leading-[var(--preview-lh-body)]',
    name:           'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] text-left tracking-tight text-[color:var(--preview-color-text)] mb-0',
    contact:        'flex flex-wrap gap-x-2 text-[10px] text-gray-600 border-b border-gray-400 pb-1 mb-2',
    sectionHeading: 'text-[11px] font-bold uppercase bg-gray-100 px-1 mt-3 mb-1 text-[color:var(--preview-color-primary)]',
    entryRow:       'flex justify-between items-baseline gap-2',
    entryDates:     'text-[10px] text-gray-500 whitespace-nowrap shrink-0',
  },
  'stanford': {
    doc:            'leading-[var(--preview-lh-body)]',
    name:           'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] text-left text-[color:var(--preview-color-text)] mb-1 border-b-4 border-[color:var(--preview-color-primary)] pb-1 inline-block',
    contact:        'flex flex-wrap gap-x-3 text-[11px] text-gray-500 mb-4',
    sectionHeading: 'text-[12px] font-bold uppercase border-b pb-0.5 mt-4 mb-1 border-[color:var(--preview-color-primary)] text-[color:var(--preview-color-primary)]',
    entryRow:       'flex justify-between items-baseline gap-2',
    entryDates:     'text-[11px] italic text-gray-500 whitespace-nowrap shrink-0',
  },
};

// ── Markdown renderer — markdown-it (CommonMark) + DOMPurify (XSS-safe) ──────
// Singleton: initialised once at module level, not per-render.
const md = new MarkdownIt({
  html:    false,  // never pass raw HTML through — prevents injection
  breaks:  true,   // \n → <br> (matches previous behaviour)
  linkify: true,   // auto-link URLs
});

function renderMarkdown(text: string): string {
  const rawHtml = md.render(text ?? '');
  return DOMPurify.sanitize(rawHtml);
}

// ── Component ──────────────────────────────────────────────────────────────

export const ResumePreview = memo(function ResumePreview({ resume, enabledCategories }: ResumePreviewProps) {
  const templateId = (resume.metadata.template ?? 'jake-ryan') as TemplateId;
  const isCompact  = resume.metadata.layoutVariant === 'compact';
  const ts         = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES['jake-ryan'];

  // Body text classes — driven by CSS vars from parent
  const bodyText  = 'text-[length:var(--preview-size-body)] font-[family-name:var(--preview-font-body)] font-[var(--preview-weight-body)] text-[color:var(--preview-color-text)]';
  const entryGap  = isCompact ? 'mb-px' : 'mb-2';
  const sectionClass = isCompact
    ? ts.sectionHeading.replace('mt-3', 'mt-1.5').replace('mt-4', 'mt-2')
    : ts.sectionHeading;
  const descClass = isCompact ? 'text-[10px] mt-0' : 'text-[12px] mt-0.5';

  return (
    <div className={`${ts.doc} ${bodyText}`}>

      {/* Name */}
      {resume.profile.fullName && (
        <div className="mb-1">
          <span className={ts.name}>{resume.profile.fullName.toUpperCase()}</span>
        </div>
      )}

      {/* Contact */}
      {(resume.profile.email || resume.profile.phone || resume.profile.location || resume.profile.linkedin) && (
        <div className={ts.contact}>
          {resume.profile.email    && <span>{resume.profile.email}</span>}
          {resume.profile.phone    && <span>{resume.profile.phone}</span>}
          {resume.profile.location && <span>{resume.profile.location}</span>}
          {resume.profile.linkedin && <span>{resume.profile.linkedin}</span>}
        </div>
      )}

      {/* Summary */}
      {resume.profile.summary && (
        <div
          className="mb-2 text-[length:var(--preview-size-body)]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(resume.profile.summary) }}
        />
      )}

      {/* Experience */}
      {enabledCategories.includes('experience') && resume.experience.length > 0 && (
        <div>
          <h2 className={sectionClass}>Experience</h2>
          {resume.experience.map(exp => (
            <div key={exp.id} className={entryGap}>
              <div className={ts.entryRow}>
                <strong>{exp.position} — {exp.company}{exp.location ? ` — ${exp.location}` : ''}</strong>
                <span className={ts.entryDates}>{exp.startDate} - {exp.endDate}</span>
              </div>
              {exp.description && (
                <div className={descClass} dangerouslySetInnerHTML={{ __html: renderMarkdown(exp.description) }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {enabledCategories.includes('education') && resume.education.length > 0 && (
        <div>
          <h2 className={sectionClass}>Education</h2>
          {resume.education.map(edu => (
            <div key={edu.id} className={entryGap}>
              <div className={ts.entryRow}>
                <strong>{edu.institution}{edu.location ? ` — ${edu.location}` : ''}</strong>
                <span className={ts.entryDates}>{edu.graduationDate}</span>
              </div>
              <div className="text-[12px] italic">{edu.degree}</div>
              {edu.gpa && <div className="text-[11px] text-gray-500">GPA: {edu.gpa}</div>}
              {edu.achievements && (
                <div className={descClass} dangerouslySetInnerHTML={{ __html: renderMarkdown(edu.achievements) }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {enabledCategories.includes('skills') && resume.skills.categories.length > 0 && (
        <div>
          <h2 className={sectionClass}>Skills</h2>
          {resume.skills.categories.map(cat =>
            cat.items.length > 0 && (
              <div key={cat.id} className="text-[length:var(--preview-size-body)]">
                <strong>{cat.name}:</strong> {cat.items.join(', ')}
              </div>
            )
          )}
        </div>
      )}

      {/* Certifications */}
      {enabledCategories.includes('certifications') && resume.certifications?.length > 0 && (
        <div>
          <h2 className={sectionClass}>Certifications</h2>
          {resume.certifications.map(cert => (
            <div key={cert.id} className="mb-1">
              <div className={ts.entryRow}>
                <strong>{cert.name} — {cert.issuer}</strong>
                <span className={ts.entryDates}>{cert.issueDate}{cert.expirationDate && ` - ${cert.expirationDate}`}</span>
              </div>
              {cert.credentialId && <div className="text-[11px] text-gray-500">ID: {cert.credentialId}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {enabledCategories.includes('languages') && resume.languages?.length > 0 && (
        <div>
          <h2 className={sectionClass}>Languages</h2>
          <div className="flex flex-wrap gap-x-4">
            {resume.languages.map(lang => (
              <div key={lang.id} className="text-[length:var(--preview-size-body)]">
                <strong>{lang.language}:</strong> {lang.proficiency}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
