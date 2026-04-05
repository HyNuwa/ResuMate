import { useState } from 'react';
import type { SkillItem } from '@resumate/schema';
import { createSkillItem } from '@resumate/schema';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SkillsSectionProps {
  data: SkillItem[];
  onChange: (data: SkillItem[]) => void;
}

export function SkillsSection({ data, onChange }: SkillsSectionProps) {
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState<Record<string, string>>({});

  const handleAddSkill = () => {
    const name = newSkillInput.trim();
    if (!name) return;
    onChange([...data, createSkillItem({ name, keywords: [] })]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (id: string) => {
    onChange(data.filter(s => s.id !== id));
  };

  const handleSkillNameChange = (id: string, name: string) =>
    onChange(data.map(s => s.id === id ? { ...s, name } : s));

  const handleAddKeyword = (skillId: string) => {
    const keyword = newKeywordInput[skillId]?.trim();
    if (!keyword) return;
    onChange(data.map(s =>
      s.id === skillId ? { ...s, keywords: [...s.keywords, keyword] } : s
    ));
    setNewKeywordInput(prev => ({ ...prev, [skillId]: '' }));
  };

  const handleRemoveKeyword = (skillId: string, keywordIndex: number) =>
    onChange(data.map(s =>
      s.id === skillId ? { ...s, keywords: s.keywords.filter((_, i) => i !== keywordIndex) } : s
    ));

  return (
    <div className="cv-section">
      <h2 className="section-title">Skills</h2>

      <div className="skills-list space-y-3">
        {data.map((skill) => (
          <div key={skill.id} className="skill-item border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={skill.name}
                onChange={(e) => handleSkillNameChange(skill.id, e.target.value)}
                placeholder="Skill name (e.g., Programming Languages)"
                className="flex-1"
              />
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                onClick={() => handleRemoveSkill(skill.id)}
                title="Remove skill"
              >
                <Trash2 size={15} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {skill.keywords.map((keyword, index) => (
                <div key={index} className="skill-chip">
                  <span>{keyword}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(skill.id, index)}
                    className="skill-remove"
                    title="Remove keyword"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5">
              <Input
                value={newKeywordInput[skill.id] || ''}
                onChange={(e) => setNewKeywordInput(prev => ({ ...prev, [skill.id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(skill.id); } }}
                placeholder="Add keyword and press Enter..."
                className="flex-1 h-8 text-sm"
              />
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => handleAddKeyword(skill.id)}
                title="Add keyword"
              >
                <Plus size={15} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <Input
          value={newSkillInput}
          onChange={(e) => setNewSkillInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
          placeholder="Add a new skill and press Enter..."
          className="flex-1 h-9 text-sm"
        />
        <Button variant="outline" onClick={handleAddSkill} className="gap-1.5">
          <Plus size={15} /> Add
        </Button>
      </div>
    </div>
  );
}
