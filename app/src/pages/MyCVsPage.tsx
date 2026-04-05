import { useNavigate } from 'react-router-dom';
import { MyCVsPage as MyCVsPageComponent } from '../features/dashboard/components/MyCVsPage';
import type { CVDocument } from '../shared/services/cv.service';

export function MyCVsPage() {
  const navigate = useNavigate();

  const handleCreateNewCV = () => {
    navigate('/create');
  };

  const handleOpenCV = (cv: CVDocument) => {
    navigate(`/cv/${cv.id}`);
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
