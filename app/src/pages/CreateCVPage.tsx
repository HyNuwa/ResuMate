import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormBasedEditor } from '@/features/resume/components';
import { TemplatePicker } from '@/features/resume/components/components/TemplatePicker';
import { createEmptyResume } from '@/shared/types/resume';
import type { Resume } from '@/shared/types/resume';
import type { TemplateId } from '@/templates';

type LayoutVariant = 'standard' | 'compact';

export function CreateCVPage() {
  const navigate = useNavigate();
  const [initialCV, setInitialCV] = useState<Resume | null>(null);

  const handleApply = useCallback((templateId: TemplateId, layout: LayoutVariant) => {
    const cv = createEmptyResume();
    cv.metadata = { ...cv.metadata, template: templateId, layoutVariant: layout };
    setInitialCV(cv);
  }, []);

  const handleCancel = useCallback(() => {
    navigate('/my-cvs');
  }, [navigate]);

  if (!initialCV) {
    return <TemplatePicker onApply={handleApply} onCancel={handleCancel} />;
  }

  return <FormBasedEditor />;
}
