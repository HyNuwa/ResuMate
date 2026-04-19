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

interface CreativeTemplateProps {
  resume: ResumeData;
}

const baseTextStyle: React.CSSProperties = {
  fontFamily: 'var(--preview-font-body)',
  fontWeight: 'var(--preview-weight-body)',
  fontSize: 'var(--preview-size-body)',
  lineHeight: 'var(--preview-lh-body)',
  color: 'var(--preview-color-text)',
};

export const CreativeTemplate = memo(function CreativeTemplate({ resume }: CreativeTemplateProps) {
  const { basics, sections, metadata } = resume;
  const primaryColor = metadata.design?.colors?.primary ?? '#6366f1';

  return (
    <div style={baseTextStyle}>

      <div
        className="w-full px-6 py-5 mb-4"
        style={{ background: primaryColor }}
      >
        {basics.name && (
          <div className="text-center text-white text-2xl font-bold tracking-wide mb-1">
            {basics.name}
          </div>
        )}
        {basics.headline && (
          <div className="text-center text-white/80 text-sm">
            {basics.headline}
          </div>
        )}
        <div className="mt-2">
          <ContactInfo
            basics={basics}
            profiles={sections.profiles.items}
            variant="centered"
            showIcons={false}
            style={{ color: 'rgba(255,255,255,0.7)', justifyContent: 'center' }}
          />
        </div>
      </div>

      <div className="flex gap-4 px-4">
        <div className="w-1/3">
          {!sections.skills.hidden && sections.skills.items.length > 0 && (
            <>
              <SectionHeading title={sections.skills.title} variant="plain" />
              <SkillsBlock skills={sections.skills.items} mode="tags" />
            </>
          )}

          {!sections.languages.hidden && sections.languages.items.length > 0 && (
            <div className="mt-3">
              <SectionHeading title={sections.languages.title} variant="plain" />
              <LanguagesBlock languages={sections.languages.items} displayMode="tags" />
            </div>
          )}

          <SectionRenderer
            resume={resume}
            sectionKey="certifications"
            renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
            renderItem={(item) => <ExperienceEntry item={item as any} datePosition="below" showLocation={false} />}
          />
        </div>

        <div className="flex-1">
          {renderSummarySection(resume, (title) => (
            <SectionHeading title={title} variant="plain" />
          ))}

          <SectionRenderer
            resume={resume}
            sectionKey="experience"
            renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
            renderItem={(item) => <ExperienceEntry item={item as any} datePosition="right" showLocation />}
          />

          <SectionRenderer
            resume={resume}
            sectionKey="education"
            renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
            renderItem={(item) => <EducationEntry item={item as any} datePosition="right" showLocation />}
          />

          <SectionRenderer
            resume={resume}
            sectionKey="projects"
            renderHeading={(title) => <SectionHeading title={title} variant="plain" />}
            renderItem={(item) => <ProjectEntry item={item as any} datePosition="right" />}
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
        </div>
      </div>
    </div>
  );
});