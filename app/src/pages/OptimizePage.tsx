import { useState } from 'react';
import axios from 'axios';
import { UploadZone, JobDescriptionInput, ResultPreview } from '../cv-optimization/components';
import { Sparkles, Loader2 } from 'lucide-react';
import { optimizeCV, type OptimizationResult } from '../shared/services/cv.service';

export function OptimizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!file || !jobDescription.trim()) {
      setError('Por favor, sube tu CV y agrega la descripción del puesto');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const optimizationResult = await optimizeCV(file, jobDescription);
      setResult(optimizationResult);
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Error al conectar con el servidor');
      } else {
        setError('Error inesperado al optimizar CV');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Optimización impulsada por IA</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Transforma Tu CV Con{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Inteligencia Artificial
          </span>
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Optimiza tu currículum para cada aplicación usando la fórmula XYZ de Google y técnicas
          anti-detección de IA
        </p>
      </section>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <p className="font-bold text-slate-900 text-lg mb-1">XYZ</p>
          <p>Fórmula de Google</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <p className="font-bold text-slate-900 text-lg mb-1">ATS</p>
          <p>100% Legible</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <p className="font-bold text-slate-900 text-lg mb-1">AI</p>
          <p>Anti-Detección</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <UploadZone onFileSelect={setFile} />
        <JobDescriptionInput
          value={jobDescription}
          onChange={setJobDescription}
        />
      </div>

      {/* Optimize Button */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <button
          onClick={handleOptimize}
          disabled={!file || !jobDescription.trim() || isLoading}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Optimizando...</span>
            </>
          ) : (
            <>
              <Sparkles size={24} />
              <span>Optimizar CV</span>
            </>
          )}
        </button>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg max-w-md">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && <ResultPreview data={result} />}
    </div>
  );
}
