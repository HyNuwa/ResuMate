import { memo } from 'react';
import type { ResumeData } from '@resumate/schema';
import { SectionHeading, ContactInfo, SectionRenderer, renderSummarySection } from '../shared';
import { ExperienceEntry, EducationEntry, ProjectEntry, SkillsBlock, LanguagesBlock } from '../shared';

interface ClassicTemplateProps {
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

export const ClassicTemplate = memo(function ClassicTemplate({ resume }: ClassicTemplateProps) {
  const { basics, sections } = resume;

  return (
    <div style={baseTextStyle}>

      {basics.name && (
        <div style={{ marginBottom: '8pt', textAlign: 'center' }}>
          <span style={{ ...headingStyle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {basics.name}
          </span>
        </div>
      )}

      <ContactInfo basics={basics} profiles={sections.profiles.items} variant="centered" showIcons={false} style={{ marginBottom: '12pt' }} />

      {renderSummarySection(resume, (title) => (
        <SectionHeading title={title} variant="uppercase-border-bottom" />
      ))}

      <SectionRenderer resume={resume} sectionKey="experience"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="education"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <EducationEntry item={item as any} datePosition="right" showLocation containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="projects"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="skills"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={() => <SkillsBlock skills={sections.skills.items} mode="keywords" />}
      />

      <SectionRenderer resume={resume} sectionKey="languages"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={() => <LanguagesBlock languages={sections.languages.items} displayMode="inline" />}
      />

      <SectionRenderer resume={resume} sectionKey="certifications"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="awards"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation={false} containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="publications"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="volunteer"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="references"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="interests"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" containerStyle={{ marginBottom: '8pt' }} />}
      />

      <SectionRenderer resume={resume} sectionKey="profiles"
        renderHeading={(title) => <SectionHeading title={title} variant="uppercase-border-bottom" />}
        renderItem={() => null}
      />
    </div>
  );
});
