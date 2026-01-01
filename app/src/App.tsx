import { useState } from 'react';
import axios from 'axios';
import { UploadZone } from './components/UploadZone';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResultPreview } from './components/ResultPreview';
import { FormBasedEditor } from './components/FormBasedEditor';
import { MyCVsPage } from './components/MyCVsPage';
import { Sparkles, Loader2, PenTool, FolderOpen } from 'lucide-react';
import type { Resume } from './types/resume';
import { createEmptyResume } from './types/resume';

interface OptimizationResult {
  originalText: string;
  optimizedText: string;
  improvements: string[];
  keywords: string[];
  model: string;
  processingTime: string;
}

type TabType = 'optimize' | 'create' | 'my-cvs';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('my-cvs'); // Default to My CVs
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCV, setCurrentCV] = useState<Resume | null>(null);

  const handleOptimize = async () => {
    if (!file || !jobDescription.trim()) {
      setError('Por favor, sube tu CV y agrega la descripción del puesto');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('jobDescription', jobDescription);

      const response = await axios.post('http://localhost:3001/api/cv/optimize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResult({
          originalText: response.data.data.originalText,
          optimizedText: response.data.data.optimizedText,
          improvements: response.data.data.improvements,
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

  // CV Management Handlers
  const handleCreateNewCV = () => {
    setCurrentCV(createEmptyResume());
    setActiveTab('create');
  };

  const handleOpenCV = (cv: Resume) => {
    setCurrentCV(cv);
    setActiveTab('create');
  };

  const handleScanCV = () => {
    // Switch to optimize tab to scan an existing CV
    setActiveTab('optimize');
  };

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 flex flex-col overflow-hidden">
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
          <nav className="flex gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('my-cvs')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'my-cvs'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen size={16} />
                Mis CVs
              </div>
            </button>
            <button
              onClick={() => setActiveTab('optimize')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'optimize'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                Optimizar CV
              </div>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'create'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <PenTool size={16} />
                Crear CV
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === 'my-cvs' ? (
        <main className="flex-1 overflow-y-auto">
          <MyCVsPage
            onCreateNew={handleCreateNewCV}
            onOpenCV={handleOpenCV}
            onScanCV={handleScanCV}
          />
        </main>
      ) : activeTab === 'optimize' ? (
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* CV Optimizer Section */}
          <>
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
          </>
          </div>
        </main>
      ) : (
        // CV Builder Section - Full width without max-w constraint
        <main className="flex-1 overflow-hidden">
          <FormBasedEditor initialCV={currentCV || undefined} />
        </main>
      )}
    </div>
  );
}

export default App;
