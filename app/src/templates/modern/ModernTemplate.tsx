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

interface ModernTemplateProps {
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
  textTransform: 'uppercase',
};

export const ModernTemplate = memo(function ModernTemplate({ resume }: ModernTemplateProps) {
  const { basics, sections, metadata } = resume;
  const sidebarWidth = metadata.layout?.sidebarWidth ?? 35;

  return (
    <div style={baseTextStyle} className="flex">
      <div
        className="bg-gray-50 p-4"
        style={{ width: `${sidebarWidth}%` }}
      >
        {basics.name && (
          <div className="mb-2">
            <span style={{ ...headingStyle, color: 'var(--preview-color-primary)' }}>
              {basics.name}
            </span>
          </div>
        )}

        {basics.headline && (
          <div className="text-[11px] text-gray-600 mb-2">{basics.headline}</div>
        )}

        <ContactInfo
          basics={basics}
          profiles={sections.profiles.items}
          variant="stacked"
          showIcons
          style={{ marginBottom: '12pt' }}
        />

        {!sections.skills.hidden && sections.skills.items.length > 0 && (
          <>
            <SectionHeading title={sections.skills.title} variant="uppercase-border-bottom" />
            <SkillsBlock skills={sections.skills.items} mode="tags" />
          </>
        )}

        {!sections.languages.hidden && sections.languages.items.length > 0 && (
          <>
            <SectionHeading title={sections.languages.title} variant="uppercase-border-bottom" />
            <LanguagesBlock languages={sections.languages.items} displayMode="tags" />
          </>
        )}

        <SectionRenderer
          resume={resume}
          sectionKey="certifications"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
        />
      </div>

      <div className="flex-1">
        {renderSummarySection(resume, (title) => (
          <SectionHeading title={title} variant="uppercase-border-bottom" />
        ))}

        <SectionRenderer
          resume={resume}
          sectionKey="experience"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation />}
        />

        <SectionRenderer
          resume={resume}
          sectionKey="education"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <EducationEntry item={item as any} datePosition="right" showLocation />}
        />

        <SectionRenderer
          resume={resume}
          sectionKey="projects"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
        />

        <SectionRenderer
          resume={resume}
          sectionKey="awards"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
        />

        <SectionRenderer
          resume={resume}
          sectionKey="publications"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
        />

        <SectionRenderer
          resume={resume}
          sectionKey="volunteer"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
        />

        <SectionRenderer
          resume={resume}
          sectionKey="references"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
        />

        <SectionRenderer
          resume={resume}
          sectionKey="interests"
          renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
          renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
        />
      </div>
    </div>
  );
});