import type { TemplateId, TemplateCategory, TemplateInfo } from './registry';
import { TEMPLATE_REGISTRY, getTemplateInfo } from './registry';
export { TEMPLATE_REGISTRY, getTemplateInfo };
export type { TemplateId, TemplateCategory, TemplateInfo };

export type CVTemplate = TemplateInfo;
export const CV_TEMPLATES: CVTemplate[] = TEMPLATE_REGISTRY;
export const DEFAULT_TEMPLATE_ID: TemplateId = 'classic';
