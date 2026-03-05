import { memo, useState } from 'react';
import { Download } from 'lucide-react';
import type { Resume } from '@/shared/types/resume';
import type { TemplateId } from '@/templates';

interface ResumePreviewProps {
  resume: Resume;
  enabledCategories: string[];
}

// Per-template Tailwind class maps — determines the visual style of the live preview
const TEMPLATE_STYLES: Record<TemplateId, {
  doc: string;
  name: string;
  contact: string;
  sectionHeading: string;
  entryRow: string;
  entryDates: string;
}> = {
  'jake-ryan': {
    doc: 'font-sans text-[13px] text-gray-900 leading-snug',
    name: 'text-xl font-bold uppercase text-center tracking-widest mb-0.5',
    contact: 'flex flex-wrap justify-center gap-x-2 text-[11px] text-gray-600 text-center mb-2',
    sectionHeading: 'text-[11px] font-bold uppercase tracking-widest border-b border-gray-900 pb-0.5 mt-3 mb-1',
    entryRow: 'flex justify-between items-baseline gap-2',
    entryDates: 'text-[11px] text-gray-500 whitespace-nowrap shrink-0',
  },
  'harvard': {
    doc: 'font-serif text-[13px] text-gray-800 leading-relaxed',
    name: 'text-2xl font-bold text-center tracking-wide mb-1',
    contact: 'flex flex-wrap justify-center gap-x-3 text-[11px] text-gray-500 mb-4',
    sectionHeading: 'text-[12px] font-semibold uppercase tracking-widest border-b-2 border-gray-700 pb-0.5 mt-4 mb-2',
    entryRow: 'flex justify-between items-start gap-2',
    entryDates: 'text-[11px] italic text-gray-500 whitespace-nowrap shrink-0',
  },
  'mit': {
    doc: 'font-mono text-[12px] text-gray-900 leading-tight',
    name: 'text-lg font-bold text-left tracking-tight mb-0',
    contact: 'flex flex-wrap gap-x-2 text-[10px] text-gray-600 border-b border-gray-400 pb-1 mb-2',
    sectionHeading: 'text-[11px] font-bold uppercase bg-gray-200 px-1 mt-3 mb-1',
    entryRow: 'flex justify-between items-baseline gap-2',
    entryDates: 'text-[10px] text-gray-500 whitespace-nowrap shrink-0',
  },
  'stanford': {
    doc: 'font-sans text-[13px] text-gray-800 leading-normal',
    name: 'text-2xl font-bold text-left text-gray-900 mb-1 border-b-4 border-red-600 pb-1 inline-block',
    contact: 'flex flex-wrap gap-x-3 text-[11px] text-gray-500 mb-4',
    sectionHeading: 'text-[12px] font-bold uppercase text-red-700 border-b border-red-200 pb-0.5 mt-4 mb-1',
    entryRow: 'flex justify-between items-baseline gap-2',
    entryDates: 'text-[11px] italic text-gray-500 whitespace-nowrap shrink-0',
  },
};

// Simple markdown renderer (bullets + bold + italic)
function renderSimpleMarkdown(text: string): string {
  let html = text;
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  let result = '';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (!inList) { result += '<ul class="list-disc list-inside ml-1">'; inList = true; }
      result += `<li>${trimmed.substring(2)}</li>`;
    } else {
      if (inList) { result += '</ul>'; inList = false; }
      if (trimmed) result += trimmed + '<br>';
    }
  }
  if (inList) result += '</ul>';
  return result;
}

export const ResumePreview = memo(function ResumePreview({ resume, enabledCategories }: ResumePreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const templateId = (resume.metadata.template ?? 'jake-ryan') as TemplateId;
  const isCompact = resume.metadata.layoutVariant === 'compact';
  const ts = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES['jake-ryan'];

  // Compute final classes — compact overrides base sizes/spacing
  const docClass = `preview-document ${ts.doc}${isCompact ? ' !leading-none !text-[11px]' : ''}`;
  const entryGap = isCompact ? 'mb-px' : 'mb-2';
  const sectionClass = isCompact ? ts.sectionHeading.replace('mt-3', 'mt-1.5').replace('mt-4', 'mt-2') : ts.sectionHeading;
  const descClass = isCompact ? 'text-[10px] mt-0' : 'text-[12px] mt-0.5';

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => { window.print(); setIsExporting(false); }, 500);
  };

  const renderResume = () => (
    <div className={docClass}>
      {/* Name */}
      {resume.profile.fullName && (
        <div className="mb-1">
          <span className={ts.name}>{resume.profile.fullName.toUpperCase()}</span>
        </div>
      )}

      {/* Contact */}
      {(resume.profile.email || resume.profile.phone || resume.profile.location || resume.profile.linkedin) && (
        <div className={ts.contact}>
          {resume.profile.email && <span>{resume.profile.email}</span>}
          {resume.profile.phone && <span>{resume.profile.phone}</span>}
          {resume.profile.location && <span>{resume.profile.location}</span>}
          {resume.profile.linkedin && <span>{resume.profile.linkedin}</span>}
        </div>
      )}

      {/* Summary */}
      {resume.profile.summary && (
        <div
          className="mb-2 text-[12px]"
          dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(resume.profile.summary) }}
        />
      )}

      {/* Experience */}
      {enabledCategories.includes('experience') && resume.experience.length > 0 && (
        <div className="section">
          <h2 className={sectionClass}>Experience</h2>
          {resume.experience.map(exp => (
            <div key={exp.id} className={entryGap}>
              <div className={ts.entryRow}>
                <strong>{exp.position} — {exp.company}{exp.location ? ` — ${exp.location}` : ''}</strong>
                <span className={ts.entryDates}>{exp.startDate} - {exp.endDate}</span>
              </div>
              {exp.description && (
                <div className={descClass} dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(exp.description) }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {enabledCategories.includes('education') && resume.education.length > 0 && (
        <div className="section">
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
                <div className={descClass} dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(edu.achievements) }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {enabledCategories.includes('skills') && resume.skills.categories.length > 0 && (
        <div className="section">
          <h2 className={sectionClass}>Skills</h2>
          {resume.skills.categories.map(cat =>
            cat.items.length > 0 && (
              <div key={cat.id} className="text-[12px]">
                <strong>{cat.name}:</strong> {cat.items.join(', ')}
              </div>
            )
          )}
        </div>
      )}

      {/* Certifications */}
      {enabledCategories.includes('certifications') && resume.certifications && resume.certifications.length > 0 && (
        <div className="section">
          <h2 className={ts.sectionHeading}>Certifications</h2>
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
      {enabledCategories.includes('languages') && resume.languages && resume.languages.length > 0 && (
        <div className="section">
          <h2 className={ts.sectionHeading}>Languages</h2>
          <div className="flex flex-wrap gap-x-4">
            {resume.languages.map(lang => (
              <div key={lang.id} className="text-[12px]">
                <strong>{lang.language}:</strong> {lang.proficiency}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h3>Preview</h3>
        <button onClick={handleExportPDF} disabled={isExporting} className="export-button">
          <Download size={16} />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>
      <div className="preview-content">
        {renderResume()}
      </div>
    </div>
  );
});
