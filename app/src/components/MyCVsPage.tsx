import { useState } from 'react';
import { Plus, FileText, Upload } from 'lucide-react';
import type { Resume } from '../types/resume';
import { CVCard } from './CVCard';
import { useAllCVs, useDeleteCV } from '../hooks/useQueryCVs';
import '../styles/my-cvs.css';

interface MyCVsPageProps {
  onCreateNew: () => void;
  onOpenCV: (cv: Resume) => void;
  onScanCV: () => void;
}

export function MyCVsPage({ onCreateNew, onOpenCV, onScanCV }: MyCVsPageProps) {
  // TanStack Query hooks - auto-maneja loading, error, cache
  const { data: cvs = [], isLoading } = useAllCVs();
  
  // Delete mutation
  const { mutate: deleteCV } = useDeleteCV();

  // Filtro local (estado UI)
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteCV = (id: string) => {
    deleteCV(id);
  };

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

        {/* CV Grid */}
        {isLoading ? (
          <div className="loading-state">
            <p>Cargando CVs...</p>
          </div>
        ) : cvs.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} className="empty-icon" />
            <h3>No tienes CVs todavía</h3>
            <p>Crea tu primer CV o escanea uno existente para empezar</p>
          </div>
        ) : (
          <div className="cvs-grid">
            {cvs
              .filter((cv) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                const titleMatch = cv.metadata.title.toLowerCase().includes(query);
                const nameMatch = cv.profile?.fullName?.toLowerCase().includes(query);
                return titleMatch || nameMatch;
              })
              .map((cv) => (
                <CVCard
                  key={cv.metadata.id}
                  cv={cv}
                  onClick={() => onOpenCV(cv)}
                  onDelete={handleDeleteCV}
                />
              ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
