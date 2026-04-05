import { useState } from 'react';
import { Plus, FileText, Upload, Search, Sparkles } from 'lucide-react';
import type { CVDocument } from '@/shared/services/cv.service';
import { CVCard } from './CVCard';
import { useAllCVs, useDeleteCV } from '@/shared/hooks/useQueryCVs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MyCVsPageProps {
  onCreateNew: () => void;
  onOpenCV: (cv: CVDocument) => void;
  onScanCV: () => void;
}

export function MyCVsPage({ onCreateNew, onOpenCV, onScanCV }: MyCVsPageProps) {
  const { data: cvs = [], isLoading } = useAllCVs();
  const { mutate: deleteCV } = useDeleteCV();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteCV = (id: string) => deleteCV(id);

  const filtered = cvs.filter((cv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cv.title.toLowerCase().includes(q) ||
      cv.data.basics.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">
              ResuMate
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Mis Currículums
          </h1>
          <p className="text-lg text-slate-500">
            Crea, edita y administra todos tus CVs en un solo lugar
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Button
            onClick={onCreateNew}
            className="gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200"
          >
            <Plus size={17} />
            Nuevo CV
          </Button>
          <Button
            variant="outline"
            onClick={onScanCV}
            className="gap-2 h-10 px-5 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <Upload size={17} />
            Importar CV
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          {cvs.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por título o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-xl bg-white border border-slate-100 animate-pulse" />
            ))}
          </div>

        ) : cvs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
              <FileText size={36} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Todavía no tenés CVs
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm">
              Creá tu primer currículum desde cero o importá uno existente para empezar.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                onClick={onCreateNew}
                className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200"
              >
                <Plus size={17} />
                Crear mi primer CV
              </Button>
              <Button variant="outline" onClick={onScanCV} className="gap-2">
                <Upload size={17} />
                Importar CV
              </Button>
            </div>
          </div>

        ) : filtered.length === 0 ? (
          /* No search results */
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">
              No se encontraron CVs para{' '}
              <span className="font-semibold text-slate-700">"{searchQuery}"</span>
            </p>
            <button
              className="mt-3 text-sm text-blue-600 hover:underline"
              onClick={() => setSearchQuery('')}
            >
              Limpiar búsqueda
            </button>
          </div>

        ) : (
          /* CV Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                onClick={() => onOpenCV(cv)}
                onDelete={handleDeleteCV}
              />
            ))}

            {/* Add new CTA card */}
            <button
              onClick={onCreateNew}
              className="group flex flex-col items-center justify-center gap-3 h-40 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 text-slate-400 hover:text-blue-500"
            >
              <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium">Nuevo CV</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
