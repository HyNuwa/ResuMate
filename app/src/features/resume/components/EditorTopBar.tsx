import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PanelLeft, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaveIndicator } from './SaveIndicator';
import type { SaveStatus } from '@/shared/hooks/useFormAutoSave';

interface EditorTopBarProps {
  title: string;
  onTitleChange: (t: string) => void;
  saveStatus: SaveStatus;
  leftOpen: boolean;
  rightOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

export function EditorTopBar({
  title, onTitleChange, saveStatus,
  leftOpen, rightOpen, onToggleLeft, onToggleRight,
}: EditorTopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="h-12 flex items-center shrink-0 bg-white border-b border-slate-200 px-3 gap-3 z-40">
      {/* ── Left: back + left-panel toggle ── */}
      <div className="flex items-center gap-1 w-44 shrink-0">
        <Button
          variant="ghost" size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-900"
          onClick={() => navigate('/my-cvs')}
          title="Volver a Mis CVs"
        >
          <ArrowLeft size={17} />
        </Button>
        <Button
          variant={leftOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={onToggleLeft}
          title="Panel de contenido"
        >
          <PanelLeft size={16} />
        </Button>
      </div>

      {/* ── Center: editable CV title ── */}
      <div className="flex-1 flex justify-center">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-sm font-semibold text-slate-800 text-center bg-transparent border-none outline-none focus:bg-slate-50 focus:ring-1 focus:ring-blue-200 rounded px-2 py-0.5 w-72 truncate"
          placeholder="Sin título"
        />
      </div>

      {/* ── Right: right-panel toggle + save indicator ── */}
      <div className="flex items-center gap-1 w-44 shrink-0 justify-end">
        <SaveIndicator status={saveStatus} />
        <Button
          variant={rightOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={onToggleRight}
          title="Panel de ajustes"
        >
          <PanelRight size={16} />
        </Button>
      </div>
    </header>
  );
}
