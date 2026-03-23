import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type {
  Metadata,
  TypographySettings,
  DesignSettings,
  PageSettings,
  PageFormat,
  FontWeight,
} from '@resumate/schema';
import { SECTION_META } from './CollapsibleSections';
import { CV_TEMPLATES } from '@/templates';

// ── Small helpers ─────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-4 pt-5 pb-2">
      {children}
    </h3>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-1.5">
      <Label className="text-xs text-slate-500 w-28 shrink-0">{label}</Label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ── Sortable layout item ──────────────────────────────────────────────────────

function LayoutItem({ id, onRemove }: { id: string; onRemove: () => void }) {
  const meta = SECTION_META[id] ?? { label: id, emoji: '📄' };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm',
        isDragging && 'shadow-md ring-2 ring-blue-300',
      )}
    >
      <button
        type="button" className="cursor-grab text-slate-300 hover:text-slate-500 touch-none"
        {...attributes} {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <span>{meta.emoji}</span>
      <span className="flex-1 font-medium text-slate-700">{meta.label}</span>
      <button
        type="button"
        className="text-slate-300 hover:text-red-400 transition-colors"
        onClick={onRemove}
        title="Eliminar sección"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Color swatch input ────────────────────────────────────────────────────────

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <SettingRow label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 rounded cursor-pointer border border-slate-200"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs font-mono"
          maxLength={7}
        />
      </div>
    </SettingRow>
  );
}

// ── Font select ───────────────────────────────────────────────────────────────

const FONT_FAMILIES = [
  'Inter, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  '"Courier New", monospace',
  'Garamond, serif',
];

const FONT_WEIGHTS = ['300', '400', '500', '600', '700'];

// ── Main SettingsPanel ────────────────────────────────────────────────────────

interface SettingsPanelProps {
  metadata: Metadata;
  enabledCategories: string[];
  onUpdateTypography: (t: TypographySettings) => void;
  onUpdateDesign:     (d: DesignSettings) => void;
  onUpdatePage:       (p: PageSettings) => void;
  onReorderCategories: (newOrder: string[]) => void;
  onRemoveCategory:    (id: string) => void;
  onAddSection:        () => void;
}

