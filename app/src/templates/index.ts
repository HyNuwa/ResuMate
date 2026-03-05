export type TemplateId = 'jake-ryan' | 'harvard' | 'mit' | 'stanford';

export interface CVTemplate {
  id: TemplateId;
  name: string;
  description: string;
  previewImage: string;
  badge?: string; // e.g. "Popular", "Classic"
}

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: 'jake-ryan',
    name: 'Jake Ryan',
    description: 'Clásico de una columna, limpio y ATS-friendly.',
    previewImage: '/templates/jake-ryan.png',
    badge: 'Popular',
  },
  {
    id: 'harvard',
    name: 'Harvard',
    description: 'Formal y estructurado, ideal para academia.',
    previewImage: '/templates/harvard.png',
    badge: 'Clásico',
  },
  {
    id: 'mit',
    name: 'MIT',
    description: 'Técnico y compacto, pensado para ingeniería.',
    previewImage: '/templates/mit.png',
  },
  {
    id: 'stanford',
    name: 'Stanford',
    description: 'Moderno y profesional con acento de color.',
    previewImage: '/templates/stanford.png',
  },
];

export const DEFAULT_TEMPLATE_ID: TemplateId = 'jake-ryan';
