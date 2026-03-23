import { Plus, X } from 'lucide-react';
import type { LanguageItem } from '@resumate/schema';
import { createLanguageItem } from '@resumate/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LanguagesSectionProps {
  entries: LanguageItem[];
  onChange: (entries: LanguageItem[]) => void;
}

export function LanguagesSection({ entries, onChange }: LanguagesSectionProps) {
  const handleAdd = () => onChange([...entries, createLanguageItem()]);
  const handleRemove = (id: string) => onChange(entries.filter(e => e.id !== id));
  const handleUpdate = (id: string, field: keyof LanguageItem, value: string) =>
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
                <Input
                  value={entry.fluency}
                  onChange={(e) => handleUpdate(entry.id, 'fluency', e.target.value)}
                  placeholder="ej: Nativo, Fluido, Profesional"
                />
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