export function SettingsPanel({
  metadata, enabledCategories,
  onUpdateTypography, onUpdateDesign, onUpdatePage,
  onReorderCategories, onRemoveCategory, onAddSection,
}: SettingsPanelProps) {
  const typography = metadata.typography;
  const design     = metadata.design;
  const page       = metadata.page;

  // Find current template info
  const template = CV_TEMPLATES.find((t) => t.id === metadata.template);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = enabledCategories.indexOf(active.id as string);
    const newIdx = enabledCategories.indexOf(over.id as string);
    onReorderCategories(arrayMove(enabledCategories, oldIdx, newIdx));
  };

  // Typography helper - fontWeights is array in new schema
  const setBodyProp   = <K extends keyof typeof typography.body>(k: K, v: typeof typography.body[K]) => {
    if (k === 'fontWeights') {
      onUpdateTypography({ ...typography, body: { ...typography.body, [k]: v as string[] } });
    } else {
      onUpdateTypography({ ...typography, body: { ...typography.body, [k]: v } });
    }
  };
  const setHeadingProp = <K extends keyof typeof typography.heading>(k: K, v: typeof typography.heading[K]) => {
    if (k === 'fontWeights') {
      onUpdateTypography({ ...typography, heading: { ...typography.heading, [k]: v as string[] } });
    } else {
      onUpdateTypography({ ...typography, heading: { ...typography.heading, [k]: v } });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white border-l border-slate-200 text-sm">

      {/* ── Template ── */}
      <SectionHeading>Plantilla</SectionHeading>
      <div className="px-4 pb-2">
        {template ? (
          <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 space-y-1">
            <p className="font-semibold text-slate-800 text-sm">{template.name}</p>
            <p className="text-xs text-slate-500">{template.description}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Sin plantilla</p>
        )}
      </div>

      {/* ── Layout ── */}
      <SectionHeading>Layout</SectionHeading>
      <div className="px-4 flex flex-col gap-1.5 pb-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={enabledCategories} strategy={verticalListSortingStrategy}>
            {enabledCategories.map((id) => (
              <LayoutItem key={id} id={id} onRemove={() => onRemoveCategory(id)} />
            ))}
          </SortableContext>
        </DndContext>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-1 gap-1.5 border-dashed text-slate-500 hover:text-blue-600 hover:border-blue-300"
          onClick={onAddSection}
        >
          <Plus size={13} /> Agregar sección
        </Button>
      </div>

      {/* ── Typography — Body ── */}
      <SectionHeading>Tipografía — Body</SectionHeading>
      <SettingRow label="Font Family">
        <select
          value={typography.body.fontFamily}
          onChange={(e) => setBodyProp('fontFamily', e.target.value)}
          className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white"
        >
          {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f.split(',')[0]}</option>)}
        </select>
      </SettingRow>
      <SettingRow label="Font Weight">
        <select
          value={typography.body.fontWeights[0]}
          onChange={(e) => setBodyProp('fontWeights', [e.target.value as FontWeight])}
          className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white"
        >
          {FONT_WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </SettingRow>
      <SettingRow label="Font Size (px)">
        <Input type="number" value={typography.body.fontSize} min={8} max={20}
          onChange={(e) => setBodyProp('fontSize', Number(e.target.value))}
          className="h-7 text-xs" />
      </SettingRow>
      <SettingRow label="Line Height">
        <Input type="number" value={typography.body.lineHeight} min={1} max={3} step={0.05}
          onChange={(e) => setBodyProp('lineHeight', Number(e.target.value))}
          className="h-7 text-xs" />
      </SettingRow>

      {/* ── Typography — Heading ── */}
      <SectionHeading>Tipografía — Heading</SectionHeading>
      <SettingRow label="Font Family">
        <select value={typography.heading.fontFamily}
          onChange={(e) => setHeadingProp('fontFamily', e.target.value)}
          className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white">
          {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f.split(',')[0]}</option>)}
        </select>
      </SettingRow>
      <SettingRow label="Font Weight">
        <select value={typography.heading.fontWeights[0]}
          onChange={(e) => setHeadingProp('fontWeights', [e.target.value as FontWeight])}
          className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white">
          {FONT_WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </SettingRow>
      <SettingRow label="Font Size (px)">
        <Input type="number" value={typography.heading.fontSize} min={8} max={32}
          onChange={(e) => setHeadingProp('fontSize', Number(e.target.value))}
          className="h-7 text-xs" />
      </SettingRow>
      <SettingRow label="Line Height">
        <Input type="number" value={typography.heading.lineHeight} min={1} max={3} step={0.05}
          onChange={(e) => setHeadingProp('lineHeight', Number(e.target.value))}
          className="h-7 text-xs" />
      </SettingRow>

      {/* ── Design ── */}
      <SectionHeading>Diseño</SectionHeading>
      <ColorInput label="Color primario" value={design.colors.primary}
        onChange={(v) => onUpdateDesign({ ...design, colors: { ...design.colors, primary: v } })} />
      <ColorInput label="Color de texto" value={design.colors.text}
        onChange={(v) => onUpdateDesign({ ...design, colors: { ...design.colors, text: v } })} />
      <ColorInput label="Fondo" value={design.colors.background}
        onChange={(v) => onUpdateDesign({ ...design, colors: { ...design.colors, background: v } })} />

      {/* ── Página ── */}
      <SectionHeading>Página</SectionHeading>
      <SettingRow label="Idioma">
        <select value={page.locale}
          onChange={(e) => onUpdatePage({ ...page, locale: e.target.value })}
          className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white">
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </SettingRow>
      <SettingRow label="Formato">
        <div className="flex gap-1">
          {(['a4', 'letter', 'free-form'] as PageFormat[]).map((f) => (
            <button key={f} type="button"
              onClick={() => onUpdatePage({ ...page, format: f })}
              className={cn(
                'flex-1 text-xs py-1 rounded border transition-colors',
                page.format === f
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-blue-300'
              )}>
                {f.toUpperCase()}
            </button>
          ))}
        </div>
      </SettingRow>
      <SettingRow label="Margen X (mm)">
        <Input type="number" value={page.marginX} min={0} max={50}
          onChange={(e) => onUpdatePage({ ...page, marginX: Number(e.target.value) })}
          className="h-7 text-xs" />
      </SettingRow>
      <SettingRow label="Margen Y (mm)">
        <Input type="number" value={page.marginY} min={0} max={50}
          onChange={(e) => onUpdatePage({ ...page, marginY: Number(e.target.value) })}
          className="h-7 text-xs" />
      </SettingRow>
      <SettingRow label="Gap X (px)">
        <Input type="number" value={page.gapX} min={0} max={80}
          onChange={(e) => onUpdatePage({ ...page, gapX: Number(e.target.value) })}
          className="h-7 text-xs" />
      </SettingRow>
      <SettingRow label="Gap Y (px)">
        <Input type="number" value={page.gapY} min={0} max={80}
          onChange={(e) => onUpdatePage({ ...page, gapY: Number(e.target.value) })}
          className="h-7 text-xs" />
      </SettingRow>

      <div className="h-6" /> {/* bottom breathing room */}
    </div>
  );
}
