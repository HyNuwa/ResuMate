import { memo } from 'react';
import DOMPurify from 'dompurify';
import type { ResumeData } from '@resumate/schema';
import type { TemplateId } from '@/templates';

interface ResumePreviewProps {
  resume: ResumeData;
}

const TEMPLATE_STYLES: Record<TemplateId, {
  doc: string;
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
    sectionHeading: 'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] uppercase tracking-widest border-b pb-0.5 mt-3 mb-1 border-[color:var(--preview-color-primary)] text-[color:var(--preview-color-primary)]',
    entryRow:       'flex justify-between items-baseline gap-2',
    entryDates:     'text-[11px] text-gray-500 whitespace-nowrap shrink-0',
  },
  'harvard': {
    doc:            'leading-[var(--preview-lh-body)]',
    name:           'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] text-center tracking-wide text-[color:var(--preview-color-text)] mb-1',
    contact:        'flex flex-wrap justify-center gap-x-3 text-[11px] text-gray-500 mb-4',
    sectionHeading: 'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] uppercase tracking-widest border-b-2 pb-0.5 mt-4 mb-2 border-[color:var(--preview-color-primary)] text-[color:var(--preview-color-primary)]',
    entryRow:       'flex justify-between items-start gap-2',
    entryDates:     'text-[11px] italic text-gray-500 whitespace-nowrap shrink-0',
  },
  'mit': {
    doc:            'leading-[var(--preview-lh-body)]',
    name:           'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] text-left tracking-tight text-[color:var(--preview-color-text)] mb-0',
    contact:        'flex flex-wrap gap-x-2 text-[10px] text-gray-600 border-b border-gray-400 pb-1 mb-2',
    sectionHeading: 'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] uppercase bg-gray-100 px-1 mt-3 mb-1 text-[color:var(--preview-color-primary)]',
    entryRow:       'flex justify-between items-baseline gap-2',
    entryDates:     'text-[10px] text-gray-500 whitespace-nowrap shrink-0',
  },
  'stanford': {
    doc:            'leading-[var(--preview-lh-body)]',
    name:           'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] text-left text-[color:var(--preview-color-text)] mb-1 border-b-4 border-[color:var(--preview-color-primary)] pb-1 inline-block',
    contact:        'flex flex-wrap gap-x-3 text-[11px] text-gray-500 mb-4',
    sectionHeading: 'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] uppercase border-b pb-0.5 mt-4 mb-1 border-[color:var(--preview-color-primary)] text-[color:var(--preview-color-primary)]',
    entryRow:       'flex justify-between items-baseline gap-2',
    entryDates:     'text-[11px] italic text-gray-500 whitespace-nowrap shrink-0',
  },
};

function sanitizeHtml(text: string): string {
  return DOMPurify.sanitize(text ?? '');
}

export const ResumePreview = memo(function ResumePreview({ resume }: ResumePreviewProps) {
  const templateId = (resume.metadata.template ?? 'harvard') as TemplateId;
  const ts         = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES['harvard'];

  const bodyText  = 'text-[length:var(--preview-size-body)] font-[family-name:var(--preview-font-body)] font-[var(--preview-weight-body)] text-[color:var(--preview-color-text)]';
  const entryGap  = 'mb-2';
  const sectionClass = ts.sectionHeading;
  const descClass = 'text-[12px] mt-0.5';

  const experience = resume.sections.experience;
  const education = resume.sections.education;
  const skills = resume.sections.skills;
  const certifications = resume.sections.certifications;
  const languages = resume.sections.languages;

  return (
    <div className={`${ts.doc} ${bodyText}`}>

      {resume.basics.name && (
        <div className="mb-1">
          <span className={ts.name}>{resume.basics.name.toUpperCase()}</span>
        </div>
      )}

      {(resume.basics.email || resume.basics.phone || resume.basics.location) && (
        <div className={ts.contact}>
          {resume.basics.email    && <span>{resume.basics.email}</span>}
          {resume.basics.phone    && <span>{resume.basics.phone}</span>}
          {resume.basics.location && <span>{resume.basics.location}</span>}
        </div>
      )}

      {resume.summary.content && (
        <div
          className="mb-2 text-[length:var(--preview-size-body)]"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(resume.summary.content) }}
        />
      )}

      {!experience.hidden && experience.items.length > 0 && (
        <div>
          <h2 className={sectionClass}>Experience</h2>
          {experience.items.map((exp) => (
            <div key={exp.id} className={entryGap}>
              <div className={ts.entryRow}>
                <strong>{exp.position} — {exp.company}{exp.location ? ` — ${exp.location}` : ''}</strong>
                <span className={ts.entryDates}>{exp.period}</span>
              </div>
              {exp.description && (
                <div className={descClass} dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.description) }} />
              )}
            </div>
          ))}
        </div>
      )}

      {!education.hidden && education.items.length > 0 && (
        <div>
          <h2 className={sectionClass}>Education</h2>
          {education.items.map((edu) => (
            <div key={edu.id} className={entryGap}>
              <div className={ts.entryRow}>
                <strong>{edu.school}{edu.location ? ` — ${edu.location}` : ''}</strong>
                <span className={ts.entryDates}>{edu.period}</span>
              </div>
              <div className="text-[12px] italic">{edu.degree}</div>
              {edu.grade && <div className="text-[11px] text-gray-500">Grade: {edu.grade}</div>}
              {edu.description && (
                <div className={descClass} dangerouslySetInnerHTML={{ __html: sanitizeHtml(edu.description) }} />
              )}
            </div>
          ))}
        </div>
      )}

      {!skills.hidden && skills.items.length > 0 && (
        <div>
          <h2 className={sectionClass}>Skills</h2>
          {skills.items.map((item) =>
            item.name && (
              <div key={item.id} className="text-[length:var(--preview-size-body)]">
                <strong>{item.name}:</strong> {item.keywords?.join(', ')}
              </div>
            )
          )}
        </div>
      )}

      {!certifications.hidden && certifications.items.length > 0 && (
        <div>
          <h2 className={sectionClass}>Certifications</h2>
          {certifications.items.map((cert) => (
            <div key={cert.id} className="mb-1">
              <div className={ts.entryRow}>
                <strong>{cert.title} — {cert.issuer}</strong>
                <span className={ts.entryDates}>{cert.date}</span>
              </div>
              {cert.description && <div className="text-[11px] text-gray-500">{cert.description}</div>}
            </div>
          ))}
        </div>
      )}

      {!languages.hidden && languages.items.length > 0 && (
        <div>
          <h2 className={sectionClass}>Languages</h2>
          <div className="flex flex-wrap gap-x-4">
            {languages.items.map((lang) => (
              <div key={lang.id} className="text-[length:var(--preview-size-body)]">
                <strong>{lang.language}:</strong> {lang.fluency}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
