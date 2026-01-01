import { X, Briefcase, GraduationCap, Code, Award, Languages } from 'lucide-react';

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
  {
    id: 'experience',
    name: 'Experiencia',
    icon: <Briefcase size={20} />,
    description: 'Experiencia laboral y profesional'
  },
  {
    id: 'education',
    name: 'Educación',
    icon: <GraduationCap size={20} />,
    description: 'Formación académica y títulos'
  },
  {
    id: 'skills',
    name: 'Habilidades',
    icon: <Code size={20} />,
    description: 'Habilidades técnicas y profesionales'
  },
  {
    id: 'certifications',
    name: 'Certificaciones',
    icon: <Award size={20} />,
    description: 'Certificados y licencias profesionales'
  },
  {
    id: 'languages',
    name: 'Idiomas',
    icon: <Languages size={20} />,
    description: 'Idiomas y nivel de dominio'
  }
];

export function CategorySelector({ enabledCategories, onAddCategory, onClose }: CategorySelectorProps) {
  const availableCategories = allCategories.filter(
    cat => !enabledCategories.includes(cat.id)
  );

  const handleCategoryClick = (categoryId: string) => {
    onAddCategory(categoryId);
    onClose();
  };

  return (
    <div className="category-selector-overlay" onClick={onClose}>
      <div className="category-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="category-selector-header">
          <h3>Añadir Categoría</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="category-options">
          {availableCategories.length > 0 ? (
            availableCategories.map(category => (
              <button
                key={category.id}
                className="category-option-card"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-option-icon">{category.icon}</div>
                <div className="category-option-content">
                  <div className="category-option-name">{category.name}</div>
                  <div className="category-option-description">{category.description}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="category-empty-state">
              <p>Todas las categorías ya están añadidas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
