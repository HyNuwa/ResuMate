import { memo } from 'react';
import type {
  ExperienceItem,
  EducationItem,
  ProjectItem,
  AwardItem,
  CertificationItem,
  PublicationItem,
  VolunteerItem,
  ReferenceItem,
} from '@resumate/schema';
import { sanitizeHtml } from './sanitize';

export type EntryVariant = 'default' | 'compact';

interface EntryBlockProps {
  variant?: EntryVariant;
  datePosition?: 'right' | 'below';
  showLocation?: boolean;
  containerStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  dateStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

function EntryDates({
  period,
  style,
}: {
  period: string;
  style?: React.CSSProperties;
}) {
  if (!period) return null;
  return <span style={style}>{period}</span>;
}

function EntryDescription({
  content,
  style,
}: {
  content: string;
  style?: React.CSSProperties;
}) {
  if (!content) return null;
  return (
    <div style={style} dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
  );
}

const defaultContainerStyle: React.CSSProperties = {
  marginBottom: '8pt',
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const defaultHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '8pt',
};

const defaultDateStyle: React.CSSProperties = {
  fontSize: 'var(--preview-size-body)',
  color: 'var(--preview-color-text)',
  opacity: 0.7,
  fontFamily: 'var(--preview-font-body)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const defaultTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--preview-font-heading)',
  fontWeight: 'var(--preview-weight-heading)',
  fontSize: 'var(--preview-size-heading)',
  color: 'var(--preview-color-text)',
};

const defaultBodyStyle: React.CSSProperties = {
  fontSize: 'var(--preview-size-body)',
  fontFamily: 'var(--preview-font-body)',
  color: 'var(--preview-color-text)',
  marginTop: '2pt',
};

export const ExperienceEntry = memo(function ExperienceEntry({
  item,
  datePosition = 'right',
  showLocation = true,
  containerStyle,
  headerStyle,
  titleStyle,
  dateStyle,
  bodyStyle,
}: {
  item: ExperienceItem;
} & EntryBlockProps) {
  const location = showLocation && item.location ? ` — ${item.location}` : '';
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultHeaderStyle, ...headerStyle }}>
        <strong style={{ ...defaultTitleStyle, ...titleStyle }}>
          {item.position} — {item.company}
          {location}
        </strong>
        {datePosition === 'right' && (
          <EntryDates period={item.period} style={{ ...defaultDateStyle, ...dateStyle }} />
        )}
      </div>
      {datePosition === 'below' && (
        <EntryDates
          period={item.period}
          style={{ ...defaultDateStyle, ...dateStyle, marginBottom: '4pt' }}
        />
      )}
      {item.roles && item.roles.length > 0 ? (
        item.roles.map((role) => (
          <div key={role.id} style={{ ...defaultBodyStyle, ...bodyStyle }}>
            <span style={{ fontWeight: 500 }}>{role.position}: </span>
            <EntryDescription content={role.description} />
          </div>
        ))
      ) : (
        <EntryDescription content={item.description} style={{ ...defaultBodyStyle, ...bodyStyle }} />
      )}
    </div>
  );
});

export const EducationEntry = memo(function EducationEntry({
  item,
  datePosition = 'right',
  showLocation = true,
  containerStyle,
  headerStyle,
  titleStyle,
  dateStyle,
  bodyStyle,
}: {
  item: EducationItem;
} & Omit<EntryBlockProps, 'variant'>) {
  const location = showLocation && item.location ? ` — ${item.location}` : '';
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultHeaderStyle, ...headerStyle }}>
        <strong style={{ ...defaultTitleStyle, ...titleStyle }}>
          {item.school}
          {location}
        </strong>
        {datePosition === 'right' && (
          <EntryDates period={item.period} style={{ ...defaultDateStyle, ...dateStyle }} />
        )}
      </div>
      {datePosition === 'below' && (
        <EntryDates period={item.period} style={{ ...defaultDateStyle, ...dateStyle }} />
      )}
      <div style={{ ...defaultBodyStyle, fontStyle: 'italic', ...bodyStyle }}>{item.degree}</div>
      {item.grade && (
        <div style={{ ...defaultDateStyle, fontSize: 'calc(var(--preview-size-body) * 0.85)' }}>
          Grade: {item.grade}
        </div>
      )}
      <EntryDescription
        content={item.description}
        style={{ ...defaultBodyStyle, ...bodyStyle }}
      />
    </div>
  );
});

export const ProjectEntry = memo(function ProjectEntry({
  item,
  datePosition = 'right',
  containerStyle,
  headerStyle,
  titleStyle,
  dateStyle,
  bodyStyle,
}: {
  item: ProjectItem;
} & EntryBlockProps) {
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultHeaderStyle, ...headerStyle }}>
        <strong style={{ ...defaultTitleStyle, ...titleStyle }}>{item.name}</strong>
        {datePosition === 'right' && (
          <EntryDates period={item.period} style={{ ...defaultDateStyle, ...dateStyle }} />
        )}
      </div>
      {item.website.url && (
        <div style={{ ...defaultDateStyle, marginBottom: '2pt' }}>
          <a
            href={item.website.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--preview-color-primary)' }}
          >
            {item.website.label || item.website.url}
          </a>
        </div>
      )}
      <EntryDescription content={item.description} style={{ ...defaultBodyStyle, ...bodyStyle }} />
    </div>
  );
});

