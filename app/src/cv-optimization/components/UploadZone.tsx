import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export function UploadZone({ onFileSelect, className }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5MB');
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out cursor-pointer group",
          isDragging 
            ? "border-blue-500 bg-blue-50/50 scale-[1.02]" 
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50",
          selectedFile ? "bg-green-50/30 border-green-200" : "bg-white",
          error ? "border-red-200 bg-red-50/30" : ""
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={cn(
            "p-4 rounded-full transition-colors duration-300",
            selectedFile ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500",
            error ? "bg-red-100 text-red-500" : ""
          )}>
            {selectedFile ? <CheckCircle size={32} /> : error ? <AlertCircle size={32} /> : <Upload size={32} />}
          </div>
          
          <div className="space-y-1">
            <h3 className={cn(
              "text-lg font-semibold transition-colors",
              selectedFile ? "text-green-700" : "text-slate-700",
              error ? "text-red-600" : ""
            )}>
              {selectedFile ? selectedFile.name : error ? "Error al subir" : "Sube tu CV actual"}
            </h3>
            <p className="text-sm text-slate-500">
              {selectedFile 
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` 
                : error || "Arrastra tu PDF aquí o haz clic para buscar"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
