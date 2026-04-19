/**
 * ResumeEditor - Legacy markdown-based editor used in the CV Optimization flow.
 * Migrated from Milkdown/Crepe to Tiptap after @milkdown packages were removed.
 */
import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import '@/styles/resume-editor.css';
import { Download, Bold, Italic, List } from 'lucide-react';

const DEFAULT_TEMPLATE_MARKDOWN = `# John Smith

**Email:** johnsmith@email.com | **Phone:** (555) 123-4567  
**LinkedIn:** linkedin.com/in/johnsmith | **Location:** Boston, MA

---

## Education

**Harvard University** — Cambridge, MA  
*Bachelor of Arts in Computer Science* | May 2024  
- GPA: 3.8/4.0
- Honors: Dean's List (Fall 2021, Spring 2022, Fall 2022)

---

## Experience

**Software Engineering Intern** — Tech Company — San Francisco, CA  
*June 2023 - August 2023*

- Developed a new feature that increased user engagement by 25%
- Improved application performance by 40% by optimizing database queries
- Collaborated with cross-functional team of 8 engineers

---

## Skills

**Programming Languages:** Python, JavaScript, TypeScript, Java, C++  
**Technologies & Frameworks:** React, Node.js, TensorFlow, PyTorch, Docker

`;

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
    content: markdownToHtml(DEFAULT_TEMPLATE_MARKDOWN),
  });

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
            dangerouslySetInnerHTML={{ __html: editor ? editor.getHTML() : markdownToHtml(DEFAULT_TEMPLATE_MARKDOWN) }}
          />
        </div>
      </div>
    </div>
  );
}
