import React from 'react';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function JobDescriptionInput({ value, onChange, className }: JobDescriptionInputProps) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center space-x-2 text-slate-700">
        <Briefcase size={20} />
        <h3 className="font-semibold">Descripción de la Oferta</h3>
      </div>
      
      <div className="relative group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pega aquí la descripción del trabajo (Job Description)..."
          className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all duration-200 shadow-sm group-hover:shadow-md text-slate-600 placeholder:text-slate-400"
        />
        <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
          {value.length} caracteres
        </div>
      </div>
      
      <p className="text-xs text-slate-500 flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        La IA analizará las keywords y requisitos de este texto.
      </p>
    </div>
  );
}
