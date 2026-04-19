/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import type { ResumeData } from '@resumate/schema';
import { ClassicTemplate } from '@/templates/classic/ClassicTemplate';
import { HarvardTemplate } from '@/templates/harvard/HarvardTemplate';
import { JakeRyanTemplate } from '@/templates/jake-ryan/JakeRyanTemplate';
import { MitTemplate } from '@/templates/mit/MitTemplate';
import { ModernTemplate } from '@/templates/modern/ModernTemplate';
import { CreativeTemplate } from '@/templates/creative/CreativeTemplate';
import { ExecutiveTemplate } from '@/templates/executive/ExecutiveTemplate';
import { MinimalTemplate } from '@/templates/minimal/MinimalTemplate';

const TEMPLATE_MAP: Record<string, React.ComponentType<{ resume: ResumeData }>> = {
  classic: ClassicTemplate,
  harvard: HarvardTemplate,
  'jake-ryan': JakeRyanTemplate,
  mit: MitTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
  minimal: MinimalTemplate,
};

interface ResumePreviewProps {
  resume: ResumeData;
}

export const ResumePreview = memo(function ResumePreview({ resume }: ResumePreviewProps) {
  const rawTemplateId = resume?.metadata?.template;
  
  let templateId: string;
  if (typeof rawTemplateId === 'string' && TEMPLATE_MAP[rawTemplateId]) {
    templateId = rawTemplateId;
  } else {
    templateId = 'classic';
    if (rawTemplateId !== undefined) {
      console.warn('[ResumePreview] Invalid template:', rawTemplateId);
    }
  }
  
  const TemplateComponent = TEMPLATE_MAP[templateId];
  
  if (!TemplateComponent) {
    console.error('[ResumePreview] Template not found:', templateId);
    return <div className="p-4 text-red-500">Template error: {templateId}</div>;
  }

  return <TemplateComponent resume={resume} />;
});
