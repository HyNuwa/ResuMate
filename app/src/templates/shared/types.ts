import type { ResumeData } from '@resumate/schema';

export interface TemplateProps {
  resume: ResumeData;
}

export type SectionKey = keyof ResumeData['sections'];

export type TemplateCategory = 'classic' | 'modern' | 'professional';

export interface SectionDef {
  key: SectionKey;
  title: string;
  required: boolean;
}
