import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { ResumeDocument } from './ResumeDocument';
import { Download, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResultPreviewProps {
  data: {
    originalText: string;
    optimizedText: string;
    keywords: string[];
  };
  className?: string;
}

export function ResultPreview({ data, className }: ResultPreviewProps) {
  return (
    <div className={cn("w-full h-full flex flex-col space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Eye size={20} />
          Vista Previa del PDF
        </h3>
        
        <PDFDownloadLink
          document={<ResumeDocument data={data} />}
          fileName="ResuMate_Optimized_CV.pdf"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          {/* @ts-ignore */}
          {({ blob, url, loading, error }) => 
            loading ? 'Generando PDF...' : (
              <>
                <Download size={18} />
                Descargar PDF
              </>
            )
          }
        </PDFDownloadLink>
      </div>

      <div className="flex-1 min-h-[500px] border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-slate-900">
        <PDFViewer width="100%" height="100%" className="w-full h-full border-none">
          <ResumeDocument data={data} />
        </PDFViewer>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
        <p className="font-semibold mb-2">Cambios realizados:</p>
        <ul className="list-disc list-inside space-y-1">
            <li>Aplicada fórmula XYZ (Logro + Métrica + Acción)</li>
            <li>Inyectadas {data.keywords.length} keywords de la oferta</li>
            <li>Formato 100% legible por ATS (Single Column, Standard Fonts)</li>
        </ul>
      </div>
    </div>
  );
}
