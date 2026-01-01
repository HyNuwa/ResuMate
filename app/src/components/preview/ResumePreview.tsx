import type { Resume } from '../../types/resume';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface ResumePreviewProps {
  resume: Resume;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    // Increased timeout to ensure DOM is fully settled before printing
    // This prevents progressive rendering issues in the PDF
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  // Render resume directly from data (no markdown conversion)
  const renderResume = () => {
    return (
      <div className="preview-document">
        {/* Name */}
        {resume.profile.fullName && (
          <h1>{resume.profile.fullName.toUpperCase()}</h1>
        )}

        {/* Contact Info */}
        {(resume.profile.email || resume.profile.phone || resume.profile.location) && (
          <div className="contact-info">
            {resume.profile.email && <span>{resume.profile.email}</span>}
            {resume.profile.phone && <span>{resume.profile.phone}</span>}
            {resume.profile.location && <span>{resume.profile.location}</span>}
          </div>
        )}

        {/* Summary */}
        {resume.profile.summary && (
          <div className="summary">
            <p>{resume.profile.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="section">
            <h2>EXPERIENCE</h2>
            {resume.experience.map(exp => (
              <div key={exp.id} className="entry">
                <div className="entry-header">
                  <strong>{exp.position}</strong> — {exp.company} — {exp.location}
                </div>
                <div className="entry-dates">
                  <em>{exp.startDate} - {exp.endDate}</em>
                </div>
                {exp.description && (
                  <div className="entry-description" dangerouslySetInnerHTML={{ 
                    __html: renderSimpleMarkdown(exp.description) 
                  }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="section">
            <h2>EDUCATION</h2>
            {resume.education.map(edu => (
              <div key={edu.id} className="entry">
                <div className="entry-header">
                  <strong>{edu.institution}</strong> — {edu.location}
                </div>
                <div className="entry-subheader">
                  <em>{edu.degree}</em> | {edu.graduationDate}
                </div>
                {edu.gpa && <div>GPA: {edu.gpa}</div>}
                {edu.achievements && (
                  <div className="entry-description" dangerouslySetInnerHTML={{ 
                    __html: renderSimpleMarkdown(edu.achievements) 
                  }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills.categories.length > 0 && (
          <div className="section">
            <h2>SKILLS</h2>
            {resume.skills.categories.map(category => (
              category.items.length > 0 && (
                <div key={category.id} className="skill-category">
                  <strong>{category.name}:</strong> {category.items.join(', ')}
                </div>
              )
            ))}
          </div>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <div className="section">
            <h2>CERTIFICATIONS</h2>
            {resume.certifications.map(cert => (
              <div key={cert.id} className="entry">
                <div className="entry-header">
                  <strong>{cert.name}</strong> — {cert.issuer}
                </div>
                <div className="entry-dates">
                  <em>
                    {cert.issueDate}
                    {cert.expirationDate && ` - ${cert.expirationDate}`}
                  </em>
                </div>
                {cert.credentialId && (
                  <div>Credential ID: {cert.credentialId}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {resume.languages && resume.languages.length > 0 && (
          <div className="section">
            <h2>LANGUAGES</h2>
            <div className="languages-grid">
              {resume.languages.map(lang => (
                <div key={lang.id} className="language-entry">
                  <strong>{lang.language}:</strong> {lang.proficiency}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Simple markdown renderer for bullets and bold
  const renderSimpleMarkdown = (text: string) => {
    let html = text;
    
    // Convert **bold** to <strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convert bullets - split by lines
    const lines = html.split('\n');
    let result = '';
    let inList = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        if (!inList) {
          result += '<ul>';
          inList = true;
        }
        result += `<li>${trimmed.substring(2)}</li>`;
      } else {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        if (trimmed) {
          result += trimmed + '<br>';
        }
      }
    }
    
    if (inList) result += '</ul>';
    
    return result;
  };

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h3>Preview</h3>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="export-button"
        >
          <Download size={16} />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>
      
      <div className="preview-content">
        {renderResume()}
      </div>
    </div>
  );
}
