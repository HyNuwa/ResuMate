import { memo, Fragment } from 'react';
import type { ResumeData } from '@resumate/schema';
import { sanitizeHtml } from './sanitize';

interface SectionRendererProps {
  resume: ResumeData;
  sectionKey: keyof ResumeData['sections'];
  renderHeading?: (title: string) => React.ReactNode;
  renderItem: (item: ResumeData['sections'][keyof ResumeData['sections']]['items'][number], index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

export const SectionRenderer = memo(function SectionRenderer({
  resume,
  sectionKey,
  renderHeading,
  renderItem,
  renderEmpty,
}: SectionRendererProps) {
  const section = resume.sections[sectionKey];

  if (section.hidden || section.items.length === 0) {
    return null;
  }

  const items = section.items;

  if (items.length === 0) {
    return renderEmpty ? renderEmpty() : null;
  }

  return (
    <div>
      {renderHeading ? renderHeading(section.title) : null}
      {items.map((item, index) => (
        <Fragment key={(item as any).id ?? index}>
          {renderItem(item, index)}
        </Fragment>
      ))}
    </div>
  );
});

export function renderSummarySection(
  resume: ResumeData,
  renderHeading?: (title: string) => React.ReactNode,
) {
  const { summary } = resume;
  if (summary.hidden || !summary.content) return null;

  return (
    <div>
      {renderHeading ? renderHeading(summary.title) : null}
      <div
        style={{ fontSize: 'var(--preview-size-body)' }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(summary.content) }}
      />
    </div>
  );
}
