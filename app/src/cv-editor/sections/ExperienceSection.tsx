import { useState } from 'react';
import type { ExperienceEntry } from '@/shared/types/resume';
import { createExperienceEntry } from '@/shared/types/resume';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';

interface ExperienceSectionProps {
  entries: ExperienceEntry[];
  onChange: (entries: ExperienceEntry[]) => void;
}

export function ExperienceSection({ entries, onChange }: ExperienceSectionProps) {
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
    const newEntry = createExperienceEntry();
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

  const handleChange = (id: string, field: keyof ExperienceEntry, value: string) => {
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Experience</h2>
      
      <div className="entries-list">
        {entries.map((entry, index) => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header" onClick={() => toggleExpanded(entry.id)}>
              <div className="entry-title">
                {entry.position || entry.company || `Experience ${index + 1}`}
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
                    <label>Position</label>
                    <input
                      type="text"
                      value={entry.position}
                      onChange={(e) => handleChange(entry.id, 'position', e.target.value)}
                      placeholder="Software Engineer"
                      className="input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Company</label>
                    <input
                      type="text"
                      value={entry.company}
                      onChange={(e) => handleChange(entry.id, 'company', e.target.value)}
                      placeholder="TechCorp"
                      className="input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Location</label>
                    <input
                      type="text"
                      value={entry.location}
                      onChange={(e) => handleChange(entry.id, 'location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Start Date</label>
                    <input
                      type="text"
                      value={entry.startDate}
                      onChange={(e) => handleChange(entry.id, 'startDate', e.target.value)}
                      placeholder="01/2023"
                      className="input"
                    />
                  </div>

                  <div className="form-field">
                    <label>End Date</label>
                    <input
                      type="text"
                      value={entry.endDate}
                      onChange={(e) => handleChange(entry.id, 'endDate', e.target.value)}
                      placeholder="Present"
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-field full-width">
                  <label>Description</label>
                  <RichTextEditor
                    value={entry.description}
                    onChange={(markdown) => handleChange(entry.id, 'description', markdown)}
                    placeholder="- Developed features that improved user engagement by 25%&#10;- Led team of 5 engineers..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={handleAdd} className="btn-add">
        <Plus size={16} />
        Add Experience
      </button>
    </div>
  );
}
