import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List } from 'lucide-react';

// --- Markdown ↔ HTML converters (kept minimal, matching resume data format) ---

function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  let html = markdown;
  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Bullet lines: - item
  const lines = html.split('\n');
  let inList = false;
  let result = '';
  for (const line of lines) {
    if (line.trim().startsWith('- ')) {
      if (!inList) { result += '<ul>'; inList = true; }
      result += `<li>${line.trim().substring(2)}</li>`;
    } else {
      if (inList) { result += '</ul>'; inList = false; }
      if (line.trim()) result += `<p>${line}</p>`;
    }
  }
  if (inList) result += '</ul>';
  return result;
}

function htmlToMarkdown(html: string): string {
  let md = html;
  // Bold
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  // Italic
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  // Lists
  md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_, content) =>
    content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
  );
  // Paragraphs → lines
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');
  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '');
  // Decode HTML entities
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

// ---- Component ----

interface RichTextEditorProps {
  value: string; // Markdown string
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading (H1-H6) since we're editing CV fields, not full documents
        heading: false,
        // Keep: bold, italic, bulletList, listItem, undo/redo (history)
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write something...',
      }),
    ],
    content: markdownToHtml(value),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Empty editor emits <p></p>
      const isEmpty = editor.isEmpty;
      onChange(isEmpty ? '' : htmlToMarkdown(html));
    },
  });

  // Sync external value changes (e.g. when CV is loaded from DB)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const expectedHtml = markdownToHtml(value);
    // Only update if the value has genuinely changed (avoid cursor jumping)
    if (htmlToMarkdown(currentHtml) !== value) {
      editor.commands.setContent(expectedHtml, false);
    }
  }, [value, editor]);

  const handleBold = () => editor?.chain().focus().toggleBold().run();
  const handleItalic = () => editor?.chain().focus().toggleItalic().run();
  const handleBullets = () => editor?.chain().focus().toggleBulletList().run();

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="toolbar">
        <button
          type="button"
          onClick={handleBold}
          className={`toolbar-btn${editor?.isActive('bold') ? ' is-active' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className={`toolbar-btn${editor?.isActive('italic') ? ' is-active' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={handleBullets}
          className={`toolbar-btn${editor?.isActive('bulletList') ? ' is-active' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
