import type {
  ResumeData,
  Basics,
  Picture,
  Summary,
  Sections,
  Metadata,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillItem,
  LanguageItem,
  InterestItem,
  AwardItem,
  CertificationItem,
  PublicationItem,
  VolunteerItem,
  ReferenceItem,
  ProfileItem,
} from './types.js';

// ── Primitive defaults ────────────────────────────────────────────────────────

export const DEFAULT_URL = { url: '', label: '' };

export const DEFAULT_ITEM_OPTIONS = { showLinkInTitle: false };

// ── Picture ───────────────────────────────────────────────────────────────────

export const DEFAULT_PICTURE: Picture = {
  hidden: true,
  url: '',
  size: 64,
  rotation: 0,
  aspectRatio: 1,
  borderRadius: 50,
  borderColor: '#000000',
  borderWidth: 0,
  shadowColor: '#000000',
  shadowWidth: 0,
};

// ── Basics ────────────────────────────────────────────────────────────────────

export const DEFAULT_BASICS: Basics = {
  name: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  website: { url: '', label: '' },
  customFields: [],
};

// ── Summary ───────────────────────────────────────────────────────────────────

export const DEFAULT_SUMMARY: Summary = {
  title: 'Summary',
  columns: 1,
  hidden: false,
  content: '',
};

// ── Section item factories ────────────────────────────────────────────────────

export function createProfileItem(overrides?: Partial<ProfileItem>): ProfileItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    icon: '',
    network: '',
    username: '',
    website: { url: '', label: '' },
    ...overrides,
  };
}

export function createExperienceItem(overrides?: Partial<ExperienceItem>): ExperienceItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    company: '',
    position: '',
    location: '',
    period: '',
    website: { url: '', label: '' },
    description: '',
    roles: [],
    ...overrides,
  };
}

export function createEducationItem(overrides?: Partial<EducationItem>): EducationItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    school: '',
    degree: '',
    area: '',
    grade: '',
    location: '',
    period: '',
    website: { url: '', label: '' },
    description: '',
    ...overrides,
  };
}

export function createProjectItem(overrides?: Partial<ProjectItem>): ProjectItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    name: '',
    period: '',
    website: { url: '', label: '' },
    description: '',
    ...overrides,
  };
}

export function createSkillItem(overrides?: Partial<SkillItem>): SkillItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    icon: '',
    name: '',
    proficiency: '',
    level: 0,
    keywords: [],
    ...overrides,
  };
}

export function createLanguageItem(overrides?: Partial<LanguageItem>): LanguageItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    language: '',
    fluency: '',
    level: 0,
    ...overrides,
  };
}

export function createInterestItem(overrides?: Partial<InterestItem>): InterestItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    icon: '',
    name: '',
    keywords: [],
    ...overrides,
  };
}

export function createAwardItem(overrides?: Partial<AwardItem>): AwardItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    title: '',
    awarder: '',
    date: '',
    website: { url: '', label: '' },
    description: '',
    ...overrides,
  };
}

export function createCertificationItem(overrides?: Partial<CertificationItem>): CertificationItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    title: '',
    issuer: '',
    date: '',
    website: { url: '', label: '' },
    description: '',
    ...overrides,
  };
}

export function createPublicationItem(overrides?: Partial<PublicationItem>): PublicationItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    title: '',
    publisher: '',
    date: '',
    website: { url: '', label: '' },
    description: '',
    ...overrides,
  };
}

export function createVolunteerItem(overrides?: Partial<VolunteerItem>): VolunteerItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    organization: '',
    location: '',
    period: '',
    website: { url: '', label: '' },
    description: '',
    ...overrides,
  };
}

export function createReferenceItem(overrides?: Partial<ReferenceItem>): ReferenceItem {
  return {
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    name: '',
    position: '',
    website: { url: '', label: '' },
    phone: '',
    description: '',
    ...overrides,
  };
}

// ── Default Sections ──────────────────────────────────────────────────────────

export const DEFAULT_SECTIONS: Sections = {
  profiles: {
    title: 'Profiles',
    columns: 1,
    hidden: false,
    items: [],
  },
  experience: {
    title: 'Experience',
    columns: 1,
    hidden: false,
    items: [],
  },
  education: {
    title: 'Education',
    columns: 1,
    hidden: false,
    items: [],
  },
  projects: {
    title: 'Projects',
    columns: 1,
    hidden: false,
    items: [],
  },
  skills: {
    title: 'Skills',
    columns: 2,
    hidden: false,
    items: [],
  },
  languages: {
    title: 'Languages',
    columns: 1,
    hidden: false,
    items: [],
  },
  interests: {
    title: 'Interests',
    columns: 1,
    hidden: false,
    items: [],
  },
  awards: {
    title: 'Awards',
    columns: 1,
    hidden: false,
    items: [],
  },
  certifications: {
    title: 'Certifications',
    columns: 1,
    hidden: false,
    items: [],
  },
  publications: {
    title: 'Publications',
    columns: 1,
    hidden: false,
    items: [],
  },
  volunteer: {
    title: 'Volunteer',
    columns: 1,
    hidden: false,
    items: [],
  },
  references: {
    title: 'References',
    columns: 1,
    hidden: false,
    items: [],
  },
};

// ── Default Metadata ──────────────────────────────────────────────────────────

export const DEFAULT_METADATA: Metadata = {
  template: 'classic',
  layout: {
    sidebarWidth: 35,
    pages: [
      {
        fullWidth: false,
        main: ['summary', 'experience', 'education', 'projects'],
        sidebar: ['profiles', 'skills', 'languages', 'certifications'],
      },
    ],
  },
  css: {
    enabled: false,
    value: '',
  },
  page: {
    format: 'a4',
    locale: 'en-US',
    marginX: 36,
    marginY: 36,
    gapX: 16,
    gapY: 12,
    hideIcons: false,
  },
  design: {
    colors: {
      primary: '#2563eb',
      text: '#111827',
      background: '#ffffff',
    },
    level: {
      icon: '',
      type: 'circle',
    },
  },
  typography: {
    body: {
      fontFamily: 'Inter',
      fontWeights: ['400'],
      fontSize: 11,
      lineHeight: 1.5,
    },
    heading: {
      fontFamily: 'Inter',
      fontWeights: ['700'],
      fontSize: 11,
      lineHeight: 1.3,
    },
  },
  notes: '',
};

// ── Full empty resume factory ─────────────────────────────────────────────────

export function createEmptyResume(): ResumeData {
  return {
    picture: { ...DEFAULT_PICTURE },
    basics: {
      ...DEFAULT_BASICS,
      website: { ...DEFAULT_BASICS.website },
      customFields: [],
    },
    summary: { ...DEFAULT_SUMMARY },
    sections: structuredClone(DEFAULT_SECTIONS),
    customSections: [],
    metadata: structuredClone(DEFAULT_METADATA),
  };
}
