import React from 'react';
import type { CVDocument } from '@/shared/services/cv.service';
import { Calendar, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CVCardProps {
  cv: CVDocument;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function CVCard({ cv, onClick, onDelete }: CVCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getPreviewText = () => {
    if (cv.data.basics.name) {
      const exp = cv.data.sections.experience.items;
      const position = exp.length > 0 ? exp[0].position : '';
      return position ? `${cv.data.basics.name} · ${position}` : cv.data.basics.name;
    }
    return null;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este CV?')) onDelete(cv.id);
  };

  const enabledSections = Object.values(cv.data.sections).filter((s) => !s.hidden).length;
  const preview = getPreviewText();

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col bg-white rounded-xl border border-slate-200 p-5 cursor-pointer',
        'transition-all duration-200',
        'hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-0.5'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute top-3 right-3 h-7 w-7',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'text-slate-300 hover:text-red-500 hover:bg-red-50'
        )}
        onClick={handleDelete}
        title="Eliminar CV"
      >
        <Trash2 size={14} />
      </Button>

      <div className="flex items-start gap-3 mb-3 pr-8">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <FileText size={17} className="text-blue-500" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 leading-snug truncate">
            {cv.title}
          </h3>
          {preview && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{preview}</p>
          )}
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={12} />
          <span>{formatDate(cv.updatedAt)}</span>
        </div>
        <Badge
          variant="secondary"
          className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 border-0"
        >
          {enabledSections} secciones
        </Badge>
      </div>
    </div>
  );
}
