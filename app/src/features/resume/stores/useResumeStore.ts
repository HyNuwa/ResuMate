import { create } from 'zustand';
import { createEmptyResume, type ResumeData } from '@resumate/schema';
import { useEditorHistoryStore } from './useHistoryStore';

interface ResumeState {
  resume: ResumeData;
  isNewCV: boolean;

  // ── Data actions ────────────────────────────────────────────
  setResume:           (resume: ResumeData) => void;
  resetToNew:          () => void;

  // Basics
  updateBasics:         (basics: ResumeData['basics']) => void;

  // Summary
  updateSummary:        (summary: ResumeData['summary']) => void;

  // Sections — individual section setters
  updateProfiles:       (items: ResumeData['sections']['profiles']['items']) => void;
  updateExperience:     (items: ResumeData['sections']['experience']['items']) => void;
  updateEducation:      (items: ResumeData['sections']['education']['items']) => void;
  updateProjects:       (items: ResumeData['sections']['projects']['items']) => void;
  updateSkills:         (items: ResumeData['sections']['skills']['items']) => void;
  updateLanguages:      (items: ResumeData['sections']['languages']['items']) => void;
  updateInterests:      (items: ResumeData['sections']['interests']['items']) => void;
  updateAwards:         (items: ResumeData['sections']['awards']['items']) => void;
  updateCertifications: (items: ResumeData['sections']['certifications']['items']) => void;
  updatePublications:   (items: ResumeData['sections']['publications']['items']) => void;
  updateVolunteer:     (items: ResumeData['sections']['volunteer']['items']) => void;
  updateReferences:     (items: ResumeData['sections']['references']['items']) => void;

  // Metadata
  updateTitle:          (title: string) => void;
  updateMetadata:       (patch: Partial<ResumeData['metadata']>) => void;
}

function snapshot(resume: ResumeData): string {
  return JSON.stringify(resume);
}

export const useResumeStore = create<ResumeState>()((set) => ({
  resume: createEmptyResume(),
  isNewCV: true,

  // ── Load resume (no history push) ───────────────────────────
  setResume: (resume) =>
    set({ resume, isNewCV: false }),

  resetToNew: () =>
    set({ resume: createEmptyResume(), isNewCV: true }),

  // ── Helpers ──────────────────────────────────────────────────
  updateBasics: (basics) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, basics } };
    }),

  updateSummary: (summary) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, summary } };
    }),

  updateProfiles: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, profiles: { ...s.resume.sections.profiles, items } } } };
    }),

  updateExperience: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, experience: { ...s.resume.sections.experience, items } } } };
    }),

  updateEducation: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, education: { ...s.resume.sections.education, items } } } };
    }),

  updateProjects: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, projects: { ...s.resume.sections.projects, items } } } };
    }),

  updateSkills: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, skills: { ...s.resume.sections.skills, items } } } };
    }),

  updateLanguages: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, languages: { ...s.resume.sections.languages, items } } } };
    }),

  updateInterests: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, interests: { ...s.resume.sections.interests, items } } } };
    }),

  updateAwards: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, awards: { ...s.resume.sections.awards, items } } } };
    }),

  updateCertifications: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, certifications: { ...s.resume.sections.certifications, items } } } };
    }),

  updatePublications: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, publications: { ...s.resume.sections.publications, items } } } };
    }),

  updateVolunteer: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, volunteer: { ...s.resume.sections.volunteer, items } } } };
    }),

  updateReferences: (items) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, sections: { ...s.resume.sections, references: { ...s.resume.sections.references, items } } } };
    }),

  updateTitle: (title) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, metadata: { ...s.resume.metadata, title } } };
    }),

  updateMetadata: (patch) =>
    set((s) => {
      useEditorHistoryStore.getState().push(snapshot(s.resume));
      return { resume: { ...s.resume, metadata: { ...s.resume.metadata, ...patch } } };
    }),
}));

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectResume          = (s: ResumeState) => s.resume;
export const selectBasics         = (s: ResumeState) => s.resume.basics;
export const selectSummary        = (s: ResumeState) => s.resume.summary;
export const selectSections       = (s: ResumeState) => s.resume.sections;
export const selectMetadata       = (s: ResumeState) => s.resume.metadata;
export const selectIsNewCV        = (s: ResumeState) => s.isNewCV;
export const selectCustomSections = (s: ResumeState) => s.resume.customSections;
