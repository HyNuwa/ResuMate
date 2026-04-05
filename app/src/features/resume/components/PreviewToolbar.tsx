import { useState } from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { ResumeData } from '@resumate/schema';
import { printResumePDF } from '@/shared/services/cv.service';
import { cn } from '@/lib/utils';

interface PreviewToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomRef: React.RefObject<ReactZoomPanPinchRef>;
  resume: ResumeData;
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

interface PDFExportBtnProps {
  resume: ResumeData;
}

function PDFExportBtn({ resume }: PDFExportBtnProps) {
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    const cvId = resume.metadata.notes;
    if (!cvId) return;

    setLoading(true);
    try {
      const blob = await printResumePDF(cvId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.basics.name || 'resume'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center h-7 w-7 rounded',
        'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
        'transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
      )}
      title="Exportar PDF"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
    </button>
  );
}

export function PreviewToolbar({ canUndo, canRedo, onUndo, onRedo, zoomRef, resume }: PreviewToolbarProps) {
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${resume.basics.name || 'resume'}.json`;
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
      <PDFExportBtn resume={resume} />
      <ToolBtn onClick={handleExportJSON} title="Exportar JSON">
        <FileJson size={14} />
      </ToolBtn>
    </div>
  );
}