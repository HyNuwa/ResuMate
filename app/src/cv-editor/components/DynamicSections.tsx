import { X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Resume, ExperienceEntry, EducationEntry, SkillsData, CertificationEntry, LanguageEntry } from '@/shared/types/resume';
import { ProfileSection } from '../sections/ProfileSection';
import { ExperienceSection } from '../sections/ExperienceSection';
import { EducationSection } from '../sections/EducationSection';
import { SkillsSection } from '../sections/SkillsSection';
import { CertificationsSection } from '../sections/CertificationsSection';
import { LanguagesSection } from '../sections/LanguagesSection';

// ---- Sortable wrapper for each draggable section ----

interface SortableSectionProps {
  id: string;
  onRemove: () => void;
  children: React.ReactNode;
}

function SortableSection({ id, onRemove, children }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="section-wrapper">
      {/* Drag handle */}
      <button
        className="drag-handle"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        type="button"
        aria-label="Drag to reorder section"
      >
        <GripVertical size={16} />
      </button>

      {/* Remove button */}
      <button
        className="remove-category-btn"
        onClick={onRemove}
        title="Eliminar sección"
        type="button"
      >
        <X size={14} />
      </button>

      {children}
    </div>
  );
}

// ---- Section content renderer ----

interface SectionContentProps {
  categoryId: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillsData;
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  onExperienceChange: (experience: ExperienceEntry[]) => void;
  onEducationChange: (education: EducationEntry[]) => void;
  onSkillsChange: (skills: SkillsData) => void;
  onCertificationsChange: (certifications: CertificationEntry[]) => void;
  onLanguagesChange: (languages: LanguageEntry[]) => void;
}

function SectionContent({
  categoryId,
  experience, education, skills, certifications, languages,
  onExperienceChange, onEducationChange,
  onSkillsChange, onCertificationsChange, onLanguagesChange,
}: SectionContentProps) {
  switch (categoryId) {
    case 'experience':
      return <ExperienceSection entries={experience} onChange={onExperienceChange} />;
    case 'education':
      return <EducationSection entries={education} onChange={onEducationChange} />;
    case 'skills':
      return <SkillsSection data={skills} onChange={onSkillsChange} />;
    case 'certifications':
      return <CertificationsSection entries={certifications} onChange={onCertificationsChange} />;
    case 'languages':
      return <LanguagesSection entries={languages} onChange={onLanguagesChange} />;
    default:
      return null;
  }
}

// ---- Main component ----

interface DynamicSectionsProps {
  profile: Resume['profile'];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillsData;
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  enabledCategories: string[];
  onProfileChange: (profile: Resume['profile']) => void;
  onExperienceChange: (experience: ExperienceEntry[]) => void;
  onEducationChange: (education: EducationEntry[]) => void;
  onSkillsChange: (skills: SkillsData) => void;
  onCertificationsChange: (certifications: CertificationEntry[]) => void;
  onLanguagesChange: (languages: LanguageEntry[]) => void;
  onRemoveCategory: (categoryId: string) => void;
  onReorderCategories: (newOrder: string[]) => void;
}

export function DynamicSections({
  profile, experience, education, skills, certifications, languages,
  enabledCategories,
  onProfileChange, onExperienceChange, onEducationChange,
  onSkillsChange, onCertificationsChange, onLanguagesChange,
  onRemoveCategory, onReorderCategories,
}: DynamicSectionsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // require 8px of movement to prevent accidental drags
    })
  );

  // Only non-profile categories are draggable
  const draggableIds = enabledCategories.filter(id => id !== 'profile');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = draggableIds.indexOf(active.id as string);
    const newIndex = draggableIds.indexOf(over.id as string);
    onReorderCategories(arrayMove(draggableIds, oldIndex, newIndex));
  };

  const sectionContentProps = {
    experience, education, skills, certifications, languages,
    onExperienceChange, onEducationChange,
    onSkillsChange, onCertificationsChange, onLanguagesChange,
  };

  return (
    <>
      {/* Profile — always pinned at top, not draggable */}
      <ProfileSection data={profile} onChange={onProfileChange} />

      {/* Draggable sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={draggableIds} strategy={verticalListSortingStrategy}>
          {draggableIds.map((categoryId) => (
            <SortableSection
              key={categoryId}
              id={categoryId}
              onRemove={() => onRemoveCategory(categoryId)}
            >
              <SectionContent categoryId={categoryId} {...sectionContentProps} />
            </SortableSection>
          ))}
        </SortableContext>
      </DndContext>
    </>
  );
}
