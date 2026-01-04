import { useEffect, useCallback, memo, useState } from 'react';
import { Plus, X, Save, Check, AlertCircle } from 'lucide-react';
import type { Resume } from '../types/resume';
import { ProfileSection } from './sections/ProfileSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { ResumePreview } from './preview/ResumePreview';
import { ResumeMetrics } from './preview/ResumeMetrics';
import { CategorySelector } from './CategorySelector';
import { useCVStore, selectResume, selectProfile, selectExperience, selectEducation, selectSkills, selectCertifications, selectLanguages, selectTitle, selectEnabledCategories } from '../store/useCVStore';
import { useFormAutoSave, type SaveStatus } from '../hooks/useFormAutoSave';
import { useCreateCV, useUpdateCV } from '../hooks/useQueryCVs';
import '../styles/form-editor.css';

interface FormBasedEditorProps {
  initialCV?: Resume;
  onSave?: (cv: Resume) => void;
  isExistingCV?: boolean; // If true, CV is loaded from DB; if false/undefined, it's a new CV
}

// Save indicator component (memoized)
const SaveIndicator = memo(({ status }: { status: SaveStatus }) => {
  if (status === 'idle') return null;

  return (
    <div className={`save-indicator save-indicator-${status}`}>
      {status === 'saving' && (
        <>
          <Save className="save-icon spin" size={16} />
          <span>Guardando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="save-icon" size={16} />
          <span>Guardado</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="save-icon" size={16} />
          <span>Error al guardar</span>
        </>
      )}
    </div>
  );
});

SaveIndicator.displayName = 'SaveIndicator';

export function FormBasedEditor({ initialCV, onSave, isExistingCV = false }: FormBasedEditorProps) {
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

  // Granular state selectors (prevents unnecessary re-renders)
  const resume = useCVStore(selectResume);
  const profile = useCVStore(selectProfile);
  const experience = useCVStore(selectExperience);
  const education = useCVStore(selectEducation);
  const skills = useCVStore(selectSkills);
  const certifications = useCVStore(selectCertifications);
  const languages = useCVStore(selectLanguages);
  const title = useCVStore(selectTitle);
  const enabledCategories = useCVStore(selectEnabledCategories);

  // Show category selector state (local to this component)
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // TanStack Query mutations
  const createCVMutation = useCreateCV();
  const updateCVMutation = useUpdateCV();

  // Update resume when initialCV changes (when navigating to different CV)
  // Only reset if the ID is different to avoid losing user changes
  useEffect(() => {
    console.log('📋 useEffect [initialCV] triggered');
    console.log('  initialCV ID:', initialCV?.metadata.id);
    console.log('  current resume ID:', resume.metadata.id);
    console.log('  isExistingCV prop:', isExistingCV);
    
    if (initialCV && initialCV.metadata.id !== resume.metadata.id) {
      console.log('  ⚠️ RESETTING STORE - Different CV ID detected');
      console.log('  New CV data:', initialCV);
      setResume(initialCV);
      // Reset hasBeenSaved based on whether we're loading an existing CV
      setHasBeenSaved(isExistingCV);
      console.log('  Set hasBeenSaved to:', isExistingCV);
    } else {
      console.log('  ✅ No reset - Same CV ID or no initialCV');
    }
  }, [initialCV?.metadata.id, resume.metadata.id, setResume, initialCV, isExistingCV]);

  // Track if this CV has been saved to the database at least once
  // Initialize based on isExistingCV prop
  const [hasBeenSaved, setHasBeenSaved] = useState(isExistingCV);

  // Event-driven auto-save (triggers only on user onChange)
  const { handleChange, saveStatus } = useFormAutoSave({
    saveFn: useCallback(async () => {
      // Get CURRENT state from store to avoid stale closure
      const currentStore = useCVStore.getState();
      const currentResume = currentStore.resume;

      console.log('🔵 AUTO-SAVE TRIGGERED');
      console.log('  hasBeenSaved:', hasBeenSaved);
      console.log('  CV ID:', currentResume.metadata.id);
      console.log('  CV Title:', currentResume.metadata.title);
      console.log('  Profile data:', currentResume.profile);
      console.log('  Full resume to save:', JSON.stringify(currentResume, null, 2));

      try {
        if (!hasBeenSaved) {
          console.log('  → Creating NEW CV in database...');
          // Create new CV using mutation
          const created = await createCVMutation.mutateAsync(currentResume);
          console.log('  ✅ CV created in DB:', created);
          // Mark as saved so future saves use update
          setHasBeenSaved(true);
        } else {
          console.log('  → Updating EXISTING CV in database...');
          // Update existing CV using mutation
          await updateCVMutation.mutateAsync({
            id: currentResume.metadata.id,
            data: currentResume,
          });
          console.log('  ✅ CV updated in DB');
        }

        // TanStack Query auto-invalida el cache
        onSave?.(currentResume);
      } catch (error) {
        console.error('❌ Save failed:', error);
        throw error; // Re-throw to let useFormAutoSave handle error status
      }
    }, [hasBeenSaved, createCVMutation, updateCVMutation, onSave]),
    delay: 3000,
    enabled: !!resume.metadata.id, // Only for CVs with ID (created or loaded)
  });

  return (
    <div className="form-editor-container">
      {/* Left Panel - Form */}
      <div className="form-panel">
        <div className="form-scroll">
          {/* CV Title Input with Save Indicator */}
          <div className="cv-title-section">
            <div className="cv-title-wrapper">
              <input
                type="text"
                className="cv-title-input"
                value={title}
                onChange={(e) => handleChange(() => updateTitle(e.target.value))}
                placeholder="Título del CV"
              />
              <SaveIndicator status={saveStatus} />
            </div>
          </div>

          {/* Profile Section - Always visible */}
          <ProfileSection
            data={profile}
            onChange={(newProfile) => handleChange(() => updateProfile(newProfile))}
          />

          {/* Experience Section - Conditional */}
          {enabledCategories.includes('experience') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => removeCategory('experience')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <ExperienceSection
                entries={experience}
                onChange={(newExperience) => handleChange(() => updateExperience(newExperience))}
              />
            </div>
          )}

          {/* Education Section - Conditional */}
          {enabledCategories.includes('education') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => removeCategory('education')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <EducationSection
                entries={education}
                onChange={(newEducation) => handleChange(() => updateEducation(newEducation))}
              />
            </div>
          )}

          {/* Skills Section - Conditional */}
          {enabledCategories.includes('skills') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => removeCategory('skills')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <SkillsSection
                data={skills}
                onChange={(newSkills) => handleChange(() => updateSkills(newSkills))}
              />
            </div>
          )}

          {/* Certifications Section - Conditional */}
          {enabledCategories.includes('certifications') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => removeCategory('certifications')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <CertificationsSection
                entries={certifications}
                onChange={(newCerts) => handleChange(() => updateCertifications(newCerts))}
              />
            </div>
          )}

          {/* Languages Section - Conditional */}
          {enabledCategories.includes('languages') && (
            <div className="section-wrapper">
              <button
                className="remove-category-btn"
                onClick={() => removeCategory('languages')}
                title="Eliminar sección"
              >
                <X size={14} />
              </button>
              <LanguagesSection
                entries={languages}
                onChange={(newLangs) => handleChange(() => updateLanguages(newLangs))}
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
          enabledCategories={enabledCategories}
          onAddCategory={addCategory}
          onClose={() => setShowCategorySelector(false)}
        />
      )}
    </div>
  );
}
