import { Plus, X } from 'lucide-react';
import type { LanguageEntry } from '@/shared/types/resume';
import { createLanguageEntry } from '@/shared/types/resume';

interface LanguagesSectionProps {
  entries: LanguageEntry[];
  onChange: (entries: LanguageEntry[]) => void;
}

const proficiencyLevels: Array<LanguageEntry['proficiency']> = [
  'Native',
  'Fluent',
  'Professional',
  'Intermediate',
  'Basic'
];

const proficiencyLabels: Record<LanguageEntry['proficiency'], string> = {
  'Native': 'Nativo',
  'Fluent': 'Fluido',
  'Professional': 'Profesional',
  'Intermediate': 'Intermedio',
  'Basic': 'Básico'
};

export function LanguagesSection({ entries, onChange }: LanguagesSectionProps) {
  const handleAdd = () => {
    onChange([...entries, createLanguageEntry()]);
  };

  const handleRemove = (id: string) => {
    onChange(entries.filter(entry => entry.id !== id));
  };

  const handleUpdate = (id: string, field: keyof LanguageEntry, value: string) => {
    onChange(entries.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Idiomas</h2>
      
      <div className="languages-list">
        {entries.map(entry => (
          <div key={entry.id} className="language-card">
            <div className="form-grid">
              <div className="form-field">
                <label>Idioma</label>
                <input
                  type="text"
                  className="input"
                  value={entry.language}
                  onChange={(e) => handleUpdate(entry.id, 'language', e.target.value)}
                  placeholder="ej: Inglés"
                />
              </div>

              <div className="form-field">
                <label>Nivel de Dominio</label>
                <select
                  className="input"
                  value={entry.proficiency}
                  onChange={(e) => handleUpdate(entry.id, 'proficiency', e.target.value)}
                >
                  {proficiencyLevels.map(level => (
                    <option key={level} value={level}>
                      {proficiencyLabels[level]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => handleRemove(entry.id)}
                  title="Eliminar idioma"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-add" onClick={handleAdd}>
        <Plus size={16} />
        Añadir Idioma
      </button>
    </div>
  );
}
