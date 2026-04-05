import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormBasedEditor } from '@/features/resume/components';
import type { TemplateId } from '@/templates';

type LayoutVariant = 'standard' | 'compact';

export function CreateCVPage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);

  const handleApply = useCallback((templateId: TemplateId, _layout: LayoutVariant) => {
    setSelectedTemplate(templateId);
  }, []);

  const handleCancel = useCallback(() => {
    navigate('/my-cvs');
  }, [navigate]);

  return <FormBasedEditor initialTemplate={selectedTemplate ?? 'harvard'} />;
}