export const AwardEntry = memo(function AwardEntry({
  item,
  datePosition = 'right',
  containerStyle,
  headerStyle,
  titleStyle,
  dateStyle,
  bodyStyle,
}: {
  item: AwardItem;
} & EntryBlockProps) {
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultHeaderStyle, ...headerStyle }}>
        <strong style={{ ...defaultTitleStyle, ...titleStyle }}>
          {item.title} — {item.awarder}
        </strong>
        {datePosition === 'right' && (
          <EntryDates period={item.date} style={{ ...defaultDateStyle, ...dateStyle }} />
        )}
      </div>
      <EntryDescription
        content={item.description}
        style={{
          ...defaultBodyStyle,
          fontSize: 'calc(var(--preview-size-body) * 0.9)',
          color: 'var(--preview-color-text)',
          opacity: 0.8,
          ...bodyStyle,
        }}
      />
    </div>
  );
});

export const CertificationEntry = memo(function CertificationEntry({
  item,
  datePosition = 'right',
  containerStyle,
  headerStyle,
  titleStyle,
  dateStyle,
  bodyStyle,
}: {
  item: CertificationItem;
} & EntryBlockProps) {
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultHeaderStyle, ...headerStyle }}>
        <strong style={{ ...defaultTitleStyle, ...titleStyle }}>
          {item.title} — {item.issuer}
        </strong>
        {datePosition === 'right' && (
          <EntryDates period={item.date} style={{ ...defaultDateStyle, ...dateStyle }} />
        )}
      </div>
      <EntryDescription
        content={item.description}
        style={{
          ...defaultBodyStyle,
          fontSize: 'calc(var(--preview-size-body) * 0.9)',
          color: 'var(--preview-color-text)',
          opacity: 0.8,
          ...bodyStyle,
        }}
      />
    </div>
  );
});

export const PublicationEntry = memo(function PublicationEntry({
  item,
  datePosition = 'right',
  containerStyle,
  headerStyle,
  titleStyle,
  dateStyle,
  bodyStyle,
}: {
  item: PublicationItem;
} & EntryBlockProps) {
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultHeaderStyle, ...headerStyle }}>
        <strong style={{ ...defaultTitleStyle, ...titleStyle }}>{item.title}</strong>
        {datePosition === 'right' && (
          <EntryDates period={item.date} style={{ ...defaultDateStyle, ...dateStyle }} />
        )}
      </div>
      <div style={{ ...defaultDateStyle, fontSize: 'calc(var(--preview-size-body) * 0.9)' }}>
        {item.publisher}
      </div>
      <EntryDescription
        content={item.description}
        style={{
          ...defaultBodyStyle,
          fontSize: 'calc(var(--preview-size-body) * 0.9)',
          color: 'var(--preview-color-text)',
          opacity: 0.8,
          ...bodyStyle,
        }}
      />
    </div>
  );
});

export const VolunteerEntry = memo(function VolunteerEntry({
  item,
  datePosition = 'right',
  containerStyle,
  headerStyle,
  titleStyle,
  dateStyle,
  bodyStyle,
}: {
  item: VolunteerItem;
} & EntryBlockProps) {
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultHeaderStyle, ...headerStyle }}>
        <strong style={{ ...defaultTitleStyle, ...titleStyle }}>{item.organization}</strong>
        {datePosition === 'right' && (
          <EntryDates period={item.period} style={{ ...defaultDateStyle, ...dateStyle }} />
        )}
      </div>
      {item.location && (
        <div style={{ ...defaultDateStyle, fontSize: 'calc(var(--preview-size-body) * 0.9)' }}>
          {item.location}
        </div>
      )}
      <EntryDescription content={item.description} style={{ ...defaultBodyStyle, ...bodyStyle }} />
    </div>
  );
});

export const ReferenceEntry = memo(function ReferenceEntry({
  item,
  containerStyle,
  titleStyle,
  bodyStyle,
}: {
  item: ReferenceItem;
} & Omit<EntryBlockProps, 'datePosition' | 'showLocation'>) {
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <strong style={{ ...defaultTitleStyle, ...titleStyle }}>{item.name}</strong>
      {item.position && (
        <span style={{ ...defaultBodyStyle, marginLeft: '4pt', fontSize: 'var(--preview-size-body)' }}>
          — {item.position}
        </span>
      )}
      <EntryDescription
        content={item.description}
        style={{
          ...defaultBodyStyle,
          fontStyle: 'italic',
          marginTop: '2pt',
          ...bodyStyle,
        }}
      />
    </div>
  );
});
