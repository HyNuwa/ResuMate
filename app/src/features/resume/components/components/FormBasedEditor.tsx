import { useRef, useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { ResumeData } from '@resumate/schema';
import { DEFAULT_TYPOGRAPHY, DEFAULT_DESIGN, DEFAULT_PAGE } from '@/shared/types/resume';
import { CategorySelector } from './CategorySelector';
import { EditorTopBar } from './EditorTopBar';
import { PreviewToolbar } from './PreviewToolbar';
import { CollapsibleSections } from './CollapsibleSections';
import { SettingsPanel } from './SettingsPanel';
import { ResumePreview } from './preview/ResumePreview';
import {
  useCVStore,
  selectResume, selectProfile, selectExperience, selectEducation,
  selectSkills, selectCertifications, selectLanguages,
  selectTitle, selectEnabledCategories, selectMetadata,
  selectCanUndo, selectCanRedo,
} from '../../stores/legacy/useCVStore';
import { useFormAutoSave } from '@/shared/hooks/useFormAutoSave';
import { useCreateCV, useUpdateCV } from '@/shared/hooks/useQueryCVs';
import { logger } from '@/shared/utils/logger';

// ── Drag-resize handle ────────────────────────────────────────────────────────

interface ResizeHandleProps {
  onDrag: (dx: number) => void;
  side: 'right' | 'left'; // which border the handle lives on
}

function ResizeHandle({ onDrag, side }: ResizeHandleProps) {
  const dragging = useRef(false);
  const lastX    = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastX.current    = e.clientX;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      onDrag(ev.clientX - lastX.current);
      lastX.current = ev.clientX;
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',  onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
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

// ── FormBasedEditor ───────────────────────────────────────────────────────────

const MIN_PANEL = 200;
const MAX_PANEL = 520;
const DEFAULT_W = 260;

export function FormBasedEditor() {
  // ── Store ──────────────────────────────────────────────────────
  const resume           = useCVStore(selectResume);
  const profile          = useCVStore(selectProfile);
  const experience       = useCVStore(selectExperience);
  const education        = useCVStore(selectEducation);
  const skills           = useCVStore(selectSkills);
  const certifications   = useCVStore(selectCertifications);
  const languages        = useCVStore(selectLanguages);
  const title            = useCVStore(selectTitle);
  const enabledCategories= useCVStore(selectEnabledCategories);
  const metadata         = useCVStore(selectMetadata);
  const canUndo          = useCVStore(selectCanUndo);
  const canRedo          = useCVStore(selectCanRedo);

  const {
    setResume, updateProfile, updateExperience, updateEducation,
    updateSkills, updateCertifications, updateLanguages,
    updateTitle, updateTypography, updateDesign, updatePage,
    addCategory, removeCategory, reorderCategories, undo, redo,
  } = useCVStore();

  // ── Panel state ────────────────────────────────────────────────
  const [leftOpen,   setLeftOpen]   = useState(true);
  const [rightOpen,  setRightOpen]  = useState(true);
  const [leftWidth,  setLeftWidth]  = useState(DEFAULT_W);
  const [rightWidth, setRightWidth] = useState(DEFAULT_W);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // ── Resize callbacks ───────────────────────────────────────────
  const resizeLeft  = useCallback((dx: number) =>
    setLeftWidth( w => Math.min(MAX_PANEL, Math.max(MIN_PANEL, w + dx))), []);
  const resizeRight = useCallback((dx: number) =>
    setRightWidth(w => Math.min(MAX_PANEL, Math.max(MIN_PANEL, w - dx))), []);

  // ── Zoom ref ───────────────────────────────────────────────────
  const zoomRef = useRef<ReactZoomPanPinchRef>(null!);

  // ── Auto-save ──────────────────────────────────────────────────
  const { mutateAsync: createCV } = useCreateCV();
  const { mutateAsync: updateCV } = useUpdateCV();

  const { handleChange, saveStatus } = useFormAutoSave({
    saveFn: async () => {
      try {
        const resumeData = resume as unknown as ResumeData;
        if (resume.metadata.id && resume.metadata.id !== 'new') {
          await updateCV({ id: resume.metadata.id, data: resumeData });
        } else {
          const saved = await createCV(resumeData);
          if (saved?.id) setResume({ ...resume, metadata: { ...resume.metadata, id: saved.id } });
        }
      } catch (err) {
        logger.error('Auto-save failed:', err);
        throw err;
      }
    },
    delay: 1500,
  });

  const handleAddCategory = (categoryId: string) => {
    handleChange(() => addCategory(categoryId));
    setShowCategorySelector(false);
  };

  // ── Settings values (with safe defaults) ──────────────────────
  const typography = metadata.typography ?? DEFAULT_TYPOGRAPHY;
  const design     = metadata.design     ?? DEFAULT_DESIGN;
  const page       = metadata.page       ?? DEFAULT_PAGE;

  // ── CSS vars driven by settings ────────────────────────────────
  const paperStyle: React.CSSProperties = {
    width:           '794px',
    minHeight:       '1123px',
    backgroundColor: design.background,
    boxShadow:       '0 4px 32px rgba(0,0,0,0.18)',
    padding:         `${page.marginV}mm ${page.marginH}mm`,
    // Typography CSS vars — consumed by ResumePreview via Tailwind arbitrary values
    '--preview-font-body':      typography.body.fontFamily,
    '--preview-weight-body':    typography.body.fontWeight,
    '--preview-size-body':      `${typography.body.fontSize}px`,
    '--preview-lh-body':        String(typography.body.lineHeight),
    '--preview-font-heading':   typography.heading.fontFamily,
    '--preview-weight-heading': typography.heading.fontWeight,
    '--preview-size-heading':   `${typography.heading.fontSize}px`,
    '--preview-lh-heading':     String(typography.heading.lineHeight),
    // Color CSS vars
    '--preview-color-primary':  design.primary,
    '--preview-color-text':     design.text,
    '--preview-color-bg':       design.background,
  } as React.CSSProperties;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">

      {/* ── Top bar ── */}
      <EditorTopBar
        title={title}
        onTitleChange={(t) => handleChange(() => updateTitle(t))}
        saveStatus={saveStatus}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => setLeftOpen(v => !v)}
        onToggleRight={() => setRightOpen(v => !v)}
      />

      {/* ── Body (3-column with drag resize) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
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
                  profile={profile}
                  experience={experience}
                  education={education}
                  skills={skills}
                  certifications={certifications}
                  languages={languages}
                  enabledCategories={enabledCategories}
                  onProfileChange={(p) => handleChange(() => updateProfile(p))}
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

        {/* Center — preview */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <PreviewToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            zoomRef={zoomRef}
            resume={resume}
          />

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
                  <ResumePreview resume={resume} enabledCategories={enabledCategories} />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>

        {/* Right panel */}
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
                onUpdateTypography={(t) => handleChange(() => updateTypography(t))}
                onUpdateDesign={(d) => handleChange(() => updateDesign(d))}
                onUpdatePage={(p) => handleChange(() => updatePage(p))}
                onReorderCategories={(order) => handleChange(() => reorderCategories(order))}
                onRemoveCategory={(id) => handleChange(() => removeCategory(id))}
                onAddSection={() => setShowCategorySelector(true)}
              />
            </aside>
          </>
        )}
      </div>

      {/* Category selector modal */}
      {showCategorySelector && (
        <CategorySelector
          enabledCategories={enabledCategories}
          onAddCategory={handleAddCategory}
          onClose={() => setShowCategorySelector(false)}
        />
      )}
    </div>
  );
}
