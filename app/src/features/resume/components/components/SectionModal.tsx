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
  Resume, ExperienceEntry, EducationEntry, SkillsData,
  CertificationEntry, LanguageEntry,
} from '@/shared/types/resume';
import {
  createExperienceEntry, createEducationEntry, createSkillCategory,
  createCertificationEntry, createLanguageEntry,
} from '@/shared/types/resume';
import { SECTION_META } from './CollapsibleSections';

interface SectionModalProps {
  categoryId: string;
  /** ID of the specific entry to focus, or null = add a new entry */
  targetItemId: string | null;
  profile: Resume['profile'];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillsData;
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  onProfileChange:        (p: Resume['profile']) => void;
  onExperienceChange:     (e: ExperienceEntry[]) => void;
  onEducationChange:      (e: EducationEntry[]) => void;
  onSkillsChange:         (s: SkillsData) => void;
  onCertificationsChange: (c: CertificationEntry[]) => void;
  onLanguagesChange:      (l: LanguageEntry[]) => void;
  onClose: () => void;
}

// ── Single-entry wrappers ──────────────────────────────────────────────────────
// Each section component operates on arrays. For single-item mode we wrap/unwrap.

function SingleExperience({ entry, onChange }: {
  entry: ExperienceEntry;
  onChange: (e: ExperienceEntry) => void;
}) {
  return <ExperienceSection entries={[entry]} onChange={([updated]) => onChange(updated)} />;
}
function SingleEducation({ entry, onChange }: {
  entry: EducationEntry;
  onChange: (e: EducationEntry) => void;
}) {
  return <EducationSection entries={[entry]} onChange={([updated]) => onChange(updated)} />;
}
function SingleCertification({ entry, onChange }: {
  entry: CertificationEntry;
  onChange: (c: CertificationEntry) => void;
}) {
  return <CertificationsSection entries={[entry]} onChange={([updated]) => onChange(updated)} />;
}
function SingleLanguage({ entry, onChange }: {
  entry: LanguageEntry;
  onChange: (l: LanguageEntry) => void;
}) {
  return <LanguagesSection entries={[entry]} onChange={([updated]) => onChange(updated)} />;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function SectionModal({
  categoryId, targetItemId,
  profile, experience, education, skills, certifications, languages,
  onProfileChange, onExperienceChange, onEducationChange,
  onSkillsChange, onCertificationsChange, onLanguagesChange,
  onClose,
}: SectionModalProps) {
  const meta  = SECTION_META[categoryId];
  const isNew = targetItemId === null && categoryId !== 'profile';

  // ── Local state per section type ──────────────────────────────
  // Profile — always full form
  const [localProfile, setLocalProfile] = useState(profile);

  // List sections with single-entry mode
  const initEntry = <T extends { id: string }>(
    list: T[], create: () => T,
  ): T => {
    if (isNew) return create();
    return list.find(x => x.id === targetItemId) ?? create();
  };

  const [localExp,   setLocalExp]  = useState(() => initEntry(experience,     createExperienceEntry));
  const [localEdu,   setLocalEdu]  = useState(() => initEntry(education,      createEducationEntry));
  const [localSkill, setLocalSkill]= useState(() =>
    isNew ? createSkillCategory() : (skills.categories.find(c => c.id === targetItemId) ?? createSkillCategory())
  );
  const [localCert,  setLocalCert] = useState(() => initEntry(certifications, createCertificationEntry));
  const [localLang,  setLocalLang] = useState(() => initEntry(languages,      createLanguageEntry));

  const title = isNew
    ? `Nueva ${meta?.label ?? categoryId}`
    : meta?.label ?? categoryId;

  const handleSave = () => {
    switch (categoryId) {
      case 'profile':
        onProfileChange(localProfile);
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
        onSkillsChange({
          categories: isNew
            ? [...skills.categories, localSkill]
            : skills.categories.map(c => c.id === targetItemId ? localSkill : c),
        });
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
      case 'profile':
        return <ProfileSection data={localProfile} onChange={setLocalProfile} />;
      case 'experience':
        return <SingleExperience entry={localExp} onChange={setLocalExp} />;
      case 'education':
        return <SingleEducation entry={localEdu} onChange={setLocalEdu} />;
      case 'skills': {
        // Skills modal shows full SkillsSection but with just the one category being edited
        const wrapped: SkillsData = { categories: [localSkill] };
        return (
          <SkillsSection
            data={wrapped}
            onChange={(s) => setLocalSkill(s.categories[0])}
          />
        );
      }
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderContent()}
        </div>

        {/* Footer */}
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
