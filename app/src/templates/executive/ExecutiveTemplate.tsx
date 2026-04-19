import { memo } from 'react';
import type { ResumeData } from '@resumate/schema';
import { SectionHeading, ContactInfo, SectionRenderer, renderSummarySection } from '../shared';
import {
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  SkillsBlock,
  LanguagesBlock,
} from '../shared';

interface ExecutiveTemplateProps {
  resume: ResumeData;
}

const baseTextStyle: React.CSSProperties = {
  fontFamily: 'var(--preview-font-body)',
  fontWeight: 'var(--preview-weight-body)',
  fontSize: 'var(--preview-size-body)',
  lineHeight: 'var(--preview-lh-body)',
  color: 'var(--preview-color-text)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--preview-font-heading)',
  fontWeight: 'var(--preview-weight-heading)',
  fontSize: 'var(--preview-size-heading)',
  lineHeight: 'var(--preview-lh-heading)',
};

export const ExecutiveTemplate = memo(function ExecutiveTemplate({ resume }: ExecutiveTemplateProps) {
  const { basics, sections } = resume;

  return (
    <div style={baseTextStyle}>

      <div className="mb-4">
        <span style={headingStyle}>
          {basics.name}
        </span>
        {basics.headline && (
          <div className="text-[13px] text-gray-600 mt-0.5">{basics.headline}</div>
        )}
      </div>

      <ContactInfo
        basics={basics}
        profiles={sections.profiles.items}
        variant="centered"
        showIcons={false}
        style={{ marginBottom: '12pt' }}
      />

      {renderSummarySection(resume, (title) => (
        <SectionHeading title={title} variant="left-border-accent" />
      ))}

      <SectionRenderer
        resume={resume}
        sectionKey="experience"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="education"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <EducationEntry item={item as any} datePosition="right" showLocation />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="projects"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
      />

      {!sections.skills.hidden && sections.skills.items.length > 0 && (
        <>
          <SectionHeading title={sections.skills.title} variant="left-border-accent" />
          <SkillsBlock skills={sections.skills.items} mode="grid" />
        </>
      )}

      {!sections.languages.hidden && sections.languages.items.length > 0 && (
        <>
          <SectionHeading title={sections.languages.title} variant="left-border-accent" />
          <LanguagesBlock languages={sections.languages.items} displayMode="inline" />
        </>
      )}

      <SectionRenderer
        resume={resume}
        sectionKey="certifications"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="awards"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="publications"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="volunteer"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="references"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="interests"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="profiles"
        renderHeading={(title) => <SectionHeading title={title} variant="left-border-accent" />}
        renderItem={() => null}
      />
    </div>
  );
});