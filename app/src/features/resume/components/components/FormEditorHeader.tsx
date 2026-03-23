import type { SaveStatus } from '@/shared/hooks/useFormAutoSave';
import { SaveIndicator } from './SaveIndicator';

interface FormEditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveStatus: SaveStatus;
}

/**
 * Header section of the CV editor containing the title input and save indicator
 */
export function FormEditorHeader({
  title,
  onTitleChange,
  saveStatus,
}: FormEditorHeaderProps) {
  return (
    <div className="cv-title-section">
      <div className="cv-title-wrapper">
        <input
          type="text"
          className="cv-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Título del CV"
        />
        <SaveIndicator status={saveStatus} />
      </div>
    </div>
  );
}
