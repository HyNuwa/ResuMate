import { useState } from 'react';
import { FormBasedEditor, TemplatePicker } from '@/features/resume/components';
import type { TemplateId } from '@/templates';

type CreateStep = 'select-template' | 'editor';

export function CreateCVPage() {
  const [step, setStep] = useState<CreateStep>('select-template');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);

  const handleApplyTemplate = (templateId: TemplateId) => {
    setSelectedTemplate(templateId);
    setStep('editor');
  };

  const handleCancelTemplate = () => {
    setSelectedTemplate(null);
    setStep('editor');
  };

  if (step === 'select-template') {
    return (
      <TemplatePicker
        onApply={handleApplyTemplate}
        onCancel={handleCancelTemplate}
      />
    );
  }

  return <FormBasedEditor initialTemplate={selectedTemplate ?? 'classic'} />;
}
