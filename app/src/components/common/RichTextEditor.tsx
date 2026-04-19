/**
 * RichTextEditor v2 — Powered by Tiptap
 *
 * Stores and returns HTML. Handles legacy markdown on first load.
 *
 * Features: Bold · Italic · Underline · Text Color · Highlight ·
 *           Alignment (L/C/R/J) · Bullet & Ordered lists · Undo/Redo
 */
import React, { memo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { marked } from 'marked';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  PaintBucket,
  Highlighter,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;          // accepts both legacy markdown and HTML
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

interface ColorOption { label: string; value: string }

// ─── Color palette ────────────────────────────────────────────────────────────

const TEXT_COLORS: ColorOption[] = [
  { label: 'Negro',       value: '#000000' },
  { label: 'Gris oscuro', value: '#374151' },
  { label: 'Gris',        value: '#6B7280' },
  { label: 'Azul',        value: '#2563EB' },
  { label: 'Índigo',      value: '#4F46E5' },
  { label: 'Violeta',     value: '#7C3AED' },
  { label: 'Rosa',        value: '#DB2777' },
  { label: 'Rojo',        value: '#DC2626' },
  { label: 'Naranja',     value: '#EA580C' },
  { label: 'Ámbar',       value: '#D97706' },
  { label: 'Verde',       value: '#16A34A' },
  { label: 'Cian',        value: '#0891B2' },
];

const HIGHLIGHT_COLORS: ColorOption[] = [
  { label: 'Amarillo',    value: '#FEF08A' },
  { label: 'Verde lima',  value: '#BBF7D0' },
  { label: 'Celeste',     value: '#BAE6FD' },
  { label: 'Lavanda',     value: '#DDD6FE' },
  { label: 'Rosa claro',  value: '#FBCFE8' },
  { label: 'Durazno',     value: '#FED7AA' },
  { label: 'Gris claro',  value: '#E5E7EB' },
];

// ─── Markdown detection ───────────────────────────────────────────────────────

function looksLikeMarkdown(str: string): boolean {
  if (!str) return false;
  return !str.trim().startsWith('<');
}

async function markdownToHtml(md: string): Promise<string> {
  return (await marked.parse(md)).trim();
}

// ─── MenuButton ───────────────────────────────────────────────────────────────

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}

function MenuButton({ onClick, isActive, disabled, tooltip, children }: MenuButtonProps) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Button
        type="button"
        variant={isActive ? 'secondary' : 'ghost'}
        size="sm"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={cn(
          'h-8 w-8 p-0 rounded transition-all duration-150 hover:scale-105',
          isActive
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'hover:bg-slate-100',
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
        )}
      >
        {children}
      </Button>
      {tooltip && show && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-white rounded whitespace-nowrap z-50 pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  );
}

// ─── Text Color Picker ────────────────────────────────────────────────────────

function TextColorButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const activeColor: string | undefined = editor.getAttributes('textStyle').color;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          className="h-8 w-8 p-0 rounded hover:scale-105 transition-all hover:bg-slate-100"
          title="Color de texto"
        >
          <PaintBucket
            size={15}
            style={{ color: activeColor ?? 'currentColor' }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3" align="start">
        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
          <PaintBucket size={12} /> Color de texto
        </p>
        <div className="grid grid-cols-6 gap-1">
          {/* Reset */}
          <button
            className="h-7 w-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 text-sm"
            onClick={() => editor.chain().focus().unsetColor().run()}
            title="Sin color"
          >
            ✕
          </button>
          {TEXT_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => editor.chain().focus().setColor(c.value).run()}
              className={cn(
                'h-7 w-7 rounded border hover:scale-110 transition-transform',
                activeColor === c.value && 'ring-2 ring-blue-500 ring-offset-1'
              )}
              style={{ backgroundColor: c.value, borderColor: 'transparent' }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Highlight Color Picker ───────────────────────────────────────────────────

function HighlightButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const attrs = editor.getAttributes('highlight');
  const activeColor: string | undefined = typeof attrs?.color === 'string' ? attrs.color : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          className="h-8 w-8 p-0 rounded hover:scale-105 transition-all hover:bg-slate-100 relative"
          title="Color de fondo"
        >
          <Highlighter size={15} />
          {activeColor && (
            <span
              className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white"
              style={{ backgroundColor: activeColor }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3" align="start">
        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
          <Highlighter size={12} /> Resaltado
        </p>
        <div className="grid grid-cols-5 gap-1">
          <button
            className="h-7 w-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 text-sm"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            title="Sin resaltado"
          >
            ✕
          </button>
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => editor.chain().focus().setHighlight({ color: c.value }).run()}
              className={cn(
                'h-7 w-7 rounded border hover:scale-110 transition-transform',
                activeColor === c.value && 'ring-2 ring-blue-500 ring-offset-1'
              )}
              style={{ backgroundColor: c.value, borderColor: '#e5e7eb' }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const RichTextEditor = memo(function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Placeholder.configure({ placeholder }),
      UnderlineExtension,
      TextAlignExtension.configure({
        types: ['paragraph', 'heading'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: looksLikeMarkdown(value) ? '' : (value || ''),
    onCreate: ({ editor }) => {
      if (!value || !looksLikeMarkdown(value)) return;
      markdownToHtml(value).then((html) => {
        if (!editor.isDestroyed) editor.commands.setContent(html);
      });
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-slate-800',
      },
      handlePaste: (_view, event, _slice) => {
        const clipboardData = event.clipboardData;
        if (clipboardData) {
          const hasImage = Array.from(clipboardData.items).some(
            (item) => item.type.startsWith('image/')
          );
          if (hasImage) {
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  // Sync external value changes ONLY when the editor is not focused.
  // While the user is typing, `onUpdate` → `onChange` → parent updates `value`,
  // but we must NOT call setContent again or we'd reset the cursor position.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.isFocused) return;          // user is typing — leave it alone
    const incoming = value || '';
    if (!looksLikeMarkdown(incoming) && incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/70">

        {/* Formatting */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} tooltip="Negrita (Ctrl+B)">
            <Bold size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} tooltip="Cursiva (Ctrl+I)">
            <Italic size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} tooltip="Subrayado (Ctrl+U)">
            <Underline size={14} />
          </MenuButton>
          <TextColorButton editor={editor} />
          <HighlightButton editor={editor} />
        </div>

        <Divider />

        {/* Alignment */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} tooltip="Izquierda">
            <AlignLeft size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} tooltip="Centrar">
            <AlignCenter size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} tooltip="Derecha">
            <AlignRight size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} tooltip="Justificar">
            <AlignJustify size={14} />
          </MenuButton>
        </div>

        <Divider />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} tooltip="Lista con viñetas">
            <List size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} tooltip="Lista numerada">
            <ListOrdered size={14} />
          </MenuButton>
        </div>

        <Divider />

        {/* History */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Deshacer (Ctrl+Z)">
            <Undo2 size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Rehacer (Ctrl+Y)">
            <Redo2 size={14} />
          </MenuButton>
        </div>
      </div>

      {/* ── Editor content ── */}
      <EditorContent editor={editor} />
    </div>
  );
});
