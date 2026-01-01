import { useState, useEffect } from 'react';
import { Plus, FileText, Upload } from 'lucide-react';
import type { Resume } from '../types/resume';
import { CVCard } from './CVCard';
import '../styles/my-cvs.css';

interface MyCVsPageProps {
  onCreateNew: () => void;
  onOpenCV: (cv: Resume) => void;
  onScanCV: () => void;
}

export function MyCVsPage({ onCreateNew, onOpenCV, onScanCV }: MyCVsPageProps) {
  const [cvs, setCvs] = useState<Resume[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load CVs from localStorage
  useEffect(() => {
    const loadCVs = () => {
      const stored = localStorage.getItem('resumate_cvs');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCvs(parsed);
        } catch (error) {
          console.error('Error loading CVs:', error);
          setCvs([]);
        }
      }
    };

    loadCVs();

    // Listen for storage changes to update when CVs are saved
    const handleStorageChange = () => {
      loadCVs();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('cvs-updated', loadCVs);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cvs-updated', loadCVs);
    };
  }, []);

  const handleDeleteCV = (id: string) => {
    const updatedCvs = cvs.filter(cv => cv.metadata.id !== id);
    localStorage.setItem('resumate_cvs', JSON.stringify(updatedCvs));
    setCvs(updatedCvs);
    window.dispatchEvent(new Event('cvs-updated'));
  };

  const filteredCvs = cvs.filter(cv =>
    cv.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cv.profile.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="my-cvs-page">
      <div className="my-cvs-container">
        {/* Header */}
        <div className="my-cvs-header">
          <div>
            <h1 className="my-cvs-title">Mis CVs</h1>
            <p className="my-cvs-subtitle">
              Gestiona y edita todos tus currículums en un solo lugar
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="my-cvs-actions">
          <button className="action-btn primary" onClick={onCreateNew}>
            <Plus size={20} />
            <span>Crear Nuevo CV</span>
          </button>
          <button className="action-btn secondary" onClick={onScanCV}>
            <Upload size={20} />
            <span>Escanear CV Existente</span>
          </button>
        </div>

        {/* Search Bar */}
        {cvs.length > 0 && (
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por título o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        )}

        {/* CVs Grid */}
        {filteredCvs.length > 0 ? (
          <div className="cvs-grid">
            {filteredCvs.map(cv => (
              <CVCard
                key={cv.metadata.id}
                cv={cv}
                onClick={() => onOpenCV(cv)}
                onDelete={handleDeleteCV}
              />
            ))}
          </div>
        ) : cvs.length === 0 ? (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={64} />
            </div>
            <h2 className="empty-state-title">No tienes CVs guardados</h2>
            <p className="empty-state-description">
              Comienza creando un nuevo CV desde cero o escaneando uno existente
            </p>
            <div className="empty-state-actions">
              <button className="action-btn primary" onClick={onCreateNew}>
                <Plus size={20} />
                Crear Nuevo CV
              </button>
              <button className="action-btn secondary" onClick={onScanCV}>
                <Upload size={20} />
                Escanear CV
              </button>
            </div>
          </div>
        ) : (
          /* No Search Results */
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={64} />
            </div>
            <h2 className="empty-state-title">No se encontraron resultados</h2>
            <p className="empty-state-description">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
