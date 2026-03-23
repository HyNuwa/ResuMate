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
import type {
  Basics,
  ExperienceItem,
  EducationItem,
  SkillItem,
  CertificationItem,
  LanguageItem,
} from '@resumate/schema';
import { ProfileSection } from '../sections/sections/ProfileSection';
import { ExperienceSection } from '../sections/sections/ExperienceSection';
import { EducationSection } from '../sections/sections/EducationSection';
import { SkillsSection } from '../sections/sections/SkillsSection';
import { CertificationsSection } from '../sections/sections/CertificationsSection';
import { LanguagesSection } from '../sections/sections/LanguagesSection';

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

interface SectionContentProps {
  categoryId: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  onExperienceChange: (experience: ExperienceItem[]) => void;
  onEducationChange: (education: EducationItem[]) => void;
  onSkillsChange: (skills: SkillItem[]) => void;
  onCertificationsChange: (certifications: CertificationItem[]) => void;
  onLanguagesChange: (languages: LanguageItem[]) => void;
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

interface DynamicSectionsProps {
  basics: Basics;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  enabledCategories: string[];
  onBasicsChange: (basics: Basics) => void;
  onExperienceChange: (experience: ExperienceItem[]) => void;
  onEducationChange: (education: EducationItem[]) => void;
  onSkillsChange: (skills: SkillItem[]) => void;
  onCertificationsChange: (certifications: CertificationItem[]) => void;
  onLanguagesChange: (languages: LanguageItem[]) => void;
  onRemoveCategory: (categoryId: string) => void;
  onReorderCategories: (newOrder: string[]) => void;
}

export function DynamicSections({
  basics, experience, education, skills, certifications, languages,
  enabledCategories,
  onBasicsChange, onExperienceChange, onEducationChange,
  onSkillsChange, onCertificationsChange, onLanguagesChange,
  onRemoveCategory, onReorderCategories,
}: DynamicSectionsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const draggableIds = enabledCategories.filter(id => id !== 'basics');

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
      <ProfileSection data={basics} onChange={onBasicsChange} />

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
