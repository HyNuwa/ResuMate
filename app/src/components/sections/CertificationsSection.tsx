import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { CertificationEntry } from '../../types/resume';
import { createCertificationEntry } from '../../types/resume';

interface CertificationsSectionProps {
  entries: CertificationEntry[];
  onChange: (entries: CertificationEntry[]) => void;
}

export function CertificationsSection({ entries, onChange }: CertificationsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleAdd = () => {
    const newEntry = createCertificationEntry();
    onChange([...entries, newEntry]);
    setExpandedIds(new Set([...expandedIds, newEntry.id]));
  };

  const handleRemove = (id: string) => {
    onChange(entries.filter(entry => entry.id !== id));
    const newExpanded = new Set(expandedIds);
    newExpanded.delete(id);
    setExpandedIds(newExpanded);
  };

  const handleUpdate = (id: string, field: keyof CertificationEntry, value: string) => {
    onChange(entries.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getEntryTitle = (entry: CertificationEntry) => {
    if (entry.name && entry.issuer) {
      return `${entry.name} - ${entry.issuer}`;
    }
    if (entry.name) return entry.name;
    if (entry.issuer) return entry.issuer;
    return 'Nueva Certificación';
  };

  return (
    <div className="cv-section">
      <h2 className="section-title">Certificaciones</h2>
      
      <div className="entries-list">
        {entries.map(entry => {
          const isExpanded = expandedIds.has(entry.id);
          return (
            <div key={entry.id} className="entry-card">
              <div className="entry-header" onClick={() => toggleExpand(entry.id)}>
                <span className="entry-title">{getEntryTitle(entry)}</span>
                <div className="entry-actions">
                  <button
                    type="button"
                    className="btn-icon-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(entry.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button type="button" className="btn-icon-small">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="entry-content">
                  <div className="form-grid">
                    <div className="form-field full-width">
                      <label>Nombre de la Certificación</label>
                      <input
                        type="text"
                        className="input"
                        value={entry.name}
                        onChange={(e) => handleUpdate(entry.id, 'name', e.target.value)}
                        placeholder="ej: AWS Certified Solutions Architect"
                      />
                    </div>

                    <div className="form-field full-width">
                      <label>Organización Emisora</label>
                      <input
                        type="text"
                        className="input"
                        value={entry.issuer}
                        onChange={(e) => handleUpdate(entry.id, 'issuer', e.target.value)}
                        placeholder="ej: Amazon Web Services"
                      />
                    </div>

                    <div className="form-field">
                      <label>Fecha de Emisión</label>
                      <input
                        type="text"
                        className="input"
                        value={entry.issueDate}
                        onChange={(e) => handleUpdate(entry.id, 'issueDate', e.target.value)}
                        placeholder="ej: Enero 2023"
                      />
                    </div>

                    <div className="form-field">
                      <label>Fecha de Vencimiento (Opcional)</label>
                      <input
                        type="text"
                        className="input"
                        value={entry.expirationDate || ''}
                        onChange={(e) => handleUpdate(entry.id, 'expirationDate', e.target.value)}
                        placeholder="ej: Enero 2026"
                      />
                    </div>

                    <div className="form-field full-width">
                      <label>ID de Credencial (Opcional)</label>
                      <input
                        type="text"
                        className="input"
                        value={entry.credentialId || ''}
                        onChange={(e) => handleUpdate(entry.id, 'credentialId', e.target.value)}
                        placeholder="ej: ABC123XYZ"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" className="btn-add" onClick={handleAdd}>
        <Plus size={16} />
        Añadir Certificación
      </button>
    </div>
  );
}
