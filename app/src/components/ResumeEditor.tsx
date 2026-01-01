import { useEffect, useRef, useState } from 'react';
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import { HARVARD_TEMPLATE_MARKDOWN } from '../templates/HarvardTemplate';
import '../styles/resume-editor.css';
import { Download } from 'lucide-react';

export function ResumeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [markdown, setMarkdown] = useState(HARVARD_TEMPLATE_MARKDOWN);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!editorRef.current || crepeRef.current) return;

    let destroyed = false;
    // Clear the root to prevent any leftover DOM from previous attempts
    editorRef.current.innerHTML = '';

    const crepe = new Crepe({
      root: editorRef.current,
      defaultValue: HARVARD_TEMPLATE_MARKDOWN,
    });

    crepe.create().then(() => {
      // Check if component was unmounted while crepe was being created
      if (destroyed) {
        crepe.destroy();
        return;
      }
      
      crepeRef.current = crepe;
      
      // Use proper Crepe API to listen for markdown updates
      crepe.on((listener) => {
        listener.markdownUpdated((_, markdown) => {
          setMarkdown(markdown);
        });
      });
    }).catch((error) => {
      console.error('Failed to create Crepe editor:', error);
    });

    return () => {
      destroyed = true;
      if (crepeRef.current) {
        crepeRef.current.destroy();
        crepeRef.current = null;
      }
    };
  }, []);

  const handleExportPDF = () => {
    setIsExporting(true);
    
    // Use browser's print functionality for PDF export
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 100);
  };

  // Convert markdown to HTML for preview
  const renderMarkdownPreview = (md: string) => {
    // Simple markdown to HTML conversion for preview
    let html = md
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Handle lists
    const lines = md.split('\n');
    let inList = false;
    let result = '';
    
    for (let line of lines) {
      if (line.trim().startsWith('- ')) {
        if (!inList) {
          result += '<ul>';
          inList = true;
        }
        result += `<li>${line.trim().substring(2)}</li>`;
      } else {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        result += line + '\n';
      }
    }
    
    if (inList) result += '</ul>';
    
    // Apply standard replacements to the result
    html = result
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
      .replace(/^---$/gim, '<hr>')
      .replace(/\n\n/g, '</p><p>');

    return html;
  };

  return (
    <div className="resume-editor-container">
      {/* Editor Panel */}
      <div className="editor-panel">
        <div className="editor-header">
          <h3>Edit Your Resume</h3>
        </div>
        <div className="milkdown-editor" ref={editorRef} />
      </div>

      {/* Preview Panel */}
      <div className="preview-panel">
        <div className="preview-header">
          <h3>Preview</h3>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="export-button"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
        <div className="preview-content">
          <div 
            className="preview-document"
            dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(markdown) }}
          />
        </div>
      </div>
    </div>
  );
}
