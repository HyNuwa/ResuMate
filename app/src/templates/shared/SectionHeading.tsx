import { memo } from 'react';

export type HeadingVariant =
  | 'uppercase-border-bottom'
  | 'uppercase-bg'
  | 'centered-border'
  | 'plain'
  | 'left-border-accent';

interface SectionHeadingProps {
  title: string;
  variant?: HeadingVariant;
  className?: string;
}

const baseStyle = `
  font-family: var(--preview-font-heading);
  font-weight: var(--preview-weight-heading);
  font-size: var(--preview-size-heading);
  line-height: var(--preview-lh-heading);
  color: var(--preview-color-text);
`;

const variantStyles: Record<HeadingVariant, React.CSSProperties> = {
  'uppercase-border-bottom': {
    ...parseStyle(baseStyle),
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    borderBottom: '1px solid var(--preview-color-primary)',
    paddingBottom: '2px',
    marginTop: '12px',
    marginBottom: '4px',
    color: 'var(--preview-color-primary)',
  },
  'uppercase-bg': {
    ...parseStyle(baseStyle),
    textTransform: 'uppercase',
    backgroundColor: '#f3f4f6',
    paddingLeft: '4px',
    paddingRight: '4px',
    marginTop: '12px',
    marginBottom: '4px',
    color: 'var(--preview-color-primary)',
  },
  'centered-border': {
    ...parseStyle(baseStyle),
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    borderBottom: '2px solid var(--preview-color-primary)',
    paddingBottom: '2px',
    marginTop: '16px',
    marginBottom: '8px',
    color: 'var(--preview-color-primary)',
  },
  'plain': {
    ...parseStyle(baseStyle),
    marginTop: '12px',
    marginBottom: '4px',
  },
  'left-border-accent': {
    ...parseStyle(baseStyle),
    borderLeft: '4px solid var(--preview-color-primary)',
    paddingLeft: '8px',
    marginTop: '12px',
    marginBottom: '4px',
  },
};

function parseStyle(css: string): React.CSSProperties {
  const obj: React.CSSProperties = {};
  const pairs = css.split(';').filter(s => s.trim());
  for (const pair of pairs) {
    const [prop, val] = pair.split(':').map(s => s.trim());
    if (prop && val) {
      const camel = prop.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      (obj as any)[camel] = val;
    }
  }
  return obj;
}

export const SectionHeading = memo(function SectionHeading({
  title,
  variant = 'uppercase-border-bottom',
  className = '',
}: SectionHeadingProps) {
  const style = { ...variantStyles[variant] };
  if (className) {
    style.borderColor = className.includes('border') ? undefined : style.borderColor;
  }
  
  return (
    <h2 style={style} className={className}>
      {title}
    </h2>
  );
});
