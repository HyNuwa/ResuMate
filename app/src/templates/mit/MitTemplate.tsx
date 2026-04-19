import { memo } from 'react';
import type { ResumeData } from '@resumate/schema';
import { SectionHeading, ContactInfo, SectionRenderer, renderSummarySection } from '../shared';
import { ExperienceEntry, EducationEntry, ProjectEntry, SkillsBlock, LanguagesBlock } from '../shared';

interface MitTemplateProps {
  resume: ResumeData;
}

export const MitTemplate = memo(function MitTemplate({ resume }: MitTemplateProps) {
  const { basics, sections } = resume;

  const headingVariant = 'uppercase-bg';

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
    letterSpacing: '-0.01em',
  };

  return (
    <div style={baseTextStyle}>

      {basics.name && (
        <div style={{ marginBottom: 0 }}>
          <span style={headingStyle}>
            {basics.name}
          </span>
        </div>
      )}

      <ContactInfo
        basics={basics}
        profiles={sections.profiles.items}
        variant="centered"
        showIcons={false}
        style={{ display: 'flex', flexWrap: 'wrap', gap: '8pt', fontSize: '10px', color: '#4b5563', borderBottom: '1px solid #d1d5db', paddingBottom: '4pt', marginBottom: '8pt' }}
      />

      {renderSummarySection(resume, (title) => (
        <SectionHeading title={title} variant={headingVariant} />
      ))}

      <SectionRenderer
        resume={resume}
        sectionKey="experience"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => (
          <ExperienceEntry
            item={item as any}
            datePosition="right"
            showLocation
            dateStyle={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}
          />
        )}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="education"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => (
          <EducationEntry
            item={item as any}
            datePosition="right"
            showLocation
            dateStyle={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}
          />
        )}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="projects"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
      />

      {!sections.skills.hidden && sections.skills.items.length > 0 && (
        <>
          <SectionHeading title={sections.skills.title} variant={headingVariant} />
          <SkillsBlock skills={sections.skills.items} mode="keywords" />
        </>
      )}

      {!sections.languages.hidden && sections.languages.items.length > 0 && (
        <>
          <SectionHeading title={sections.languages.title} variant={headingVariant} />
          <LanguagesBlock languages={sections.languages.items} displayMode="inline" />
        </>
      )}

      <SectionRenderer
        resume={resume}
        sectionKey="certifications"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="awards"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="publications"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="volunteer"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="references"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="interests"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" />}
      />

      <SectionRenderer
        resume={resume}
        sectionKey="profiles"
        renderHeading={(title) => <SectionHeading title={title} variant={headingVariant} />}
        renderItem={() => null}
      />
    </div>
  );
});
