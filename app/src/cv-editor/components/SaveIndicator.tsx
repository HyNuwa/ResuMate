import { memo } from 'react';
import { Save, Check, AlertCircle } from 'lucide-react';
import type { SaveStatus } from '@/shared/hooks/useFormAutoSave';

interface SaveIndicatorProps {
  status: SaveStatus;
}

/**
 * Displays the current save status (saving, saved, error)
 * Memoized to prevent unnecessary re-renders
 */
export const SaveIndicator = memo(({ status }: SaveIndicatorProps) => {
  if (status === 'idle') return null;

  return (
    <div className={`save-indicator save-indicator-${status}`}>
      {status === 'saving' && (
        <>
          <Save className="save-icon spin" size={16} />
          <span>Guardando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="save-icon" size={16} />
          <span>Guardado</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="save-icon" size={16} />
          <span>Error al guardar</span>
        </>
      )}
    </div>
  );
});

SaveIndicator.displayName = 'SaveIndicator';
