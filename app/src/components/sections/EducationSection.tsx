import { useState } from 'react';
import type { EducationEntry } from '../../types/resume';
import { createEducationEntry } from '../../types/resume';
import { RichTextEditor } from '../common/RichTextEditor';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

interface EducationSectionProps {
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
}

export function EducationSection({ entries, onChange }: EducationSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(entries.map(e => e.id)));

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = () => {
    const newEntry = createEducationEntry();
    onChange([...entries, newEntry]);
    setExpandedIds(prev => new Set([...prev, newEntry.id]));
  };

  const handleRemove = (id: string) => {
    onChange(entries.filter(e => e.id !== id));
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleChange = (id: string, field: keyof EducationEntry, value: string) => {
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Education</h2>
      
      <div className="entries-list">
        {entries.map((entry, index) => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header" onClick={() => toggleExpanded(entry.id)}>
              <div className="entry-title">
                {entry.institution || entry.degree || `Education ${index + 1}`}
              </div>
              <div className="entry-actions">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(entry.id);
                  }}
                  className="btn-icon"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
                <button type="button" className="btn-icon">
                  {expandedIds.has(entry.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {expandedIds.has(entry.id) && (
              <div className="entry-content">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Institution</label>
                    <input
                      type="text"
                      value={entry.institution}
                      onChange={(e) => handleChange(entry.id, 'institution', e.target.value)}
                      placeholder="Harvard University"
                      className="input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={entry.degree}
                      onChange={(e) => handleChange(entry.id, 'degree', e.target.value)}
                      placeholder="Bachelor of Science in Computer Science"
                      className="input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Location</label>
                    <input
                      type="text"
                      value={entry.location}
                      onChange={(e) => handleChange(entry.id, 'location', e.target.value)}
                      placeholder="Cambridge, MA"
                      className="input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Graduation Date</label>
                    <input
                      type="text"
                      value={entry.graduationDate}
                      onChange={(e) => handleChange(entry.id, 'graduationDate', e.target.value)}
                      placeholder="May 2024"
                      className="input"
                    />
                  </div>

                  <div className="form-field">
                    <label>GPA (optional)</label>
                    <input
                      type="text"
                      value={entry.gpa || ''}
                      onChange={(e) => handleChange(entry.id, 'gpa', e.target.value)}
                      placeholder="3.9/4.0"
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-field full-width">
                  <label>Achievements (optional)</label>
                  <RichTextEditor
                    value={entry.achievements || ''}
                    onChange={(markdown) => handleChange(entry.id, 'achievements', markdown)}
                    placeholder="- Dean's List all semesters&#10;- President of Computer Science Club"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={handleAdd} className="btn-add">
        <Plus size={16} />
        Add Education
      </button>
    </div>
  );
}
