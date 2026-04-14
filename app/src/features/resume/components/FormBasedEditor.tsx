import { useRef, useState, useCallback, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { EditorTopBar } from './EditorTopBar';
import { PreviewToolbar } from './PreviewToolbar';
import { CollapsibleSections } from './CollapsibleSections';
import { SettingsPanel } from './SettingsPanel';
import { ResumePreview } from './preview/ResumePreview';
import {
  useResumeStore,
  selectResume,
  selectBasics,
  selectSections,
  selectMetadata,
  selectIsNewCV,
} from '../stores/useResumeStore';
import { useEditorHistoryStore } from '../stores/useHistoryStore';
import { useFormAutoSave } from '@/shared/hooks/useFormAutoSave';
import { useCreateCV, useUpdateCV } from '@/shared/hooks/useQueryCVs';
import { logger } from '@/shared/utils/logger';

interface ResizeHandleProps {
  onDrag: (dx: number) => void;
  side: 'right' | 'left';
}

function ResizeHandle({ onDrag, side }: ResizeHandleProps) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastX.current = e.clientX;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      onDrag(ev.clientX - lastX.current);
      lastX.current = ev.clientX;
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      onMouseDown={onMouseDown}
      className={`
        w-1 shrink-0 cursor-col-resize select-none
        hover:bg-blue-400 active:bg-blue-500 transition-colors
        ${side === 'right' ? 'border-r border-slate-200' : 'border-l border-slate-200'}
      `}
      title="Arrastrar para redimensionar"
    />
  );
}

const MIN_PANEL = 200;
const MAX_PANEL = 520;
const DEFAULT_W = 260;

const PAGE_DIMENSIONS: Record<string, { width: string; minHeight: string }> = {
  'a4': { width: '794px', minHeight: '1123px' },
  'letter': { width: '816px', minHeight: '1056px' },
  'free-form': { width: '794px', minHeight: 'auto' },
};

export interface FormBasedEditorProps {
  initialTemplate?: string;
}

