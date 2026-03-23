/**
 * TypeScript types for @resumate/schema v1.0.0
 *
 * These types are hand-crafted to exactly mirror resume.schema.json.
 * They are the single source of truth shared between frontend and backend.
 *
 * Naming conventions:
 *  - Section item types: <Name>Item (ExperienceItem, SkillItem, …)
 *  - Section wrapper types: <Name>Section (ExperienceSection, SkillSection, …)
 *  - Top-level grouping: Sections, Metadata, Basics, etc.
 *  - Root document: ResumeData
 */

// ── Primitive helpers ─────────────────────────────────────────────────────────

export interface Url {
  url: string;
  label: string;
}

export interface ItemOptions {
  showLinkInTitle: boolean;
}

// ── Picture ───────────────────────────────────────────────────────────────────

export interface Picture {
  hidden: boolean;
  url: string;
  size: number;
  rotation: number;
  aspectRatio: number;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  shadowColor: string;
  shadowWidth: number;
}

// ── Basics ────────────────────────────────────────────────────────────────────

export interface CustomField {
  id: string;
  icon: string;
  text: string;
  link: string;
}

export interface Basics {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: Url;
  customFields: CustomField[];
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface Summary {
  title: string;
  columns: number;
  hidden: boolean;
  /** HTML-formatted string */
  content: string;
}

// ── Section items ─────────────────────────────────────────────────────────────

export interface ProfileItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  icon: string;
  network: string;
  username: string;
  website: Url;
}

export interface Role {
  id: string;
  position: string;
  period: string;
  /** HTML-formatted string */
  description: string;
}

export interface ExperienceItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  company: string;
  position: string;
  location: string;
  period: string;
  website: Url;
  /** HTML-formatted string */
  description: string;
  roles: Role[];
}

export interface EducationItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  school: string;
  degree: string;
  area: string;
  grade: string;
  location: string;
  period: string;
  website: Url;
  /** HTML-formatted string */
  description: string;
}

export interface ProjectItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  name: string;
  period: string;
  website: Url;
  /** HTML-formatted string */
  description: string;
}

export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export interface SkillItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  icon: string;
  name: string;
  proficiency: string;
  level: number;
  keywords: string[];
}

export interface LanguageItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  language: string;
  fluency: string;
  level: number;
}

export interface InterestItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  icon: string;
  name: string;
  keywords: string[];
}

export interface AwardItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  title: string;
  awarder: string;
  date: string;
  website: Url;
  /** HTML-formatted string */
  description: string;
}

export interface CertificationItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  title: string;
  issuer: string;
  date: string;
  website: Url;
  /** HTML-formatted string */
  description: string;
}

export interface PublicationItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  title: string;
  publisher: string;
  date: string;
  website: Url;
  /** HTML-formatted string */
  description: string;
}

export interface VolunteerItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  organization: string;
  location: string;
  period: string;
  website: Url;
  /** HTML-formatted string */
  description: string;
}

export interface ReferenceItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  name: string;
  position: string;
  website: Url;
  phone: string;
  /** HTML-formatted string */
  description: string;
}

export interface CoverLetterItem {
  id: string;
  hidden: boolean;
  options?: ItemOptions;
  /** HTML-formatted recipient address block */
  recipient: string;
  /** HTML-formatted cover letter body */
  content: string;
}

// ── Section wrappers ──────────────────────────────────────────────────────────

export interface SectionBase {
  title: string;
  columns: number;
  hidden: boolean;
}

export interface ProfilesSection extends SectionBase {
  items: ProfileItem[];
}

export interface ExperienceSection extends SectionBase {
  items: ExperienceItem[];
}

export interface EducationSection extends SectionBase {
  items: EducationItem[];
}

export interface ProjectsSection extends SectionBase {
  items: ProjectItem[];
}

export interface SkillsSection extends SectionBase {
  items: SkillItem[];
}

export interface LanguagesSection extends SectionBase {
  items: LanguageItem[];
}

export interface InterestsSection extends SectionBase {
  items: InterestItem[];
}

export interface AwardsSection extends SectionBase {
  items: AwardItem[];
}

export interface CertificationsSection extends SectionBase {
  items: CertificationItem[];
}

export interface PublicationsSection extends SectionBase {
  items: PublicationItem[];
}

export interface VolunteerSection extends SectionBase {
  items: VolunteerItem[];
}

export interface ReferencesSection extends SectionBase {
  items: ReferenceItem[];
}

export interface Sections {
  profiles: ProfilesSection;
  experience: ExperienceSection;
  education: EducationSection;
  projects: ProjectsSection;
  skills: SkillsSection;
  languages: LanguagesSection;
  interests: InterestsSection;
  awards: AwardsSection;
  certifications: CertificationsSection;
  publications: PublicationsSection;
  volunteer: VolunteerSection;
  references: ReferencesSection;
}

// ── Custom sections ───────────────────────────────────────────────────────────

export type CustomSectionItemType =
  | 'summary'
  | 'profiles'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'interests'
  | 'awards'
  | 'certifications'
  | 'publications'
  | 'volunteer'
  | 'references'
  | 'cover-letter';

export type CustomSectionItem =
  | ProfileItem
  | ExperienceItem
  | EducationItem
  | ProjectItem
  | SkillItem
  | LanguageItem
  | InterestItem
  | AwardItem
  | CertificationItem
  | PublicationItem
  | VolunteerItem
  | ReferenceItem
  | CoverLetterItem;

export interface CustomSection extends SectionBase {
  id: string;
  type: CustomSectionItemType;
  items: CustomSectionItem[];
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export interface LayoutPage {
  fullWidth: boolean;
  /** Array of section IDs for the main column */
  main: string[];
  /** Array of section IDs for the sidebar column */
  sidebar: string[];
}

export interface Layout {
  sidebarWidth: number;
  pages: LayoutPage[];
}

export interface CssSettings {
  enabled: boolean;
  value: string;
}

export type PageFormat = 'a4' | 'letter' | 'free-form';

export interface PageSettings {
  format: PageFormat;
  locale: string;
  marginX: number;
  marginY: number;
  gapX: number;
  gapY: number;
  hideIcons: boolean;
}

export type LevelDisplayType =
  | 'hidden'
  | 'circle'
  | 'square'
  | 'rectangle'
  | 'rectangle-full'
  | 'progress-bar'
  | 'icon';

export interface LevelDesign {
  icon: string;
  type: LevelDisplayType;
}

export interface DesignColors {
  primary: string;
  text: string;
  background: string;
}

export interface DesignSettings {
  colors: DesignColors;
  level: LevelDesign;
}

export interface FontStyle {
  fontFamily: string;
  fontWeights: FontWeight[];
  fontSize: number;
  lineHeight: number;
}

export interface TypographySettings {
  body: FontStyle;
  heading: FontStyle;
}

export interface Metadata {
  template: string;
  layout: Layout;
  css: CssSettings;
  page: PageSettings;
  design: DesignSettings;
  typography: TypographySettings;
  notes: string;
}

// ── Root document ─────────────────────────────────────────────────────────────

/**
 * The complete resume data structure. This is what is stored in the
 * `user_cvs.data` JSONB column and validated against resume.schema.json.
 */
export interface ResumeData {
  picture: Picture;
  basics: Basics;
  summary: Summary;
  sections: Sections;
  customSections: CustomSection[];
  metadata: Metadata;
}
