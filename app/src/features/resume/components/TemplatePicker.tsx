import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { CV_TEMPLATES, type TemplateId } from '@/templates';
type LayoutVariant = 'standard' | 'compact';

interface TemplatePickerProps {
  onApply: (templateId: TemplateId, layout: LayoutVariant) => void;
  onCancel: () => void;
}

export function TemplatePicker({ onApply, onCancel }: TemplatePickerProps) {
  const [selected, setSelected] = useState<TemplateId>(CV_TEMPLATES[0].id);
  const [layout, setLayout] = useState<LayoutVariant>('standard');

  const selectedTemplate = CV_TEMPLATES.find((t) => t.id === selected)!;

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Modal card */}
      <div className="relative flex w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-[#111827]">

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* ── LEFT: large preview ── */}
        <div className="flex-1 min-w-0 bg-[#0d1117] flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-lg overflow-hidden shadow-xl ring-1 ring-white/10">
            <img
              key={selected}
              src={selectedTemplate.previewImage}
              alt={`Preview ${selectedTemplate.name}`}
              className="w-full h-auto object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* ── RIGHT: controls ── */}
        <div className="w-72 shrink-0 flex flex-col p-6 gap-5 border-l border-white/[0.07]">

          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-white">Elegí tu plantilla</h2>
            <p className="text-sm text-gray-400 mt-0.5">Seleccioná un estilo para tu CV</p>
          </div>

          {/* Template name + description (active) */}
          <div className="bg-white/5 rounded-xl px-4 py-3">
            <p className="font-semibold text-white text-sm">{selectedTemplate.name}</p>
            <p className="text-gray-400 text-xs mt-0.5">{selectedTemplate.description}</p>
          </div>

          {/* Thumbnail strip */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Plantillas
            </p>
            <div className="grid grid-cols-4 gap-2">
              {CV_TEMPLATES.map((t) => {
                const isActive = t.id === selected;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    title={t.name}
                    className={[
                      'relative rounded-md overflow-hidden aspect-[3/4] border-2 transition-all duration-150',
                      isActive
                        ? 'border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.25)]'
                        : 'border-transparent hover:border-white/30',
                    ].join(' ')}
                  >
                    <img
                      src={t.previewImage}
                      alt={t.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.background = '#1f2937';
                      }}
                    />
                    {isActive && (
                      <span className="absolute bottom-0.5 right-0.5 bg-violet-500 rounded-full p-px">
                        <Check size={8} className="text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout variant toggle */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Densidad
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['standard', 'compact'] as LayoutVariant[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setLayout(v)}
                  className={[
                    'py-2 rounded-lg text-sm font-medium transition-all duration-150 border',
                    layout === v
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10',
                  ].join(' ')}
                >
                  {v === 'standard' ? 'Estándar' : 'Compacto'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              {layout === 'compact'
                ? 'Interlineado reducido — más contenido en menos espacio.'
                : 'Espaciado cómodo, ideal para una página balanceada.'}
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/[0.07]">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onApply(selected, layout)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              Aplicar plantilla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
