import { useState } from 'react';
import axios from 'axios';
import { UploadZone } from './components/UploadZone';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResultPreview } from './components/ResultPreview';
import { Sparkles, FileText, ArrowRight, Loader2 } from 'lucide-react';

interface OptimizationResult {
  originalText: string;
  optimizedText: string;
  keywords: string[];
  model: string;
  processingTime: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!file || !jobDescription) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      // Usar URL completa si no hay proxy, o relativa si lo hay.
      // Asumimos que el backend corre en puerto 3000
      const response = await axios.post('http://localhost:3000/api/resume/optimize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResult({
          originalText: response.data.data.original,
          optimizedText: response.data.data.optimized,
          keywords: response.data.data.keywords,
          model: response.data.data.model,
          processingTime: response.data.data.processingTime
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              ResuMate
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Cómo funciona</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Precios</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Login</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Inputs */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Optimiza tu CV para ATS</h2>
              <p className="text-lg text-slate-600">
                Sube tu CV y la descripción del trabajo. Nuestra IA reescribirá tu experiencia usando la fórmula XYZ de Google.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <UploadZone onFileSelect={setFile} />
              
              <JobDescriptionInput 
                value={jobDescription} 
                onChange={setJobDescription} 
              />

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleOptimize}
                disabled={!file || !jobDescription || isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 ${
                  !file || !jobDescription || isLoading
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Optimizando con IA...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generar CV Optimizado
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center text-sm text-slate-500">
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
          </div>

          {/* Right Column: Results */}
          <div className="lg:h-[calc(100vh-8rem)] sticky top-24">
            {result ? (
              <ResultPreview data={result} className="h-full" />
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 p-8 text-center">
                <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                  <FileText size={48} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">Tu resultado aparecerá aquí</h3>
                <p className="max-w-xs mx-auto">
                  Verás una vista previa de tu nuevo CV y podrás descargarlo en PDF listo para enviar.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
