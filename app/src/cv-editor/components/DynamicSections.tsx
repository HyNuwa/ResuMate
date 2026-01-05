import { X } from 'lucide-react';
import type { Resume, ExperienceEntry, EducationEntry, SkillsData, CertificationEntry, LanguageEntry } from '@/shared/types/resume';
import { ProfileSection } from '../sections/ProfileSection';
import { ExperienceSection } from '../sections/ExperienceSection';
import { EducationSection } from '../sections/EducationSection';
import { SkillsSection } from '../sections/SkillsSection';
import { CertificationsSection } from '../sections/CertificationsSection';
import { LanguagesSection } from '../sections/LanguagesSection';

interface DynamicSectionsProps {
  // Data
  profile: Resume['profile'];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillsData;
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  enabledCategories: string[];
  
  // Handlers
  onProfileChange: (profile: Resume['profile']) => void;
  onExperienceChange: (experience: ExperienceEntry[]) => void;
  onEducationChange: (education: EducationEntry[]) => void;
  onSkillsChange: (skills: SkillsData) => void;
  onCertificationsChange: (certifications: CertificationEntry[]) => void;
  onLanguagesChange: (languages: LanguageEntry[]) => void;
  onRemoveCategory: (categoryId: string) => void;
}

/**
 * Renders conditional sections based on enabled categories
 * Each section can be removed independently
 */
export function DynamicSections({
  profile,
  experience,
  education,
  skills,
  certifications,
  languages,
  enabledCategories,
  onProfileChange,
  onExperienceChange,
  onEducationChange,
  onSkillsChange,
  onCertificationsChange,
  onLanguagesChange,
  onRemoveCategory,
}: DynamicSectionsProps) {
  return (
    <>
      {/* Profile Section - Always visible */}
      <ProfileSection data={profile} onChange={onProfileChange} />

      {/* Experience Section - Conditional */}
      {enabledCategories.includes('experience') && (
        <div className="section-wrapper">
          <button
            className="remove-category-btn"
            onClick={() => onRemoveCategory('experience')}
            title="Eliminar sección"
          >
            <X size={14} />
          </button>
          <ExperienceSection entries={experience} onChange={onExperienceChange} />
        </div>
      )}

      {/* Education Section - Conditional */}
      {enabledCategories.includes('education') && (
        <div className="section-wrapper">
          <button
            className="remove-category-btn"
            onClick={() => onRemoveCategory('education')}
            title="Eliminar sección"
          >
            <X size={14} />
          </button>
          <EducationSection entries={education} onChange={onEducationChange} />
        </div>
      )}

      {/* Skills Section - Conditional */}
      {enabledCategories.includes('skills') && (
        <div className="section-wrapper">
          <button
            className="remove-category-btn"
            onClick={() => onRemoveCategory('skills')}
            title="Eliminar sección"
          >
            <X size={14} />
          </button>
          <SkillsSection data={skills} onChange={onSkillsChange} />
        </div>
      )}

      {/* Certifications Section - Conditional */}
      {enabledCategories.includes('certifications') && (
        <div className="section-wrapper">
          <button
            className="remove-category-btn"
            onClick={() => onRemoveCategory('certifications')}
            title="Eliminar sección"
          >
            <X size={14} />
          </button>
          <CertificationsSection entries={certifications} onChange={onCertificationsChange} />
        </div>
      )}

      {/* Languages Section - Conditional */}
      {enabledCategories.includes('languages') && (
        <div className="section-wrapper">
          <button
            className="remove-category-btn"
            onClick={() => onRemoveCategory('languages')}
            title="Eliminar sección"
          >
            <X size={14} />
          </button>
          <LanguagesSection entries={languages} onChange={onLanguagesChange} />
        </div>
      )}
    </>
  );
}
