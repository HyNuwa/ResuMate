/**
 * ResumeEditor - Legacy markdown-based editor used in the CV Optimization flow.
 * Migrated from Milkdown/Crepe to Tiptap after @milkdown packages were removed.
 */
import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { HARVARD_TEMPLATE_MARKDOWN } from '@/templates/HarvardTemplate';
import '@/styles/resume-editor.css';
import { Download, Bold, Italic, List } from 'lucide-react';

// Minimal markdown→HTML for initial content rendering
function markdownToHtml(md: string): string {
  if (!md) return '';
  return md
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .split('\n')
    .map(line => {
      if (line.startsWith('<h') || line.startsWith('<hr') || line.trim() === '') return line;
      if (line.trim().startsWith('- ')) return `<li>${line.trim().slice(2)}</li>`;
      return `<p>${line}</p>`;
    })
    .join('');
}

export function ResumeEditor() {
  const isExportingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Start editing your resume...' }),
    ],
    content: markdownToHtml(HARVARD_TEMPLATE_MARKDOWN),
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => { editor?.destroy(); };
  }, [editor]);

  const handleExportPDF = () => {
    if (isExportingRef.current) return;
    isExportingRef.current = true;
    setTimeout(() => {
      window.print();
      isExportingRef.current = false;
    }, 100);
  };

  return (
    <div className="resume-editor-container">
      {/* Editor Panel */}
      <div className="editor-panel">
        <div className="editor-header">
          <h3>Edit Your Resume</h3>
          <div className="editor-toolbar">
            <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`toolbar-btn${editor?.isActive('bold') ? ' is-active' : ''}`} title="Bold">
              <Bold size={16} />
            </button>
            <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`toolbar-btn${editor?.isActive('italic') ? ' is-active' : ''}`} title="Italic">
              <Italic size={16} />
            </button>
            <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`toolbar-btn${editor?.isActive('bulletList') ? ' is-active' : ''}`} title="Bullet List">
              <List size={16} />
            </button>
          </div>
        </div>
        <EditorContent editor={editor} className="milkdown-editor tiptap-editor" />
      </div>

      {/* Preview Panel */}
      <div className="preview-panel">
        <div className="preview-header">
          <h3>Preview</h3>
          <button onClick={handleExportPDF} className="export-button">
            <Download size={16} />
            Export PDF
          </button>
        </div>
        <div className="preview-content">
          <div
            className="preview-document"
            dangerouslySetInnerHTML={{ __html: editor ? editor.getHTML() : markdownToHtml(HARVARD_TEMPLATE_MARKDOWN) }}
          />
        </div>
      </div>
    </div>
  );
}
