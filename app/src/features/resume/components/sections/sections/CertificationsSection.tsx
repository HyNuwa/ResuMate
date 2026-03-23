import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { CertificationEntry } from '@/shared/types/resume';
import { createCertificationEntry } from '@/shared/types/resume';
import { MonthYearPicker } from '@/components/common/MonthYearPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CertificationsSectionProps {
  entries: CertificationEntry[];
  onChange: (entries: CertificationEntry[]) => void;
}

export function CertificationsSection({ entries, onChange }: CertificationsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const newEntry = createCertificationEntry();
    onChange([...entries, newEntry]);
    setExpandedIds(prev => new Set([...prev, newEntry.id]));
  };

  const handleRemove = (id: string) => {
    onChange(entries.filter(e => e.id !== id));
    setExpandedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleUpdate = (id: string, field: keyof CertificationEntry, value: string) =>
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e));

  const getEntryTitle = (entry: CertificationEntry) => {
    if (entry.name && entry.issuer) return `${entry.name} - ${entry.issuer}`;
    return entry.name || entry.issuer || 'Nueva Certificación';
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Certificaciones</h2>

      <div className="entries-list">
        {entries.map(entry => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header" onClick={() => toggleExpand(entry.id)}>
              <span className="entry-title">{getEntryTitle(entry)}</span>
              <div className="entry-actions">
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  onClick={(e) => { e.stopPropagation(); handleRemove(entry.id); }}
                >
                  <Trash2 size={15} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                  {expandedIds.has(entry.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </Button>
              </div>
            </div>

            {expandedIds.has(entry.id) && (
              <div className="entry-content">
                <div className="form-grid">
                  <div className="form-field full-width">
                    <Label>Nombre de la Certificación</Label>
                    <Input value={entry.name} onChange={(e) => handleUpdate(entry.id, 'name', e.target.value)} placeholder="ej: AWS Certified Solutions Architect" />
                  </div>
                  <div className="form-field full-width">
                    <Label>Organización Emisora</Label>
                    <Input value={entry.issuer} onChange={(e) => handleUpdate(entry.id, 'issuer', e.target.value)} placeholder="ej: Amazon Web Services" />
                  </div>
                  <div className="form-field">
                    <Label>Fecha de Emisión</Label>
                    <MonthYearPicker value={entry.issueDate} onChange={(v) => handleUpdate(entry.id, 'issueDate', v)} />
                  </div>
                  <div className="form-field">
                    <Label>Fecha de Vencimiento (Opcional)</Label>
                    <MonthYearPicker value={entry.expirationDate || ''} onChange={(v) => handleUpdate(entry.id, 'expirationDate', v)} allowPresent presentLabel="No expiry" />
                  </div>
                  <div className="form-field full-width">
                    <Label>ID de Credencial (Opcional)</Label>
                    <Input value={entry.credentialId || ''} onChange={(e) => handleUpdate(entry.id, 'credentialId', e.target.value)} placeholder="ej: ABC123XYZ" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full mt-3 gap-2 border-dashed">
        <Plus size={15} /> Añadir Certificación
      </Button>
    </div>
  );
}
