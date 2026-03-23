// ─── Typography / Design / Page settings ────────────────────────────────────

export interface TypographyStyle {
  fontFamily: string;
  fontWeight: string;
  fontSize: number;    // px
  lineHeight: number;  // unitless multiplier, e.g. 1.5
}

export interface TypographySettings {
  body: TypographyStyle;
  heading: TypographyStyle;
}

export interface DesignSettings {
  primary: string;     // hex
  text: string;
  background: string;
}

export type PageFormat = 'A4' | 'Letter' | 'Custom';

export interface PageSettings {
  language: string;    // BCP-47, e.g. 'es', 'en'
  format: PageFormat;
  marginH: number;     // mm
  marginV: number;     // mm
  spacingH: number;    // px (column gap)
  spacingV: number;    // px (section gap)
}

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  body:    { fontFamily: 'Inter, sans-serif', fontWeight: '400', fontSize: 13, lineHeight: 1.5 },
  heading: { fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: 15, lineHeight: 1.3 },
};

export const DEFAULT_DESIGN: DesignSettings = {
  primary:    '#2563EB',
  text:       '#111827',
  background: '#FFFFFF',
};

export const DEFAULT_PAGE: PageSettings = {
  language: 'es',
  format:   'A4',
  marginH:  16,
  marginV:  16,
  spacingH: 0,
  spacingV: 12,
};

// ─── CV Metadata ─────────────────────────────────────────────────────────────

export interface CVMetadata {
  id: string;
  title: string;
  template?: string;
  layoutVariant?: 'standard' | 'compact';
  createdAt: string;
  updatedAt: string;
  typography?: TypographySettings;
  design?: DesignSettings;
  page?: PageSettings;
}

// Resume data structure
export interface Resume {
  metadata: CVMetadata;
  profile: ProfileData;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillsData;
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  enabledCategories: string[]; // Tracks which sections are visible
}

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  summary: string; // Markdown formatted
}

export interface ExperienceEntry {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string; // Format: "MM/YYYY"
  endDate: string; // "Present" or "MM/YYYY"
  description: string; // Markdown formatted with bullets
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  location: string;
  graduationDate: string; // Format: "Month YYYY"
  gpa?: string;
  achievements?: string; // Markdown formatted
}

export interface SkillsData {
  categories: SkillCategory[];
}

export interface SkillCategory {
  id: string;
  name: string;
  items: string[]; // Array of skill names
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate: string; // Format: "Month YYYY"
  expirationDate?: string; // Optional, Format: "Month YYYY"
  credentialId?: string; // Optional credential/license number
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

// Default empty resume
export const createEmptyResume = (): Resume => ({
  metadata: createCVMetadata(),
  profile: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: {
    categories: [],
  },
  certifications: [],
  languages: [],
  enabledCategories: ['profile'], // Start with only profile visible
});

// Create new experience entry
export const createExperienceEntry = (): ExperienceEntry => ({
  id: crypto.randomUUID(),
  position: '',
  company: '',
  location: '',
  startDate: '',
  endDate: 'Present',
  description: '',
});

// Create new education entry
export const createEducationEntry = (): EducationEntry => ({
  id: crypto.randomUUID(),
  institution: '',
  degree: '',
  location: '',
  graduationDate: '',
  gpa: '',
  achievements: '',
});

// Create new skill category
export const createSkillCategory = (): SkillCategory => ({
  id: crypto.randomUUID(),
  name: '',
  items: [],
});

// Create CV metadata
export const createCVMetadata = (title: string = 'Untitled CV', template?: string): CVMetadata => ({
  id: crypto.randomUUID(),
  title,
  template,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Create new certification entry
export const createCertificationEntry = (): CertificationEntry => ({
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  issueDate: '',
  expirationDate: '',
  credentialId: '',
});

// Create new language entry
export const createLanguageEntry = (): LanguageEntry => ({
  id: crypto.randomUUID(),
  language: '',
  proficiency: 'Professional',
});
