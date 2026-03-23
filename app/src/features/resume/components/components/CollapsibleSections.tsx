import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Resume, ExperienceEntry, EducationEntry, SkillsData, CertificationEntry, LanguageEntry } from '@/shared/types/resume';
import { SectionModal } from './SectionModal';
import { cn } from '@/lib/utils';

// ── Section metadata ──────────────────────────────────────────────────────────

export const SECTION_META: Record<string, { label: string; emoji: string }> = {
  profile:        { label: 'Perfil',          emoji: '👤' },
  experience:     { label: 'Experiencia',     emoji: '💼' },
  education:      { label: 'Educación',       emoji: '🎓' },
  skills:         { label: 'Habilidades',     emoji: '🛠️' },
  certifications: { label: 'Certificaciones', emoji: '📜' },
  languages:      { label: 'Idiomas',         emoji: '🌐' },
};

// ── Sub-item helpers (returns display text for each entry) ────────────────────

function getSubItems(
  categoryId: string,
  experience: ExperienceEntry[],
  education: EducationEntry[],
  skills: SkillsData,
  certifications: CertificationEntry[],
  languages: LanguageEntry[],
): { id: string; primary: string; secondary?: string }[] {
  switch (categoryId) {
    case 'experience':
      return experience.map(e => ({
        id: e.id,
        primary: e.position || 'Sin título',
        secondary: e.company || undefined,
      }));
    case 'education':
      return education.map(e => ({
        id: e.id,
        primary: e.institution || 'Sin institución',
        secondary: e.degree || undefined,
      }));
    case 'skills':
      return skills.categories.map(c => ({
        id: c.id,
        primary: c.name || 'Sin nombre',
        secondary: c.items.length ? `${c.items.length} habilidades` : undefined,
      }));
    case 'certifications':
      return certifications.map(c => ({
        id: c.id,
        primary: c.name || 'Sin nombre',
        secondary: c.issuer || undefined,
      }));
    case 'languages':
      return languages.map(l => ({
        id: l.id,
        primary: l.language || 'Sin idioma',
        secondary: l.proficiency,
      }));
    default:
      return [];
  }
}

// ── Sortable sub-item row ─────────────────────────────────────────────────────

interface SubItemRowProps {
  id: string;
  primary: string;
  secondary?: string;
  onClick: () => void;
}

function SubItemRow({ id, primary, secondary, onClick }: SubItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        'flex items-center gap-2 pl-7 pr-2 py-1.5 rounded hover:bg-blue-50/60 cursor-pointer group',
        isDragging && 'shadow ring-1 ring-blue-300',
      )}
      onClick={onClick}
    >
      {/* Drag grip */}
      <button
        type="button"
        className="cursor-grab text-slate-200 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity touch-none shrink-0"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={13} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{primary}</p>
        {secondary && <p className="text-[10px] text-slate-400 truncate">{secondary}</p>}
      </div>
    </div>
  );
}

// ── Section group (header + expanded sub-items) ───────────────────────────────

interface SectionGroupProps {
  categoryId: string;
  subItems: { id: string; primary: string; secondary?: string }[];
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (itemId: string) => void;
  onAddItem: () => void;
  onReorderItems: (newIds: string[]) => void;
}

