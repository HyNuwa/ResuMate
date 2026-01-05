import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { FormBasedEditor } from '../cv-editor/components';
import { useCV } from '../shared/hooks/useQueryCVs';

export function CVEditorPage() {
  const { id } = useParams();
  
  // TanStack Query maneja loading, error, y cache automáticamente
  const { data: cv, isLoading, error } = useCV(id);
  
  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-slate-600">Cargando CV...</p>
        </div>
      </div>
    );
  }
  
  if (error || !cv) {
    return (
      <div className="flex-1 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Error al cargar CV'}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  
  return <FormBasedEditor initialCV={cv} isExistingCV={true} />;
}
