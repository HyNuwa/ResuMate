import { useState } from 'react';
import type { SkillsData, SkillCategory } from '@/shared/types/resume';
import { createSkillCategory } from '@/shared/types/resume';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SkillsSectionProps {
  data: SkillsData;
  onChange: (data: SkillsData) => void;
}

export function SkillsSection({ data, onChange }: SkillsSectionProps) {
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});

  const updateCategories = (updater: (cats: SkillCategory[]) => SkillCategory[]) => {
    onChange({ categories: updater(data.categories) });
  };

  const handleAddCategory = () => updateCategories(cats => [...cats, createSkillCategory()]);
  const handleRemoveCategory = (id: string) => updateCategories(cats => cats.filter(c => c.id !== id));
  const handleCategoryNameChange = (id: string, name: string) =>
    updateCategories(cats => cats.map(c => c.id === id ? { ...c, name } : c));

  const handleAddSkill = (categoryId: string) => {
    const skillName = newSkillInputs[categoryId]?.trim();
    if (!skillName) return;
    updateCategories(cats => cats.map(c =>
      c.id === categoryId ? { ...c, items: [...c.items, skillName] } : c
    ));
    setNewSkillInputs(prev => ({ ...prev, [categoryId]: '' }));
  };

  const handleRemoveSkill = (categoryId: string, skillIndex: number) =>
    updateCategories(cats => cats.map(c =>
      c.id === categoryId ? { ...c, items: c.items.filter((_, i) => i !== skillIndex) } : c
    ));

  return (
    <div className="cv-section">
      <h2 className="section-title">Skills</h2>

      <div className="skills-categories">
        {data.categories.map((category) => (
          <div key={category.id} className="skill-category">
            <div className="category-header">
              <Input
                value={category.name}
                onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                placeholder="Category name (e.g., Programming Languages)"
                className="category-name-input"
              />
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                onClick={() => handleRemoveCategory(category.id)}
                title="Remove category"
              >
                <Trash2 size={15} />
              </Button>
            </div>

            <div className="skills-list">
              {category.items.map((skill, index) => (
                <div key={index} className="skill-chip">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(category.id, index)}
                    className="skill-remove"
                    title="Remove skill"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}

              <div className="add-skill-input">
                <Input
                  value={newSkillInputs[category.id] || ''}
                  onChange={(e) => setNewSkillInputs(prev => ({ ...prev, [category.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(category.id); } }}
                  placeholder="Add skill and press Enter..."
                  className="skill-input h-8 text-sm"
                />
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleAddSkill(category.id)}
                  title="Add skill"
                >
                  <Plus size={15} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleAddCategory} className="w-full mt-3 gap-2 border-dashed">
        <Plus size={15} /> Add Skill Category
      </Button>
    </div>
  );
}