function SectionGroup({
  categoryId, subItems, isExpanded, onToggle, onItemClick, onAddItem, onReorderItems,
}: SectionGroupProps) {
  const meta = SECTION_META[categoryId] ?? { label: categoryId, emoji: '📄' };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = subItems.findIndex(i => i.id === active.id);
    const newIdx = subItems.findIndex(i => i.id === over.id);
    onReorderItems(arrayMove(subItems.map(i => i.id), oldIdx, newIdx));
  };

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      {/* Section header */}
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <span className="text-sm shrink-0">{meta.emoji}</span>
        <span className="flex-1 text-left text-sm font-medium text-slate-700">{meta.label}</span>
        {subItems.length > 0 && (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {subItems.length}
          </span>
        )}
        {isExpanded
          ? <ChevronDown size={13} className="text-slate-400 shrink-0" />
          : <ChevronRight size={13} className="text-slate-300 shrink-0" />}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          {subItems.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={subItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {subItems.map(item => (
                  <SubItemRow
                    key={item.id}
                    id={item.id}
                    primary={item.primary}
                    secondary={item.secondary}
                    onClick={() => onItemClick(item.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="pl-8 pr-3 py-2 text-[11px] text-slate-400 italic">Sin entradas</p>
          )}

          {/* Add entry button (not shown for profile) */}
          {categoryId !== 'profile' && (
            <div className="px-3 py-2 border-t border-slate-100">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddItem(); }}
                className="flex items-center gap-1.5 text-[11px] text-blue-500 hover:text-blue-700 font-medium"
              >
                <Plus size={12} /> Agregar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main CollapsibleSections ──────────────────────────────────────────────────

interface CollapsibleSectionsProps {
  profile: Resume['profile'];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillsData;
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  enabledCategories: string[];
  onProfileChange:        (p: Resume['profile']) => void;
  onExperienceChange:     (e: ExperienceEntry[]) => void;
  onEducationChange:      (e: EducationEntry[]) => void;
  onSkillsChange:         (s: SkillsData) => void;
  onCertificationsChange: (c: CertificationEntry[]) => void;
  onLanguagesChange:      (l: LanguageEntry[]) => void;
  onAddSection: () => void;
}

// Modal target — which section + which item (or null = add new)
interface ModalTarget {
  categoryId: string;
  itemId: string | null; // null = new entry
}

export function CollapsibleSections({
  profile, experience, education, skills, certifications, languages,
  enabledCategories,
  onProfileChange, onExperienceChange, onEducationChange,
  onSkillsChange, onCertificationsChange, onLanguagesChange,
  onAddSection,
}: CollapsibleSectionsProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['profile']));
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);

  const toggleSection = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Reorder sub-items within a section
  const handleReorderItems = (categoryId: string, newIds: string[]) => {
    switch (categoryId) {
      case 'experience': {
        const map = Object.fromEntries(experience.map(e => [e.id, e]));
        onExperienceChange(newIds.map(id => map[id]).filter(Boolean));
        break;
      }
      case 'education': {
        const map = Object.fromEntries(education.map(e => [e.id, e]));
        onEducationChange(newIds.map(id => map[id]).filter(Boolean));
        break;
      }
      case 'skills': {
        const map = Object.fromEntries(skills.categories.map(c => [c.id, c]));
        onSkillsChange({ categories: newIds.map(id => map[id]).filter(Boolean) });
        break;
      }
      case 'certifications': {
        const map = Object.fromEntries(certifications.map(c => [c.id, c]));
        onCertificationsChange(newIds.map(id => map[id]).filter(Boolean));
        break;
      }
      case 'languages': {
        const map = Object.fromEntries(languages.map(l => [l.id, l]));
        onLanguagesChange(newIds.map(id => map[id]).filter(Boolean));
        break;
      }
    }
  };

  const dataProps = {
    profile, experience, education, skills, certifications, languages,
    onProfileChange, onExperienceChange, onEducationChange,
    onSkillsChange, onCertificationsChange, onLanguagesChange,
  };

  return (
    <div className="flex flex-col gap-1.5 p-3">
      {enabledCategories.map(catId => {
        const subItems = catId === 'profile'
          ? []
          : getSubItems(catId, experience, education, skills, certifications, languages);

        return (
          <SectionGroup
            key={catId}
            categoryId={catId}
            subItems={subItems}
            isExpanded={expanded.has(catId)}
            onToggle={() => toggleSection(catId)}
            onItemClick={(itemId) => setModalTarget({ categoryId: catId, itemId })}
            onAddItem={() => setModalTarget({ categoryId: catId, itemId: null })}
            onReorderItems={(newIds) => handleReorderItems(catId, newIds)}
          />
        );
      })}

      {/* Profile: clicking header opens modal directly */}
      {/* (handled in SectionGroup — profile has no sub-items, so click header = open modal) */}

      <button
        onClick={onAddSection}
        className="flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors text-sm font-medium mt-1"
      >
        <Plus size={14} /> Agregar sección
      </button>

      {modalTarget && (
        <SectionModal
          categoryId={modalTarget.categoryId}
          targetItemId={modalTarget.itemId}
          {...dataProps}
          onClose={() => setModalTarget(null)}
        />
      )}
    </div>
  );
}
