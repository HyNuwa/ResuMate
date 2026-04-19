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

interface MinimalTemplateProps {
  resume: ResumeData;
}

const baseTextStyle: React.CSSProperties = {
  fontFamily: 'var(--preview-font-body)',
  fontWeight: 'var(--preview-weight-body)',
  fontSize: 'var(--preview-size-body)',
  lineHeight: 'var(--preview-lh-body)',
  color: 'var(--preview-color-text)',
};

export const MinimalTemplate = memo(function MinimalTemplate({ resume }: MinimalTemplateProps) {
  const { basics, sections } = resume;

  return (
    <div style={baseTextStyle}>

      {basics.name && (
        <div className="mb-3">
          <span className="text-3xl font-bold" style={{ color: 'var(--preview-color-text)' }}>
            {basics.name}
          </span>
        </div>
      )}

      {basics.headline && (
        <div className="text-[14px] text-gray-500 mb-2">{basics.headline}</div>
      )}

      <ContactInfo
        basics={basics}
        profiles={sections.profiles.items}
        variant="stacked"
        showIcons={false}
        style={{ marginBottom: '16pt', fontSize: '11px', color: '#6b7280' }}
      />

      {renderSummarySection(resume, (title) => (
        <SectionHeading title={title} variant="plain" />
      ))}

      <SectionRenderer
        resume={resume}
        sectionKey="experience"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => (
          <ExperienceEntry
            item={item as any}
            datePosition="right"
            showLocation
            dateStyle={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}
          />
        )}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="education"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => (
          <EducationEntry
            item={item as any}
            datePosition="right"
            showLocation
            dateStyle={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}
          />
        )}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="projects"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
      />

      {!sections.skills.hidden && sections.skills.items.length > 0 && (
        <>
          <SectionHeading title={sections.skills.title} variant="plain" />
          <SkillsBlock skills={sections.skills.items} mode="inline" />
        </>
      )}

      {!sections.languages.hidden && sections.languages.items.length > 0 && (
        <>
          <SectionHeading title={sections.languages.title} variant="plain" />
          <LanguagesBlock languages={sections.languages.items} displayMode="inline" />
        </>
      )}

      <SectionRenderer
        resume={resume}
        sectionKey="certifications"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="awards"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="publications"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="volunteer"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="references"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="interests"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="profiles"
        renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
        renderItem={() => null}
      />
    </div>
  );
});