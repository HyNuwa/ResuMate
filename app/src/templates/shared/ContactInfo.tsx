import { memo } from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import type { Basics, ProfileItem } from '@resumate/schema';

interface ContactInfoProps {
  basics: Basics;
  profiles: ProfileItem[];
  variant?: 'centered' | 'stacked';
  showIcons?: boolean;
  style?: React.CSSProperties;
}

interface ContactItem {
  icon: React.ReactNode | null;
  text: string;
  url?: string;
}

export const ContactInfo = memo(function ContactInfo({
  basics,
  profiles,
  variant = 'centered',
  showIcons = false,
  style,
}: ContactInfoProps) {
  const iconProps = { size: 12, style: { display: 'inline', marginRight: '2pt' } as React.CSSProperties };
  const contactItems: ContactItem[] = [
    basics.email && { icon: showIcons ? <Mail {...iconProps} /> : null, text: basics.email },
    basics.phone && { icon: showIcons ? <Phone {...iconProps} /> : null, text: basics.phone },
    basics.location && { icon: showIcons ? <MapPin {...iconProps} /> : null, text: basics.location },
    basics.website?.url && {
      icon: showIcons ? <Globe {...iconProps} /> : null,
      text: basics.website.label || basics.website.url,
      url: basics.website.url,
    },
  ].filter(Boolean) as ContactItem[];

  const profileItems: ContactItem[] = profiles
    .filter((p) => !p.hidden && p.username)
    .map((p) => {
      const icon = showIcons ? (
        p.network.toLowerCase().includes('linkedin') ? (
          <Linkedin {...iconProps} />
        ) : p.network.toLowerCase().includes('github') ? (
          <Github {...iconProps} />
        ) : null
      ) : null;
      return {
        icon,
        text: p.website.label || p.username,
        url: p.website.url,
      };
    });

  const allItems: ContactItem[] = [...contactItems, ...profileItems];

  if (allItems.length === 0) return null;

  const baseItemStyle: React.CSSProperties = {
    fontSize: 'calc(var(--preview-size-body) * 0.85)',
    color: 'var(--preview-color-text)',
    fontFamily: 'var(--preview-font-body)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2pt',
  };

  if (variant === 'centered') {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8pt',
          textAlign: 'center',
          ...baseItemStyle,
          ...style,
        }}
      >
        {allItems.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2pt' }}>
            {item.icon}
            {item.url ? (
              <a
                href={item.url}
                style={{ color: 'inherit', textDecoration: 'underline' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.text}
              </a>
            ) : (
              <span>{item.text}</span>
            )}
            {i < allItems.length - 1 && <span style={{ marginLeft: '4pt' }}>•</span>}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4pt',
        ...baseItemStyle,
        ...style,
      }}
    >
      {allItems.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
          {item.icon}
          {item.url ? (
            <a
              href={item.url}
              style={{ color: 'inherit', textDecoration: 'underline' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.text}
            </a>
          ) : (
            <span>{item.text}</span>
          )}
        </span>
      ))}
    </div>
  );
});
