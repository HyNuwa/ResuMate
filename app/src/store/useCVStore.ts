import { create } from 'zustand';
import type { Resume, ProfileData, ExperienceEntry, EducationEntry, CertificationEntry, LanguageEntry, SkillsData } from '../types/resume';
import { createEmptyResume } from '../types/resume';

interface CVState {
  // State
  resume: Resume;
  isNewCV: boolean;

  // Actions
  setResume: (resume: Resume) => void;
  updateProfile: (profile: ProfileData) => void;
  updateExperience: (experience: ExperienceEntry[]) => void;
  updateEducation: (education: EducationEntry[]) => void;
  updateSkills: (skills: SkillsData) => void;
  updateCertifications: (certifications: CertificationEntry[]) => void;
  updateLanguages: (languages: LanguageEntry[]) => void;
  updateTitle: (title: string) => void;
  addCategory: (categoryId: string) => void;
  removeCategory: (categoryId: string) => void;
  resetToNew: () => void;
}

export const useCVStore = create<CVState>((set) => ({
  // Initial state
  resume: createEmptyResume(),
  isNewCV: true,

  // Actions
  setResume: (resume) => set({ resume, isNewCV: false }),

  updateProfile: (profile) =>
    set((state) => ({
      resume: { ...state.resume, profile },
    })),

  updateExperience: (experience) =>
    set((state) => ({
      resume: { ...state.resume, experience },
    })),

  updateEducation: (education) =>
    set((state) => ({
      resume: { ...state.resume, education },
    })),

  updateSkills: (skills) =>
    set((state) => ({
      resume: { ...state.resume, skills },
    })),

  updateCertifications: (certifications) =>
    set((state) => ({
      resume: { ...state.resume, certifications },
    })),

  updateLanguages: (languages) =>
    set((state) => ({
      resume: { ...state.resume, languages },
    })),

  updateTitle: (title) =>
    set((state) => ({
      resume: {
        ...state.resume,
        metadata: { ...state.resume.metadata, title },
      },
    })),

  addCategory: (categoryId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        enabledCategories: [...state.resume.enabledCategories, categoryId],
      },
    })),

  removeCategory: (categoryId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        enabledCategories: state.resume.enabledCategories.filter(
          (id) => id !== categoryId
        ),
      },
    })),

  resetToNew: () =>
    set({
      resume: createEmptyResume(),
      isNewCV: true,
    }),
}));

// Selectors for granular subscriptions (prevents unnecessary re-renders)
export const selectResume = (state: CVState) => state.resume;
export const selectProfile = (state: CVState) => state.resume.profile;
export const selectExperience = (state: CVState) => state.resume.experience;
export const selectEducation = (state: CVState) => state.resume.education;
export const selectSkills = (state: CVState) => state.resume.skills;
export const selectCertifications = (state: CVState) => state.resume.certifications;
export const selectLanguages = (state: CVState) => state.resume.languages;
export const selectTitle = (state: CVState) => state.resume.metadata.title;
export const selectEnabledCategories = (state: CVState) => state.resume.enabledCategories;
export const selectIsNewCV = (state: CVState) => state.isNewCV;
