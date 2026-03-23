import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileSection } from '../sections/sections/ProfileSection';
import { ExperienceSection } from '../sections/sections/ExperienceSection';
import { EducationSection } from '../sections/sections/EducationSection';
import { SkillsSection } from '../sections/sections/SkillsSection';
import { CertificationsSection } from '../sections/sections/CertificationsSection';
import { LanguagesSection } from '../sections/sections/LanguagesSection';
import type {
  Basics,
  ExperienceItem,
  EducationItem,
  SkillItem,
  CertificationItem,
  LanguageItem,
} from '@resumate/schema';
import {
  createExperienceItem,
  createEducationItem,
  createSkillItem,
  createCertificationItem,
  createLanguageItem,
} from '@resumate/schema';
import { SECTION_META } from './CollapsibleSections';

interface SectionModalProps {
  categoryId: string;
  targetItemId: string | null;
  basics: Basics;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  onBasicsChange:        (b: Basics) => void;
  onExperienceChange:    (e: ExperienceItem[]) => void;
  onEducationChange:     (e: EducationItem[]) => void;
  onSkillsChange:        (s: SkillItem[]) => void;
  onCertificationsChange: (c: CertificationItem[]) => void;
  onLanguagesChange:     (l: LanguageItem[]) => void;
  onClose: () => void;
}

function SingleExperience({ entry, onChange }: {
  entry: ExperienceItem;
  onChange: (e: ExperienceItem) => void;
}) {
  return <ExperienceSection entries={[entry]} onChange={([updated]) => onChange(updated)} />;
}
function SingleEducation({ entry, onChange }: {
  entry: EducationItem;
  onChange: (e: EducationItem) => void;
}) {
  return <EducationSection entries={[entry]} onChange={([updated]) => onChange(updated)} />;
}
function SingleCertification({ entry, onChange }: {
  entry: CertificationItem;
  onChange: (c: CertificationItem) => void;
}) {
  return <CertificationsSection entries={[entry]} onChange={([updated]) => onChange(updated)} />;
}
function SingleLanguage({ entry, onChange }: {
  entry: LanguageItem;
  onChange: (l: LanguageItem) => void;
}) {
  return <LanguagesSection entries={[entry]} onChange={([updated]) => onChange(updated)} />;
}

export function SectionModal({
  categoryId, targetItemId,
  basics, experience, education, skills, certifications, languages,
  onBasicsChange, onExperienceChange, onEducationChange,
  onSkillsChange, onCertificationsChange, onLanguagesChange,
  onClose,
}: SectionModalProps) {
  const meta  = SECTION_META[categoryId];
  const isNew = targetItemId === null && categoryId !== 'basics';

  const [localBasics, setLocalBasics] = useState(basics);

  const initEntry = <T extends { id: string }>(
    list: T[], create: () => T,
  ): T => {
    if (isNew) return create();
    return list.find(x => x.id === targetItemId) ?? create();
  };

  const [localExp,   setLocalExp]  = useState(() => initEntry(experience,     createExperienceItem));
  const [localEdu,   setLocalEdu]  = useState(() => initEntry(education,      createEducationItem));
  const [localSkill, setLocalSkill]= useState(() =>
    isNew ? createSkillItem() : (skills.find(s => s.id === targetItemId) ?? createSkillItem())
  );
  const [localCert,  setLocalCert] = useState(() => initEntry(certifications, createCertificationItem));
  const [localLang,  setLocalLang] = useState(() => initEntry(languages,      createLanguageItem));

  const title = isNew
    ? `Nueva ${meta?.label ?? categoryId}`
    : meta?.label ?? categoryId;

  const handleSave = () => {
    switch (categoryId) {
      case 'basics':
        onBasicsChange(localBasics);
        break;
      case 'experience':
        onExperienceChange(
          isNew ? [...experience, localExp]
                : experience.map(e => e.id === targetItemId ? localExp : e)
        );
        break;
      case 'education':
        onEducationChange(
          isNew ? [...education, localEdu]
                : education.map(e => e.id === targetItemId ? localEdu : e)
        );
        break;
      case 'skills':
        onSkillsChange(
          isNew
            ? [...skills, localSkill]
            : skills.map(s => s.id === targetItemId ? localSkill : s)
        );
        break;
      case 'certifications':
        onCertificationsChange(
          isNew ? [...certifications, localCert]
                : certifications.map(c => c.id === targetItemId ? localCert : c)
        );
        break;
      case 'languages':
        onLanguagesChange(
          isNew ? [...languages, localLang]
                : languages.map(l => l.id === targetItemId ? localLang : l)
        );
        break;
    }
    onClose();
  };

  const renderContent = () => {
    switch (categoryId) {
      case 'basics':
        return <ProfileSection data={localBasics} onChange={setLocalBasics} />;
      case 'experience':
        return <SingleExperience entry={localExp} onChange={setLocalExp} />;
      case 'education':
        return <SingleEducation entry={localEdu} onChange={setLocalEdu} />;
      case 'skills':
        return (
          <SkillsSection
            data={[localSkill]}
            onChange={([updated]) => setLocalSkill(updated)}
          />
        );
      case 'certifications':
        return <SingleCertification entry={localCert} onChange={setLocalCert} />;
      case 'languages':
        return <SingleLanguage entry={localLang} onChange={setLocalLang} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-xl max-h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderContent()}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