export function FormBasedEditor({ initialTemplate }: FormBasedEditorProps = {}) {
  const resume = useResumeStore(selectResume);
  const basics = useResumeStore(selectBasics);
  const sections = useResumeStore(selectSections);
  const metadata = useResumeStore(selectMetadata);
  const isNewCV = useResumeStore(selectIsNewCV);

  const { updateBasics, updateExperience, updateEducation, updateSkills, updateLanguages, updateCertifications, updateTitle, updateMetadata, toggleSectionHidden, reorderSections } = useResumeStore();

  const { undo, redo } = useEditorHistoryStore();
  const canUndo = useEditorHistoryStore((s) => s.index > 0);
  const canRedo = useEditorHistoryStore((s) => s.index < s.snapshots.length - 1);

  useEffect(() => {
    if (initialTemplate) {
      updateMetadata({ template: initialTemplate });
    }
  }, []);

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(DEFAULT_W);
  const [rightWidth, setRightWidth] = useState(DEFAULT_W);
  const [, setShowCategorySelector] = useState(false);

  const resizeLeft = useCallback((dx: number) =>
    setLeftWidth((w) => Math.min(MAX_PANEL, Math.max(MIN_PANEL, w + dx))), []);
  const resizeRight = useCallback((dx: number) =>
    setRightWidth((w) => Math.min(MAX_PANEL, Math.max(MIN_PANEL, w - dx))), []);

  const zoomRef = useRef<ReactZoomPanPinchRef>(null!);

  const { mutateAsync: createCV } = useCreateCV();
  const { mutateAsync: updateCV } = useUpdateCV();

  const { handleChange, saveStatus } = useFormAutoSave({
    saveFn: async () => {
      try {
        if (!isNewCV && resume.metadata.notes) {
          await updateCV({ id: resume.metadata.notes, data: resume });
        } else {
          const saved = await createCV(resume);
          if (saved?.id) {
            updateMetadata({ notes: saved.id });
          }
        }
      } catch (err) {
        logger.error('Auto-save failed:', err);
        throw err;
      }
    },
    delay: 1500,
  });

  const enabledCategories = ['basics', 'experience', 'education', 'skills', 'certifications', 'languages'];

  const title = metadata.notes || 'Untitled CV';

  const paperStyle: React.CSSProperties = {
    width: PAGE_DIMENSIONS[metadata.page.format]?.width ?? '794px',
    minHeight: PAGE_DIMENSIONS[metadata.page.format]?.minHeight ?? '1123px',
    backgroundColor: metadata.design.colors.background,
    boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
    padding: `${metadata.page.marginY}mm ${metadata.page.marginX}mm`,
    '--preview-font-body': metadata.typography.body.fontFamily,
    '--preview-weight-body': metadata.typography.body.fontWeights[0],
    '--preview-size-body': `${metadata.typography.body.fontSize}px`,
    '--preview-lh-body': String(metadata.typography.body.lineHeight),
    '--preview-font-heading': metadata.typography.heading.fontFamily,
    '--preview-weight-heading': metadata.typography.heading.fontWeights[0],
    '--preview-size-heading': `${metadata.typography.heading.fontSize}px`,
    '--preview-lh-heading': String(metadata.typography.heading.lineHeight),
    '--preview-color-primary': metadata.design.colors.primary,
    '--preview-color-text': metadata.design.colors.text,
    '--preview-color-bg': metadata.design.colors.background,
  } as React.CSSProperties;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      <EditorTopBar
        title={title}
        onTitleChange={(t) => handleChange(() => updateTitle(t))}
        saveStatus={saveStatus}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => setLeftOpen(v => !v)}
        onToggleRight={() => setRightOpen(v => !v)}
      />
      <PreviewToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        zoomRef={zoomRef}
        resume={resume}
      />

      <div className="flex flex-1 overflow-hidden">

        {leftOpen && (
          <>
            <aside
              className="shrink-0 bg-white border-r border-slate-200 overflow-y-auto flex flex-col"
              style={{ width: leftWidth }}
            >
              <div className="px-4 pt-3 pb-1 shrink-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Contenido</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CollapsibleSections
                  basics={basics}
                  experience={sections.experience.items}
                  education={sections.education.items}
                  skills={sections.skills.items}
                  certifications={sections.certifications.items}
                  languages={sections.languages.items}
                  enabledCategories={enabledCategories}
                  onBasicsChange={(b) => handleChange(() => updateBasics(b))}
                  onExperienceChange={(e) => handleChange(() => updateExperience(e))}
                  onEducationChange={(e) => handleChange(() => updateEducation(e))}
                  onSkillsChange={(s) => handleChange(() => updateSkills(s))}
                  onCertificationsChange={(c) => handleChange(() => updateCertifications(c))}
                  onLanguagesChange={(l) => handleChange(() => updateLanguages(l))}
                  onAddSection={() => setShowCategorySelector(true)}
                />
              </div>
            </aside>
            <ResizeHandle onDrag={resizeLeft} side="right" />
          </>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden bg-slate-300/50">
            <TransformWrapper
              ref={zoomRef}
              initialScale={0.85}
              minScale={0.25}
              maxScale={2.5}
              centerOnInit
              wheel={{ step: 0.05 }}
            >
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px' }}
              >
                <div style={paperStyle}>
                  <ResumePreview resume={resume} />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>

        {rightOpen && (
          <>
            <ResizeHandle onDrag={resizeRight} side="left" />
            <aside
              className="shrink-0 overflow-hidden flex flex-col"
              style={{ width: rightWidth }}
            >
              <SettingsPanel
                metadata={metadata}
                enabledCategories={enabledCategories}
                onUpdateTypography={(t) => handleChange(() => updateMetadata({ typography: t }))}
                onUpdateDesign={(d) => handleChange(() => updateMetadata({ design: d }))}
                onUpdatePage={(p) => handleChange(() => updateMetadata({ page: p }))}
                onReorderCategories={(order) => handleChange(() => reorderSections(order))}
                onRemoveCategory={(id) => handleChange(() => toggleSectionHidden(id, true))}
                onAddSection={() => setShowCategorySelector(true)}
              />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
