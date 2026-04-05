import { memo } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SaveStatus } from '@/shared/hooks/useFormAutoSave';

interface SaveIndicatorProps {
  status: SaveStatus;
}

export const SaveIndicator = memo(({ status }: SaveIndicatorProps) => {
  if (status === 'idle') return null;

  const config = {
    saving: {
      icon: <Loader2 size={13} className="animate-spin" />,
      label: 'Guardando...',
      variant: 'secondary' as const,
      extra: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    saved: {
      icon: <Check size={13} />,
      label: 'Guardado',
      variant: 'secondary' as const,
      extra: 'text-green-600 bg-green-50 border-green-200',
    },
    error: {
      icon: <AlertCircle size={13} />,
      label: 'Error al guardar',
      variant: 'destructive' as const,
      extra: '',
    },
  }[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1',
        config.extra
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
});

SaveIndicator.displayName = 'SaveIndicator';
