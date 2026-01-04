import { useState } from 'react';
import type { SkillsData, SkillCategory } from '../../types/resume';
import { createSkillCategory } from '../../types/resume';
import { Plus, X, Trash2 } from 'lucide-react';

interface SkillsSectionProps {
  data: SkillsData;
  onChange: (data: SkillsData) => void;
}

export function SkillsSection({ data, onChange }: SkillsSectionProps) {
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});

  // Helper to reduce repetition of onChange({ categories: ... })
  const updateCategories = (updater: (categories: SkillCategory[]) => SkillCategory[]) => {
    onChange({ categories: updater(data.categories) });
  };

  const handleAddCategory = () => {
    const newCategory = createSkillCategory();
    updateCategories(categories => [...categories, newCategory]);
  };

  const handleRemoveCategory = (id: string) => {
    updateCategories(categories => categories.filter(c => c.id !== id));
  };

  const handleCategoryNameChange = (id: string, name: string) => {
    updateCategories(categories =>
      categories.map(c => c.id === id ? { ...c, name } : c)
    );
  };

  const handleAddSkill = (categoryId: string) => {
    const skillName = newSkillInputs[categoryId]?.trim();
    if (!skillName) return;

    updateCategories(categories =>
      categories.map(c =>
        c.id === categoryId
          ? { ...c, items: [...c.items, skillName] }
          : c
      )
    );

    setNewSkillInputs(prev => ({ ...prev, [categoryId]: '' }));
  };

  const handleRemoveSkill = (categoryId: string, skillIndex: number) => {
    updateCategories(categories =>
      categories.map(c =>
        c.id === categoryId
          ? { ...c, items: c.items.filter((_, i) => i !== skillIndex) }
          : c
      )
    );
  };

  const handleNewSkillInputChange = (categoryId: string, value: string) => {
    setNewSkillInputs(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(categoryId);
    }
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Skills</h2>
      
      <div className="skills-categories">
        {data.categories.map((category) => (
          <div key={category.id} className="skill-category">
            <div className="category-header">
              <input
                type="text"
                value={category.name}
                onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                placeholder="Category name (e.g., Programming Languages)"
                className="input category-name-input"
              />
              <button
                type="button"
                onClick={() => handleRemoveCategory(category.id)}
                className="btn-icon"
                title="Remove category"
              >
                <Trash2 size={16} />
              </button>
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
                    <X size={14} />
                  </button>
                </div>
              ))}

              <div className="add-skill-input">
                <input
                  type="text"
                  value={newSkillInputs[category.id] || ''}
                  onChange={(e) => handleNewSkillInputChange(category.id, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, category.id)}
                  placeholder="Add skill..."
                  className="input skill-input"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(category.id)}
                  className="btn-icon-small"
                  title="Add skill"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={handleAddCategory} className="btn-add">
        <Plus size={16} />
        Add Skill Category
      </button>
    </div>
  );
}
