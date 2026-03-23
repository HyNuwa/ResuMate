import { useState } from 'react';
import type { ExperienceEntry } from '@/shared/types/resume';
import { createExperienceEntry } from '@/shared/types/resume';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { MonthYearPicker } from '@/components/common/MonthYearPicker';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExperienceSectionProps {
  entries: ExperienceEntry[];
  onChange: (entries: ExperienceEntry[]) => void;
}

export function ExperienceSection({ entries, onChange }: ExperienceSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(entries.map(e => e.id)));

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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
    setExpandedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
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
                    <Label>Position</Label>
                    <Input value={entry.position} onChange={(e) => handleChange(entry.id, 'position', e.target.value)} placeholder="Software Engineer" />
                  </div>
                  <div className="form-field">
                    <Label>Company</Label>
                    <Input value={entry.company} onChange={(e) => handleChange(entry.id, 'company', e.target.value)} placeholder="TechCorp" />
                  </div>
                  <div className="form-field">
                    <Label>Location</Label>
                    <Input value={entry.location} onChange={(e) => handleChange(entry.id, 'location', e.target.value)} placeholder="San Francisco, CA" />
                  </div>
                  <div className="form-field">
                    <Label>Start Date</Label>
                    <MonthYearPicker value={entry.startDate} onChange={(v) => handleChange(entry.id, 'startDate', v)} />
                  </div>
                  <div className="form-field">
                    <Label>End Date</Label>
                    <MonthYearPicker value={entry.endDate} onChange={(v) => handleChange(entry.id, 'endDate', v)} allowPresent presentLabel="Present" />
                  </div>
                </div>
                <div className="form-field full-width mt-3">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={entry.description}
                    onChange={(html) => handleChange(entry.id, 'description', html)}
                    placeholder="Describe your key responsibilities and achievements..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full mt-3 gap-2 border-dashed">
        <Plus size={15} /> Add Experience
      </Button>
    </div>
  );
}
