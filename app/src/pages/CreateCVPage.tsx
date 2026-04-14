import { useState } from 'react';
import { FormBasedEditor } from '@/features/resume/components';
import type { TemplateId } from '@/templates';

export function CreateCVPage() {
  const [selectedTemplate] = useState<TemplateId | null>(null);

  return <FormBasedEditor initialTemplate={selectedTemplate ?? 'harvard'} />;
}
