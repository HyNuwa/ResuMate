import { memo } from 'react';
import type { SkillItem, LanguageItem } from '@resumate/schema';

export type SkillsDisplayMode = 'inline' | 'keywords' | 'tags' | 'levels' | 'grid';

interface SkillsBlockProps {
  skills: SkillItem[];
  mode?: SkillsDisplayMode;
  className?: string;
}

export const SkillsBlock = memo(function SkillsBlock({
  skills,
  mode = 'keywords',
  className = '',
}: SkillsBlockProps) {
  const items = skills.filter((s) => !s.hidden && s.name);

  if (items.length === 0) return null;

  if (mode === 'inline') {
    return (
      <div className={className}>
        {items.map((skill) => (
          <div key={skill.id} style={{ fontSize: 'var(--preview-size-body)' }}>
            <strong>{skill.name}:</strong> {skill.keywords?.join(', ')}
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'keywords') {
    return (
      <div className={className}>
        {items.map((skill) => (
          <div key={skill.id} style={{ fontSize: 'var(--preview-size-body)', marginBottom: '2px' }}>
            <strong>{skill.name}:</strong> {skill.keywords?.join(', ')}
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'tags') {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {items.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-[11px]"
          >
            {skill.name}
            {skill.keywords && skill.keywords.length > 0 && (
              <span className="ml-1 text-gray-500">({skill.keywords.join(', ')})</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  if (mode === 'levels') {
    return (
      <div className={className}>
        {items.map((skill) => (
          <div key={skill.id} className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 'var(--preview-size-body)', width: '96px' }}>{skill.name}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <span
                  key={level}
                  className={`w-2 h-2 rounded-full ${level <= skill.level ? '' : 'bg-gray-300'}`}
                  style={level <= skill.level ? { backgroundColor: 'var(--preview-color-primary)' } : undefined}
                />
              ))}
            </div>
            {skill.proficiency && (
              <span className="text-[10px] text-gray-500">{skill.proficiency}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-x-4 gap-y-1 ${className}`}>
        {items.map((skill) => (
          <div key={skill.id} style={{ fontSize: 'var(--preview-size-body)' }}>
            <strong>{skill.name}:</strong> {skill.keywords?.join(', ')}
          </div>
        ))}
      </div>
    );
  }

  return null;
});

interface LanguagesBlockProps {
  languages: LanguageItem[];
  displayMode?: 'inline' | 'tags';
  className?: string;
}

export const LanguagesBlock = memo(function LanguagesBlock({
  languages,
  displayMode = 'inline',
  className = '',
}: LanguagesBlockProps) {
  const items = languages.filter((l) => !l.hidden && l.language);

  if (items.length === 0) return null;

  if (displayMode === 'tags') {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {items.map((lang) => (
          <span
            key={lang.id}
            className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-[11px]"
          >
            {lang.language}
            {lang.fluency && <span className="ml-1 text-gray-500">({lang.fluency})</span>}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-x-4 ${className}`}>
      {items.map((lang) => (
        <div key={lang.id} style={{ fontSize: 'var(--preview-size-body)' }}>
          <strong>{lang.language}:</strong> {lang.fluency}
        </div>
      ))}
    </div>
  );
});
