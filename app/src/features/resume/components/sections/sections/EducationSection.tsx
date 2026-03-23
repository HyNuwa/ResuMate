import { useState } from 'react';
import type { EducationItem } from '@resumate/schema';
import { createEducationItem } from '@resumate/schema';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EducationSectionProps {
  entries: EducationItem[];
  onChange: (entries: EducationItem[]) => void;
}

export function EducationSection({ entries, onChange }: EducationSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(entries.map(e => e.id)));

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const newEntry = createEducationItem();
    onChange([...entries, newEntry]);
    setExpandedIds(prev => new Set([...prev, newEntry.id]));
  };

  const handleRemove = (id: string) => {
    onChange(entries.filter(e => e.id !== id));
    setExpandedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleChange = (id: string, field: keyof EducationItem, value: string) =>
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e));

  return (
    <div className="cv-section">
      <h2 className="section-title">Education</h2>

      <div className="entries-list">
        {entries.map((entry, index) => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header" onClick={() => toggleExpanded(entry.id)}>
              <div className="entry-title">
                {entry.school || entry.degree || `Education ${index + 1}`}
              </div>
              <div className="entry-actions">
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  onClick={(e) => { e.stopPropagation(); handleRemove(entry.id); }}
                  title="Remove"
                >
                  <Trash2 size={15} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                  {expandedIds.has(entry.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </Button>
              </div>
            </div>

            {expandedIds.has(entry.id) && (
              <div className="entry-content">
                <div className="form-grid">
                  <div className="form-field">
                    <Label>Institution</Label>
                    <Input value={entry.school} onChange={(e) => handleChange(entry.id, 'school', e.target.value)} placeholder="Harvard University" />
                  </div>
                  <div className="form-field">
                    <Label>Degree</Label>
                    <Input value={entry.degree} onChange={(e) => handleChange(entry.id, 'degree', e.target.value)} placeholder="Bachelor of Science in Computer Science" />
                  </div>
                  <div className="form-field">
                    <Label>Location</Label>
                    <Input value={entry.location} onChange={(e) => handleChange(entry.id, 'location', e.target.value)} placeholder="Cambridge, MA" />
                  </div>
                  <div className="form-field">
                    <Label>Period</Label>
                    <Input value={entry.period} onChange={(e) => handleChange(entry.id, 'period', e.target.value)} placeholder="2018 - 2022" />
                  </div>
                  <div className="form-field">
                    <Label>Grade (optional)</Label>
                    <Input value={entry.grade || ''} onChange={(e) => handleChange(entry.id, 'grade', e.target.value)} placeholder="3.9/4.0" />
                  </div>
                </div>
                <div className="form-field full-width mt-3">
                  <Label>Description (optional)</Label>
                  <RichTextEditor
                    value={entry.description || ''}
                    onChange={(html) => handleChange(entry.id, 'description', html)}
                    placeholder="Achievements, honors, relevant coursework..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full mt-3 gap-2 border-dashed">
        <Plus size={15} /> Add Education
      </Button>
    </div>
  );
}
