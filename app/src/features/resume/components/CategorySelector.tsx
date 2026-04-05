import { X, Briefcase, GraduationCap, Code, Award, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface CategoryOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface CategorySelectorProps {
  enabledCategories: string[];
  onAddCategory: (categoryId: string) => void;
  onClose: () => void;
}

const allCategories: CategoryOption[] = [
  { id: 'experience', name: 'Experiencia', icon: <Briefcase size={20} />, description: 'Experiencia laboral y profesional' },
  { id: 'education', name: 'Educación', icon: <GraduationCap size={20} />, description: 'Formación académica y títulos' },
  { id: 'skills', name: 'Habilidades', icon: <Code size={20} />, description: 'Habilidades técnicas y profesionales' },
  { id: 'certifications', name: 'Certificaciones', icon: <Award size={20} />, description: 'Certificados y licencias profesionales' },
  { id: 'languages', name: 'Idiomas', icon: <Languages size={20} />, description: 'Idiomas y nivel de dominio' },
];

export function CategorySelector({ enabledCategories, onAddCategory, onClose }: CategorySelectorProps) {
  const available = allCategories.filter((c) => !enabledCategories.includes(c.id));

  const handleCategoryClick = (id: string) => {
    onAddCategory(id);
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal */}
      <Card
        className="w-full max-w-md mx-4 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Añadir Sección</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <Separator />

        {/* Options */}
        <div className="p-4 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {available.length > 0 ? (
            available.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  'flex items-center gap-4 w-full px-4 py-3 rounded-lg text-left',
                  'border-2 border-slate-100 bg-slate-50',
                  'hover:border-blue-400 hover:bg-blue-50',
                  'transition-all duration-150 cursor-pointer'
                )}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg shrink-0">
                  {cat.icon}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{cat.name}</div>
                  <div className="text-xs text-slate-500">{cat.description}</div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center py-8 text-sm text-slate-500">
              Todas las secciones ya están añadidas
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
