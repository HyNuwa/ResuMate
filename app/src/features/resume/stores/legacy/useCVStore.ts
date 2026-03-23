import { create } from 'zustand';
import type {
  Resume, ProfileData, ExperienceEntry, EducationEntry,
  CertificationEntry, LanguageEntry, SkillsData,
  TypographySettings, DesignSettings, PageSettings,
} from '@/shared/types/resume';
import { createEmptyResume } from '@/shared/types/resume';

const MAX_HISTORY = 30;

interface CVState {
  // ── State ──────────────────────────────────────────────────────
  resume: Resume;
  isNewCV: boolean;
  past: Resume[];    // undo stack
  future: Resume[];  // redo stack

  // ── Data actions ───────────────────────────────────────────────
  setResume:             (resume: Resume) => void;
  updateProfile:         (profile: ProfileData) => void;
  updateExperience:      (experience: ExperienceEntry[]) => void;
  updateEducation:       (education: EducationEntry[]) => void;
  updateSkills:          (skills: SkillsData) => void;
  updateCertifications:  (certifications: CertificationEntry[]) => void;
  updateLanguages:       (languages: LanguageEntry[]) => void;
  updateTitle:           (title: string) => void;
  updateTypography:      (typography: TypographySettings) => void;
  updateDesign:          (design: DesignSettings) => void;
  updatePage:            (page: PageSettings) => void;

  // ── Category actions ───────────────────────────────────────────
  addCategory:       (categoryId: string) => void;
  removeCategory:    (categoryId: string) => void;
  reorderCategories: (newOrder: string[]) => void;

  // ── History actions ────────────────────────────────────────────
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  resetToNew: () => void;
}

/** Push current resume onto past stack before every mutation */
function pushHistory(state: CVState, newResume: Resume): Partial<CVState> {
  const past = [...state.past, state.resume].slice(-MAX_HISTORY);
  return { resume: newResume, past, future: [] };
}

export const useCVStore = create<CVState>((set, get) => ({
  resume:  createEmptyResume(),
  isNewCV: true,
  past:    [],
  future:  [],

  // ── Set full resume (no history) ──────────────────────────────
  setResume: (resume) => set({ resume, isNewCV: false, past: [], future: [] }),

  // ── Data mutations (all push history) ────────────────────────
  updateProfile: (profile) =>
    set((s) => pushHistory(s, { ...s.resume, profile })),

  updateExperience: (experience) =>
    set((s) => pushHistory(s, { ...s.resume, experience })),

  updateEducation: (education) =>
    set((s) => pushHistory(s, { ...s.resume, education })),

  updateSkills: (skills) =>
    set((s) => pushHistory(s, { ...s.resume, skills })),

  updateCertifications: (certifications) =>
    set((s) => pushHistory(s, { ...s.resume, certifications })),

  updateLanguages: (languages) =>
    set((s) => pushHistory(s, { ...s.resume, languages })),

  updateTitle: (title) =>
    set((s) => pushHistory(s, {
      ...s.resume,
      metadata: { ...s.resume.metadata, title },
    })),

  updateTypography: (typography) =>
    set((s) => pushHistory(s, {
      ...s.resume,
      metadata: { ...s.resume.metadata, typography },
    })),

  updateDesign: (design) =>
    set((s) => pushHistory(s, {
      ...s.resume,
      metadata: { ...s.resume.metadata, design },
    })),

  updatePage: (page) =>
    set((s) => pushHistory(s, {
      ...s.resume,
      metadata: { ...s.resume.metadata, page },
    })),

  // ── Category mutations ────────────────────────────────────────
  addCategory: (categoryId) =>
    set((s) => pushHistory(s, {
      ...s.resume,
      enabledCategories: [...s.resume.enabledCategories, categoryId],
    })),

  removeCategory: (categoryId) =>
    set((s) => pushHistory(s, {
      ...s.resume,
      enabledCategories: s.resume.enabledCategories.filter((id) => id !== categoryId),
    })),

  reorderCategories: (newOrder) =>
    set((s) => pushHistory(s, {
      ...s.resume,
      enabledCategories: newOrder,
    })),

  // ── History ───────────────────────────────────────────────────
  undo: () => set((s) => {
    if (s.past.length === 0) return s;
    const prev = s.past[s.past.length - 1];
    return {
      resume:  prev,
      past:    s.past.slice(0, -1),
      future:  [s.resume, ...s.future].slice(0, MAX_HISTORY),
    };
  }),

  redo: () => set((s) => {
    if (s.future.length === 0) return s;
    const next = s.future[0];
    return {
      resume:  next,
      past:    [...s.past, s.resume].slice(-MAX_HISTORY),
      future:  s.future.slice(1),
    };
  }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  resetToNew: () => set({ resume: createEmptyResume(), isNewCV: true, past: [], future: [] }),
}));

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectResume            = (s: CVState) => s.resume;
export const selectProfile           = (s: CVState) => s.resume.profile;
export const selectExperience        = (s: CVState) => s.resume.experience;
export const selectEducation         = (s: CVState) => s.resume.education;
export const selectSkills            = (s: CVState) => s.resume.skills;
export const selectCertifications    = (s: CVState) => s.resume.certifications;
export const selectLanguages         = (s: CVState) => s.resume.languages;
export const selectTitle             = (s: CVState) => s.resume.metadata.title;
export const selectEnabledCategories = (s: CVState) => s.resume.enabledCategories;
export const selectIsNewCV           = (s: CVState) => s.isNewCV;
export const selectMetadata          = (s: CVState) => s.resume.metadata;
export const selectCanUndo           = (s: CVState) => s.past.length > 0;
export const selectCanRedo           = (s: CVState) => s.future.length > 0;
