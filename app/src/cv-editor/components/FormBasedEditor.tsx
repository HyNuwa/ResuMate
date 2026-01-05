import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Resume } from '../../shared/types/resume';
import { CategorySelector } from './CategorySelector';
import { FormEditorHeader } from './FormEditorHeader';
import { DynamicSections } from './DynamicSections';
import { ResumePreview } from './preview/ResumePreview';
import { ResumeMetrics } from './preview/ResumeMetrics';
import { 
  useCVStore, 
  selectResume, 
  selectProfile, 
  selectExperience, 
  selectEducation, 
  selectSkills, 
  selectCertifications, 
  selectLanguages, 
  selectTitle, 
  selectEnabledCategories 
} from '../store/useCVStore';
import { useFormAutoSave } from '../../shared/hooks/useFormAutoSave';
import { useCreateCV, useUpdateCV } from '../../shared/hooks/useQueryCVs';
import { logger } from '../../shared/utils/logger';
import '../../styles/form-editor.css';

interface FormBasedEditorProps {
  initialCV?: Resume;
  onSave?: (cv: Resume) => void;
  isExistingCV?: boolean;
}

/**
 * Main CV Editor Component
 * Orchestrates the form-based editing interface with auto-save functionality
 */
export function FormBasedEditor({ initialCV, onSave, isExistingCV = false }: FormBasedEditorProps) {
  // Zustand store selectors
  const resume = useCVStore(selectResume);
  const profile = useCVStore(selectProfile);
  const experience = useCVStore(selectExperience);
  const education = useCVStore(selectEducation);
  const skills = useCVStore(selectSkills);
  const certifications = useCVStore(selectCertifications);
  const languages = useCVStore(selectLanguages);
  const title = useCVStore(selectTitle);
  const enabledCategories = useCVStore(selectEnabledCategories);

  // Zustand store actions
  const setResume = useCVStore((state) => state.setResume);
  const updateProfile = useCVStore((state) => state.updateProfile);
  const updateExperience = useCVStore((state) => state.updateExperience);
  const updateEducation = useCVStore((state) => state.updateEducation);
  const updateSkills = useCVStore((state) => state.updateSkills);
  const updateCertifications = useCVStore((state) => state.updateCertifications);
  const updateLanguages = useCVStore((state) => state.updateLanguages);
  const updateTitle = useCVStore((state) => state.updateTitle);
  const addCategory = useCVStore((state) => state.addCategory);
  const removeCategory = useCVStore((state) => state.removeCategory);

  // Mutations
  const createCVMutation = useCreateCV();
  const updateCVMutation = useUpdateCV();

  // Local state
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(isExistingCV);

  // Initialize resume from initialCV
  useEffect(() => {
    logger.debug('📋 useEffect [initialCV] triggered');
    logger.debug('  initialCV ID:', initialCV?.metadata.id);
    logger.debug('  current resume ID:', resume.metadata.id);
    logger.debug('  isExistingCV prop:', isExistingCV);
    
    if (initialCV && initialCV.metadata.id !== resume.metadata.id) {
      logger.debug('  ⚠️ RESETTING STORE - Different CV ID detected');
      logger.debug('  New CV data:', initialCV);
      setResume(initialCV);
      setHasBeenSaved(isExistingCV);
      logger.debug('  Set hasBeenSaved to:', isExistingCV);
    } else {
      logger.debug('  ✅ No reset - Same CV ID or no initialCV');
    }
  }, [initialCV?.metadata.id, resume.metadata.id, setResume, initialCV, isExistingCV]);

  // Auto-save functionality
  const { handleChange, saveStatus } = useFormAutoSave({
    saveFn: async () => {
      const currentStore = useCVStore.getState();
      const currentResume = currentStore.resume;

      logger.debug('🔵 AUTO-SAVE TRIGGERED');
      logger.debug('  hasBeenSaved:', hasBeenSaved);
      logger.debug('  CV ID:', currentResume.metadata.id);
      logger.debug('  CV Title:', currentResume.metadata.title);
      logger.debug('  Profile data:', currentResume.profile);

      try {
        if (!hasBeenSaved) {
          logger.debug('  → Creating NEW CV in database...');
          const created = await createCVMutation.mutateAsync(currentResume);
          logger.debug('  ✅ CV created in DB:', created);
          setHasBeenSaved(true);
        } else {
          logger.debug('  → Updating EXISTING CV in database...');
          await updateCVMutation.mutateAsync({
            id: currentResume.metadata.id,
            data: currentResume,
          });
          logger.debug('  ✅ CV updated in DB');
        }

        onSave?.(currentResume);
      } catch (error) {
        logger.error('❌ Save failed:', error);
        throw error;
      }
    },
    delay: 3000,
    enabled: !!resume.metadata.id,
  });

  // Category handlers
  const handleAddCategory = (categoryId: string) => {
    handleChange(() => addCategory(categoryId));
    setShowCategorySelector(false);
  };

  const handleRemoveCategory = (categoryId: string) => {
    handleChange(() => removeCategory(categoryId));
  };

  return (
    <div className="form-editor-container">
      {/* Left Panel - Form */}
      <div className="form-panel">
        <div className="form-scroll">
          {/* Header with Title and Save Indicator */}
          <FormEditorHeader
            title={title}
            onTitleChange={(newTitle) => handleChange(() => updateTitle(newTitle))}
            saveStatus={saveStatus}
          />

          {/* Dynamic Sections */}
          <DynamicSections
            profile={profile}
            experience={experience}
            education={education}
            skills={skills}
            certifications={certifications}
            languages={languages}
            enabledCategories={enabledCategories}
            onProfileChange={(newProfile) => handleChange(() => updateProfile(newProfile))}
            onExperienceChange={(newExperience) => handleChange(() => updateExperience(newExperience))}
            onEducationChange={(newEducation) => handleChange(() => updateEducation(newEducation))}
            onSkillsChange={(newSkills) => handleChange(() => updateSkills(newSkills))}
            onCertificationsChange={(newCerts) => handleChange(() => updateCertifications(newCerts))}
            onLanguagesChange={(newLangs) => handleChange(() => updateLanguages(newLangs))}
            onRemoveCategory={handleRemoveCategory}
          />

          {/* Add Category Button */}
          <button
            className="add-category-btn"
            onClick={() => setShowCategorySelector(true)}
          >
            <Plus size={18} />
            <span>Agregar Sección</span>
          </button>
        </div>
      </div>

      {/* Right Panels - Preview and Metrics */}
      <ResumePreview resume={resume} />
      <ResumeMetrics score={43} />

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <CategorySelector
          enabledCategories={enabledCategories}
          onAddCategory={handleAddCategory}
          onClose={() => setShowCategorySelector(false)}
        />
      )}
    </div>
  );
}
