import type { Resume } from '../types/resume';
import { Calendar, Trash2 } from 'lucide-react';

interface CVCardProps {
  cv: Resume;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function CVCard({ cv, onClick, onDelete }: CVCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPreviewText = () => {
    if (cv.profile.fullName) {
      const position = cv.experience.length > 0 ? cv.experience[0].position : '';
      return position ? `${cv.profile.fullName} • ${position}` : cv.profile.fullName;
    }
    return 'CV sin nombre';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar este CV?')) {
      onDelete(cv.metadata.id);
    }
  };

  return (
    <div className="cv-card" onClick={onClick}>
      <div className="cv-card-header">
        <h3 className="cv-card-title">{cv.metadata.title}</h3>
        <button
          className="cv-card-delete"
          onClick={handleDelete}
          title="Eliminar CV"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <p className="cv-card-preview">{getPreviewText()}</p>
      
      <div className="cv-card-footer">
        <div className="cv-card-date">
          <Calendar size={14} />
          <span>{formatDate(cv.metadata.updatedAt)}</span>
        </div>
        <div className="cv-card-stats">
          {cv.enabledCategories.length} secciones
        </div>
      </div>
    </div>
  );
}
