/**
 * Adapter layer between the old `Resume` type shape and the new
 * `@resumate/schema` `ResumeData` shape.
 *
 * This lets us migrate components incrementally — existing components
 * keep using old-type hooks while new code uses the schema types directly.
 *
 * Old shape (legacy/cv-editor):
 *   { metadata, profile, experience[], education[], skills, certifications[], languages[], enabledCategories[] }
 *
 * New shape (@resumate/schema ResumeData):
 *   { basics, summary, sections: { experience: { items: [] }, ... }, customSections, metadata, picture }
 */

import { createEmptyResume, type ResumeData } from '@resumate/schema';
import type {
  Resume as OldResume,
  ProfileData as OldProfile,
  ExperienceEntry as OldExperience,
  EducationEntry as OldEducation,
  SkillsData as OldSkills,
  CertificationEntry as OldCertification,
  LanguageEntry as OldLanguage,
  CVMetadata as OldMetadata,
} from '@/shared/types/resume';

// ── Old → New ────────────────────────────────────────────────────────────────

export function oldToNewResume(old: OldResume): ResumeData {
  const base = createEmptyResume();

  return {
    ...base,
    basics: {
      name: old.profile.fullName,
      headline: old.profile.summary || '',
      email: old.profile.email,
      phone: old.profile.phone,
      location: old.profile.location,
      website: {
        url: old.profile.website || '',
        label: old.profile.website || '',
      },
      customFields: [],
    },
    summary: {
      ...base.summary,
      content: old.profile.summary || '',
    },
    sections: {
      ...base.sections,
      experience: {
        title: 'Experience',
        columns: 1,
        hidden: !old.enabledCategories.includes('experience'),
        items: (old.experience ?? []).map(oldExperienceToNew),
      },
      education: {
        title: 'Education',
        columns: 1,
        hidden: !old.enabledCategories.includes('education'),
        items: (old.education ?? []).map(oldEducationToNew),
      },
      certifications: {
        title: 'Certifications',
        columns: 1,
        hidden: !old.enabledCategories.includes('certifications'),
        items: (old.certifications ?? []).map(oldCertificationToNew),
      },
      languages: {
        title: 'Languages',
        columns: 1,
        hidden: !old.enabledCategories.includes('languages'),
        items: (old.languages ?? []).map(oldLanguageToNew),
      },
      skills: {
        title: 'Skills',
        columns: 2,
        hidden: !old.enabledCategories.includes('skills'),
        items: (old.skills?.categories ?? []).flatMap(oldSkillCategoryToNew),
      },
      profiles: {
        ...base.sections.profiles,
        hidden: !old.enabledCategories.includes('profile'),
      },
    },
    metadata: {
      ...base.metadata,
      template: old.metadata.template || 'classic',
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function oldExperienceToNew(e: OldExperience): any {
  return {
    id: e.id,
    hidden: false,
    options: { showLinkInTitle: false },
    company: e.company,
    position: e.position,
    location: e.location,
    period: `${e.startDate} – ${e.endDate}`,
    website: { url: '', label: '' },
    description: e.description,
    roles: [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function oldEducationToNew(e: OldEducation): any {
  return {
    id: e.id,
    hidden: false,
    options: { showLinkInTitle: false },
    school: e.institution,
    degree: e.degree,
    area: '',
    grade: e.gpa || '',
    location: e.location,
    period: e.graduationDate,
    website: { url: '', label: '' },
    description: e.achievements || '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function oldCertificationToNew(c: OldCertification): any {
  return {
    id: c.id,
    hidden: false,
    options: { showLinkInTitle: false },
    title: c.name,
    issuer: c.issuer,
    date: c.issueDate,
    website: { url: '', label: '' },
    description: c.expirationDate ? `Expires: ${c.expirationDate}` : '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function oldLanguageToNew(l: OldLanguage): any {
  return {
    id: l.id,
    hidden: false,
    options: { showLinkInTitle: false },
    language: l.language,
    fluency: l.proficiency,
    level: 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function oldSkillCategoryToNew(cat: OldSkills['categories'][number]): any[] {
  return cat.items.map((name) => ({
    id: crypto.randomUUID(),
    hidden: false,
    options: { showLinkInTitle: false },
    icon: '',
    name,
    proficiency: '',
    level: 0,
    keywords: [],
  }));
}

// ── New → Old ────────────────────────────────────────────────────────────────

export function newToOldResume(data: ResumeData): OldResume {
  return {
    metadata: {
      id: data.metadata.notes || '',
      title: data.metadata.template,
      template: data.metadata.template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as OldMetadata,
    profile: {
      fullName: data.basics.name,
      email: data.basics.email,
      phone: data.basics.phone,
      location: data.basics.location,
      linkedin: '',
      website: data.basics.website.url,
      summary: data.summary.content,
    } as OldProfile,
    experience: data.sections.experience.items.map(newExperienceToOld),
    education: data.sections.education.items.map(newEducationToOld),
    skills: { categories: newSkillsToOldCategories(data.sections.skills.items) },
    certifications: data.sections.certifications.items.map(newCertificationToOld),
    languages: data.sections.languages.items.map(newLanguageToOld),
    enabledCategories: getEnabledCategories(data),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function newExperienceToOld(item: any): OldExperience {
  return {
    id: item.id,
    position: item.position,
    company: item.company,
    location: item.location,
    startDate: item.period?.split('–')[0]?.trim() || '',
    endDate: item.period?.split('–')[1]?.trim() || 'Present',
    description: item.description,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function newEducationToOld(item: any): OldEducation {
  return {
    id: item.id,
    institution: item.school,
    degree: item.degree,
    location: item.location,
    graduationDate: item.period,
    gpa: item.grade,
    achievements: item.description,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function newCertificationToOld(item: any): OldCertification {
  return {
    id: item.id,
    name: item.title,
    issuer: item.issuer,
    issueDate: item.date,
    expirationDate: item.description?.replace('Expires: ', ''),
    credentialId: '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function newLanguageToOld(item: any): OldLanguage {
  return {
    id: item.id,
    language: item.language,
    proficiency: item.fluency as OldLanguage['proficiency'],
  };
}

function newSkillsToOldCategories(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[],
): OldSkills['categories'] {
  // Group by a dummy category since the new schema doesn't have skill categories
  const categoryName = 'Skills';
  return [
    {
      id: crypto.randomUUID(),
      name: categoryName,
      items: items.map((i) => i.name).filter(Boolean),
    },
  ];
}

function getEnabledCategories(data: ResumeData): string[] {
  const cats: string[] = [];
  const sections = data.sections;

  if (!sections.profiles.hidden)    cats.push('profile');
  if (!sections.experience.hidden)  cats.push('experience');
  if (!sections.education.hidden)   cats.push('education');
  if (!sections.skills.hidden)      cats.push('skills');
  if (!sections.certifications.hidden) cats.push('certifications');
  if (!sections.languages.hidden)   cats.push('languages');
  if (!sections.projects.hidden)    cats.push('projects');
  if (!sections.interests.hidden)  cats.push('interests');
  if (!sections.awards.hidden)     cats.push('awards');
  if (!sections.publications.hidden) cats.push('publications');
  if (!sections.volunteer.hidden)  cats.push('volunteer');
  if (!sections.references.hidden)  cats.push('references');

  return cats;
}
