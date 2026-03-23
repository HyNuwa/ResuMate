import { Plus, X } from 'lucide-react';
import type { LanguageEntry } from '@/shared/types/resume';
import { createLanguageEntry } from '@/shared/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LanguagesSectionProps {
  entries: LanguageEntry[];
  onChange: (entries: LanguageEntry[]) => void;
}

const proficiencyLevels: Array<LanguageEntry['proficiency']> = [
  'Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'
];

const proficiencyLabels: Record<LanguageEntry['proficiency'], string> = {
  'Native': 'Nativo', 'Fluent': 'Fluido', 'Professional': 'Profesional',
  'Intermediate': 'Intermedio', 'Basic': 'Básico'
};

export function LanguagesSection({ entries, onChange }: LanguagesSectionProps) {
  const handleAdd = () => onChange([...entries, createLanguageEntry()]);
  const handleRemove = (id: string) => onChange(entries.filter(e => e.id !== id));
  const handleUpdate = (id: string, field: keyof LanguageEntry, value: string) =>
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e));

  return (
    <div className="cv-section">
      <h2 className="section-title">Idiomas</h2>

      <div className="languages-list">
        {entries.map(entry => (
          <div key={entry.id} className="language-card">
            <div className="form-grid">
              <div className="form-field">
                <Label>Idioma</Label>
                <Input
                  value={entry.language}
                  onChange={(e) => handleUpdate(entry.id, 'language', e.target.value)}
                  placeholder="ej: Inglés"
                />
              </div>

              <div className="form-field">
                <Label>Nivel de Dominio</Label>
                <select
                  className="input"
                  value={entry.proficiency}
                  onChange={(e) => handleUpdate(entry.id, 'proficiency', e.target.value)}
                >
                  {proficiencyLevels.map(level => (
                    <option key={level} value={level}>{proficiencyLabels[level]}</option>
                  ))}
                </select>
              </div>

              <div className="form-field flex items-end">
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleRemove(entry.id)}
                  title="Eliminar idioma"
                >
                  <X size={15} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full mt-3 gap-2 border-dashed">
        <Plus size={15} /> Añadir Idioma
      </Button>
    </div>
  );
}
