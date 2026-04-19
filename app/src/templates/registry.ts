export type TemplateCategory = 'classic' | 'modern' | 'professional';

export type TemplateId =
  | 'classic'
  | 'harvard'
  | 'jake-ryan'
  | 'mit'
  | 'modern'
  | 'creative'
  | 'executive'
  | 'minimal';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  previewImage: string;
  badge?: string;
  category: TemplateCategory;
}

export const TEMPLATE_REGISTRY: TemplateInfo[] = [
  { id: 'classic', name: 'Classic', description: 'Clean single-column. Name centered, thin horizontal rules. The safe ATS-friendly default.', previewImage: '/templates/classic.png', badge: 'ATS-Friendly', category: 'classic' },
  { id: 'harvard', name: 'Harvard', description: 'Formal academic. Name centered, uppercase section headings with bottom border, italic dates.', previewImage: '/templates/harvard.png', badge: 'Classic', category: 'classic' },
  { id: 'jake-ryan', name: 'Jake Ryan', description: 'The LaTeX community favorite. Name centered bold, compact spacing, uppercase headings with colored underline.', previewImage: '/templates/jake-ryan.png', badge: 'Popular', category: 'classic' },
  { id: 'mit', name: 'MIT', description: 'Technical/compact. Name left-aligned, grey background on section headings, minimal spacing. Dense.', previewImage: '/templates/mit.png', category: 'classic' },
  { id: 'modern', name: 'Modern', description: 'Left sidebar (35%) with colored background containing contact and skills. Main column has experience and education.', previewImage: '/templates/modern.png', badge: 'Popular', category: 'modern' },
  { id: 'creative', name: 'Creative', description: 'Bold header banner with primary color gradient. Two-column body with skills as pill tags. Rounded corners.', previewImage: '/templates/creative.png', category: 'modern' },
  { id: 'executive', name: 'Executive', description: 'Full-width header with name + headline. Subtle left accent bar per section. Two-column skills grid. Refined.', previewImage: '/templates/executive.png', category: 'professional' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean. No borders, no rules, no color except text. Large name, generous whitespace. Monospaced dates.', previewImage: '/templates/minimal.png', category: 'professional' },
];

export function getTemplateInfo(id: TemplateId): TemplateInfo | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.id === id);
}
