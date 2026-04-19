import { memo } from 'react';
import type { ResumeData } from '@resumate/schema';
import { SectionHeading, ContactInfo, SectionRenderer, renderSummarySection } from '../shared';
import { ExperienceEntry, EducationEntry, ProjectEntry, SkillsBlock, LanguagesBlock } from '../shared';

interface HarvardTemplateProps {
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
  letterSpacing: '0.1em',
};

export const HarvardTemplate = memo(function HarvardTemplate({ resume }: HarvardTemplateProps) {
  const { basics, sections } = resume;

  return (
    <div style={baseTextStyle}>

      {basics.name && (
        <div style={{ marginBottom: '4pt', textAlign: 'center' }}>
          <span style={{ ...headingStyle, textAlign: 'center' }}>
            {basics.name}
          </span>
        </div>
      )}

      <ContactInfo
        basics={basics}
        profiles={sections.profiles.items}
        variant="centered"
        showIcons={false}
        style={{ marginBottom: '16pt' }}
      />

      {renderSummarySection(resume, (title) => (
        <SectionHeading title={title} variant="centered-border" />
      ))}

      <SectionRenderer
        resume={resume}
        sectionKey="experience"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => (
          <ExperienceEntry
            item={item as any}
            datePosition="right"
            showLocation
            bodyStyle={{ fontSize: 'var(--preview-size-body)', marginTop: '2pt' }}
            dateStyle={{ fontSize: 'calc(var(--preview-size-body) * 0.85)', fontStyle: 'italic', color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}
          />
        )}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="education"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => (
          <EducationEntry
            item={item as any}
            datePosition="right"
            showLocation
            bodyStyle={{ fontSize: 'var(--preview-size-body)', fontStyle: 'italic' }}
            dateStyle={{ fontSize: 'calc(var(--preview-size-body) * 0.85)', fontStyle: 'italic', color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}
          />
        )}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="projects"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
      />

      {!sections.skills.hidden && sections.skills.items.length > 0 && (
        <>
          <SectionHeading title={sections.skills.title} variant="centered-border" />
          <SkillsBlock skills={sections.skills.items} mode="keywords" />
        </>
      )}

      {!sections.languages.hidden && sections.languages.items.length > 0 && (
        <>
          <SectionHeading title={sections.languages.title} variant="centered-border" />
          <LanguagesBlock languages={sections.languages.items} displayMode="inline" />
        </>
      )}

      <SectionRenderer
        resume={resume}
        sectionKey="certifications"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="awards"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="publications"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="volunteer"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="references"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="interests"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="profiles"
        renderHeading={(title) => <SectionHeading title={title} variant="centered-border" />}
        renderItem={() => null}
      />
    </div>
  );
});