import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import type { Resume } from '../types/resume';
import { createEmptyResume } from '../types/resume';
import { ProfileSection } from './sections/ProfileSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { ResumePreview } from './preview/ResumePreview';
import { ResumeMetrics } from './preview/ResumeMetrics';
import { CategorySelector } from './CategorySelector';
import '../styles/form-editor.css';

interface FormBasedEditorProps {
  initialCV?: Resume;
  onSave?: (cv: Resume) => void;
}

export function FormBasedEditor({ initialCV, onSave }: FormBasedEditorProps) {
  const [resume, setResume] = useState<Resume>(initialCV || createEmptyResume());
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    if (resume.metadata.id) {
      const cvs = JSON.parse(localStorage.getItem('resumate_cvs') || '[]');
      const existingIndex = cvs.findIndex((cv: Resume) => cv.metadata.id === resume.metadata.id);
      
      const updatedResume = {
        ...resume,
        metadata: {
          ...resume.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      if (existingIndex >= 0) {
        cvs[existingIndex] = updatedResume;
      } else {
        cvs.push(updatedResume);
      }

      localStorage.setItem('resumate_cvs', JSON.stringify(cvs));
      onSave?.(updatedResume);
    }
  }, [resume, onSave]);

  const handleAddCategory = (categoryId: string) => {
    setResume({
      ...resume,
      enabledCategories: [...resume.enabledCategories, categoryId]
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    setResume({
      ...resume,
      enabledCategories: resume.enabledCategories.filter(id => id !== categoryId)
    });
  };

  const handleTitleChange = (title: string) => {
    setResume({
      ...resume,
      metadata: { ...resume.metadata, title }
    });
  };

  return (
    <div className="form-editor-container">
      {/* Left Panel - Form */}
      <div className="form-panel">
        <div className="form-scroll">
          {/* CV Title Input */}
          <div className="cv-title-section">
            <input
              type="text"
              className="cv-title-input"
              value={resume.metadata.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Título del CV"
            />
          </div>

          {/* Profile Section - Always visible */}
          <ProfileSection
            data={resume.profile}
            onChange={(profile) => setResume({ ...resume, profile })}
          />

          {/* Experience Section - Conditional */}
          {resume.enabledCategories.includes('experience') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => handleRemoveCategory('experience')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <ExperienceSection
                entries={resume.experience}
                onChange={(experience) => setResume({ ...resume, experience })}
              />
            </div>
          )}

          {/* Education Section - Conditional */}
          {resume.enabledCategories.includes('education') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => handleRemoveCategory('education')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <EducationSection
                entries={resume.education}
                onChange={(education) => setResume({ ...resume, education })}
              />
            </div>
          )}

          {/* Skills Section - Conditional */}
          {resume.enabledCategories.includes('skills') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => handleRemoveCategory('skills')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <SkillsSection
                data={resume.skills}
                onChange={(skills) => setResume({ ...resume, skills })}
              />
            </div>
          )}

          {/* Certifications Section - Conditional */}
          {resume.enabledCategories.includes('certifications') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => handleRemoveCategory('certifications')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <CertificationsSection
                entries={resume.certifications}
                onChange={(certifications) => setResume({ ...resume, certifications })}
              />
            </div>
          )}

          {/* Languages Section - Conditional */}
          {resume.enabledCategories.includes('languages') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => handleRemoveCategory('languages')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <LanguagesSection
                entries={resume.languages}
                onChange={(languages) => setResume({ ...resume, languages })}
              />
            </div>
          )}

          {/* Add Category Button */}
          <button
            type="button"
            className="add-category-button"
            onClick={() => setShowCategorySelector(true)}
          >
            <Plus size={18} />
            Añadir Categoría
          </button>
        </div>
      </div>

      {/* Middle Panel - Preview */}
      <ResumePreview resume={resume} />

      {/* Right Panel - Metrics */}
      <ResumeMetrics score={43} />

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <CategorySelector
          enabledCategories={resume.enabledCategories}
          onAddCategory={handleAddCategory}
          onClose={() => setShowCategorySelector(false)}
        />
      )}
    </div>
  );
}

