# Plan: Fix Editor Bugs — Root Cause Analysis + Fixes

## Resumen de Bugs

| # | Bug | Causa Raíz | Severidad |
|---|---|---|---|
| 1 | HTML crudo visible en el preview | `renderMarkdown()` pasa HTML de TipTap por markdown-it, doble-procesando | 🔴 Alta |
| 2 | Perfil no deja agregar datos | Al clickar "Perfil" muestra "Sin entradas" sin form ni botón de agregar | 🔴 Alta |
| 3 | Tipografía Heading no tiene efecto | `TEMPLATE_STYLES` usa tamaños hardcoded que sobreescriben CSS vars | 🟡 Media |
| 4 | Layout drag-and-drop no persiste | `enabledCategories` se recalcula de array fijo, ignorando orden guardado | 🔴 Alta |
| 5 | Cambio de formato A4/Letter/Free-Form no funciona | `paperStyle` tiene `width` y `minHeight` hardcoded | 🟡 Media |
| 6 | Exportación PDF no funciona | `ResumeDocument.tsx` es para AI, no para el editor CV | 🔴 Alta |
| 7 | TipTap warning: duplicate 'underline' | StarterKit incluye underline + UnderlineExtension duplicado | 🟢 Baja |

---

## Bug 1: HTML crudo visible en el preview

**Archivo:** `app/src/features/resume/components/preview/ResumePreview.tsx`

**Causa:** `renderMarkdown()` (línea 59-62) usa `markdown-it` con `html: false` para procesar texto que viene de TipTap como HTML. `markdown-it` escapa los tags → se muestran como texto literal.

**Fix:** Reemplazar `renderMarkdown()` con sanitización directa:

```diff
-import MarkdownIt from 'markdown-it';
 import DOMPurify from 'dompurify';

-const md = new MarkdownIt({ html: false, breaks: true, linkify: true });
-
-function renderMarkdown(text: string): string {
-  const rawHtml = md.render(text ?? '');
-  return DOMPurify.sanitize(rawHtml);
-}
+function sanitizeHtml(text: string): string {
+  return DOMPurify.sanitize(text ?? '');
+}
```

Actualizar todos los `renderMarkdown(...)` → `sanitizeHtml(...)` en el archivo.

---

## Bug 2: Perfil no deja agregar datos

**Archivo:** `app/src/features/resume/components/CollapsibleSections.tsx`

**Causa:** Para `basics`, `subItems` es `[]` y el botón "Agregar" se oculta con `categoryId !== 'basics'` (línea 175). El `ProfileSection` existe pero **nunca se renderiza**.

**Fix:** Cuando `categoryId === 'basics'` y el panel está expandido, renderizar `ProfileSection` inline:

1. Importar `ProfileSection` desde `./sections/ProfileSection`
2. Pasar `basics` y `onBasicsChange` como props a `SectionGroup` (o renderizar condicionalmente en `CollapsibleSections`)
3. Dentro del panel expandido de `basics`, renderizar `<ProfileSection data={basics} onChange={onBasicsChange} />`

---

## Bug 3: Tipografía Heading no tiene efecto

**Archivo:** `app/src/features/resume/components/preview/ResumePreview.tsx`

**Causa:** Los 4 templates en `TEMPLATE_STYLES` usan tamaños fijos como `text-[11px]` para `sectionHeading`, ignorando `--preview-size-heading`.

**Fix:** Cambiar `sectionHeading` en los 4 templates para usar CSS vars:

```diff
-sectionHeading: 'text-[11px] font-bold uppercase...'
+sectionHeading: 'text-[length:var(--preview-size-heading)] font-[var(--preview-weight-heading)] font-[family-name:var(--preview-font-heading)] uppercase...'
```

---

## Bug 4: Layout drag-and-drop no persiste

**Archivo:** `app/src/features/resume/components/FormBasedEditor.tsx`

**Causa:** `enabledCategories` (línea 139-141) se calcula de `ALL_SECTION_KEYS.filter(...)` — un array constante. Ignora el orden guardado en `metadata.layout.pages[0].main`.

**Fix:**

```diff
-const enabledCategories = ALL_SECTION_KEYS.filter(
-  key => !resume.sections[key as keyof typeof resume.sections]?.hidden
-);
+const enabledCategories = (() => {
+  const savedOrder = resume.metadata.layout.pages[0]?.main ?? [];
+  const fromSaved = savedOrder.filter(
+    key => !resume.sections[key as keyof typeof resume.sections]?.hidden
+  );
+  const inSaved = new Set(fromSaved);
+  const rest = ALL_SECTION_KEYS.filter(
+    key => !inSaved.has(key) && !resume.sections[key as keyof typeof resume.sections]?.hidden
+  );
+  return [...fromSaved, ...rest];
+})();
```

---

## Bug 5: Cambio de formato A4/Letter/Free-Form no funciona

**Archivo:** `app/src/features/resume/components/FormBasedEditor.tsx`

**Causa:** `paperStyle` tiene `width: '794px'` y `minHeight: '1123px'` hardcoded (líneas 151-152).

**Fix:**

```diff
+const PAGE_DIMENSIONS: Record<string, { width: string; minHeight: string }> = {
+  'a4':        { width: '794px',  minHeight: '1123px' },
+  'letter':    { width: '816px',  minHeight: '1056px' },
+  'free-form': { width: '794px',  minHeight: 'auto'   },
+};
+
 const paperStyle: React.CSSProperties = {
-  width:           '794px',
-  minHeight:       '1123px',
+  width:           PAGE_DIMENSIONS[metadata.page.format]?.width ?? '794px',
+  minHeight:       PAGE_DIMENSIONS[metadata.page.format]?.minHeight ?? '1123px',
```

---

## Bug 6: Exportación PDF no funciona

**Archivo:** `app/src/features/resume/components/ResumeDocument.tsx`

**Causa:** `ResumeDocument` es para la feature de optimización AI. Espera `{originalText, optimizedText, keywords}`. **No existe un componente PDF para el CV del editor.**

**Fix:**

1. **[NEW] `ResumePDFDocument.tsx`** — Crear componente `@react-pdf/renderer` que recibe `ResumeData` y renderiza todas las secciones (basics, experience, education, skills, certifications, languages)
2. **[MODIFY] `PreviewToolbar.tsx`** — Conectar el botón "Exportar PDF" al nuevo componente

---

## Bug 7: TipTap duplicate 'underline' warning

**Archivo:** `app/src/components/common/RichTextEditor.tsx`

**Causa:** `StarterKit` puede incluir underline, y `UnderlineExtension` se registra explícitamente también.

**Fix:** Agregar `underline: false` a la config de StarterKit:

```diff
 StarterKit.configure({
   heading: false,
   bulletList: false,
   orderedList: false,
   listItem: false,
+  underline: false,
 }),
```

Si `underline` no es una opción válida de StarterKit, quitar el `UnderlineExtension` explícito.

---

## Orden de ejecución

1. Bug 1 (HTML crudo) — el más visible
2. Bug 2 (Profile) — crítico para usabilidad
3. Bug 4 (Layout drag) — alto impacto
4. Bug 5 (Page format) — fix trivial
5. Bug 3 (Heading) — fix trivial
6. Bug 7 (TipTap warning) — trivial
7. Bug 6 (PDF export) — requiere componente nuevo

## Verificación

Después de cada fix: `pnpm run build` + verificar en browser.
