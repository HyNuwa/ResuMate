import { useNavigate } from 'react-router-dom';
import { MyCVsPage as MyCVsPageComponent } from '../cv-list/components';
import type { Resume } from '../shared/types/resume';

export function MyCVsPage() {
  const navigate = useNavigate();

  const handleCreateNewCV = () => {
    navigate('/create');
  };

  const handleOpenCV = (cv: Resume) => {
    navigate(`/cv/${cv.metadata.id}`);
  };

  const handleScanCV = () => {
    navigate('/optimize');
  };

  return (
    <MyCVsPageComponent
      onCreateNew={handleCreateNewCV}
      onOpenCV={handleOpenCV}
      onScanCV={handleScanCV}
    />
  );
}
