import { useEffect, useRef } from 'react';
import { htmlToMarkdown, markdownToHtml } from '../../utils/markdownConverter';
import { Bold, Italic, List } from 'lucide-react';

interface RichTextEditorProps {
  value: string; // Markdown string
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Update editor content when value changes externally
  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return;
    
    const html = markdownToHtml(value);
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    const markdown = htmlToMarkdown(html);
    onChange(markdown);
    
    // Reset flag after a short delay
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleInput();
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleBullets = () => execCommand('insertUnorderedList');

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="toolbar">
        <button
          type="button"
          onClick={handleBold}
          className="toolbar-btn"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="toolbar-btn"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={handleBullets}
          className="toolbar-btn"
          title="Bullet List"
        >
          <List size={16} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="editor-content"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}
