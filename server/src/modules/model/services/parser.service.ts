import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

/**
 * Extrae texto de un archivo PDF
 */
export async function parsePDF(filePath: string): Promise<string> {
  try {
    console.log(`📄 Parsing PDF: ${filePath}`);
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Limpieza básica del texto
    const cleanText = data.text
      .replace(/\r\n/g, '\n') // Normalizar saltos de línea
      .replace(/\n{3,}/g, '\n\n') // Reducir espacios múltiples
      .trim();
    
    console.log(`✅ Extracted ${cleanText.length} characters from PDF`);
    
    // Eliminar archivo temporal
    await fs.unlink(filePath);
    
    return cleanText;
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    throw new Error(`PDF Parsing Error: ${error.message}`);
  }
}

/**
 * Valida que el PDF sea un CV (heurística simple)
 */
export function validateResumeContent(text: string): boolean {
  const resumeKeywords = [
    'experience', 'experiencia', 'education', 'educación',
    'skills', 'habilidades', 'projects', 'proyectos',
    'work', 'trabajo', 'universidad', 'university'
  ];
  
  const lowercaseText = text.toLowerCase();
  const foundKeywords = resumeKeywords.filter(keyword => 
    lowercaseText.includes(keyword)
  );
  
  if (foundKeywords.length < 2) {
    throw new Error('El archivo no parece ser un CV válido');
  }
  
  if (text.length < 200) {
    throw new Error('El CV es demasiado corto (mínimo 200 caracteres)');
  }
  
  return true;
}
