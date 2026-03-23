import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { Resume } from '@/shared/types/resume';
import { cn } from '@/lib/utils';

interface PreviewToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomRef: React.RefObject<ReactZoomPanPinchRef>;
  resume: Resume;
}

function ToolBtn({
  onClick, disabled = false, title, children,
}: {
  onClick: () => void; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost" size="icon"
      className={cn('h-7 w-7', disabled && 'opacity-40 cursor-not-allowed')}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-slate-200 mx-1" />;
}

export function PreviewToolbar({ canUndo, canRedo, onUndo, onRedo, zoomRef, resume }: PreviewToolbarProps) {
  const handleExportPDF = () => {
    setTimeout(() => window.print(), 200);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${resume.metadata.title || 'resume'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-center gap-0.5 h-9 px-3 bg-white border-b border-slate-100 shrink-0">

      {/* History */}
      <ToolBtn onClick={onUndo} disabled={!canUndo} title="Deshacer (Ctrl+Z)">
        <Undo2 size={14} />
      </ToolBtn>
      <ToolBtn onClick={onRedo} disabled={!canRedo} title="Rehacer (Ctrl+Y)">
        <Redo2 size={14} />
      </ToolBtn>

      <Divider />

      {/* Zoom */}
      <ToolBtn onClick={() => zoomRef.current?.zoomOut(0.25)} title="Zoom out">
        <ZoomOut size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => zoomRef.current?.resetTransform()} title="Centrar vista">
        <Maximize2 size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => zoomRef.current?.zoomIn(0.25)} title="Zoom in">
        <ZoomIn size={14} />
      </ToolBtn>

      <Divider />

      {/* Export */}
      <ToolBtn onClick={handleExportPDF} title="Exportar PDF">
        <Download size={14} />
      </ToolBtn>
      <ToolBtn onClick={handleExportJSON} title="Exportar JSON">
        <FileJson size={14} />
      </ToolBtn>
    </div>
  );
}
