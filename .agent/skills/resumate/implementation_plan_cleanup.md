# Plan: Limpieza del Frontend — Issues Verificados

## Verificación del Análisis de OpenCode

| Claim | Verificado | Notas |
|---|---|---|
| `consonants/` — 255 líneas, ningún import | ✅ **Correcto** | 1 archivo `countries.ts`, 0 imports en todo el proyecto |
| `cv-editor/` — solo re-exporta, deprecated | ✅ **Correcto** | Solo `index.ts` (2 líneas, re-exporta `useResumeStore` desde `features/resume/stores`). 0 archivos lo importan |
| `useFormAutoSave.ts` — console.log de debug | ✅ **Correcto** | 2 líneas: `console.log('✏️ handleChange...')` y `console.log('  ⏰ Debounced save...')` |
| `RichTextEditor.tsx` — document.execCommand deprecated | ✅ **Correcto** | 5 usos de `document.execCommand` para bold/italic/bullets |
| `components/components/` y `sections/sections/` nesting | ✅ **Correcto** | `features/resume/components/components/` (13 archivos) y `features/resume/components/sections/sections/` |
| TemplateId mismatch: 'jake-ryan' vs 'jake ryan' | ✅ **Correcto** | `templates/index.ts` usa `'jake-ryan'`, `schema/templates.ts` usa `'jake ryan'` (con espacio) |
| Import inconsistency `@/schema/` vs `@resumate/schema` | ⚠️ **Parcialmente incorrecto** | No hay imports `from '@/schema'`. Pero la carpeta `schema/` existe con archivos huérfanos (`templates.ts`, `jobs.ts`, `page.ts`) que nadie importa — es dead code |
| `cv-list/` y `cv-optimization/` migrados | ✅ **Correcto** | Los directorios ya no existen |
| `server/src/index.ts` eliminado | ✅ **Correcto** | No existe |

### Hallazgo adicional no reportado

- 🔴 **Duplicado**: Hay **dos** copias de `RichTextEditor.tsx`:
  - `shared/components/common/RichTextEditor.tsx` (legacy con `document.execCommand`)
  - `components/common/RichTextEditor.tsx` (posiblemente otra copia)

---

## Tareas a ejecutar

### Tarea 1 — Eliminar dead code (carpetas huérfanas)

Borrar completamente:

- **`app/src/consonants/`** — 1 archivo `countries.ts` (255 líneas), 0 imports
- **`app/src/cv-editor/`** — 1 archivo `index.ts` (2 líneas), 0 imports  
- **`app/src/schema/`** — 3 archivos huérfanos: `templates.ts`, `jobs.ts`, `page.ts` + subdirectorio `resume/`, 0 imports

---

### Tarea 2 — Eliminar console.log de debug

En `app/src/shared/hooks/useFormAutoSave.ts`, eliminar las líneas:

```diff
-    console.log('✏️ handleChange called - updating state');
-    console.log('  ⏰ Debounced save scheduled');
```

Opcionalmente reemplazar con el `logger` que ya existe en `@/shared/utils/logger`.

---

### Tarea 3 — Normalizar TemplateId

El archivo `schema/templates.ts` que tiene `'jake ryan'` (con espacio) se elimina en Tarea 1. El ID canónico es `'jake-ryan'` (con guión) en `templates/index.ts`. Verificar que no haya datos en la DB con `'jake ryan'` como template id.

---

### Tarea 4 — Aplanar nesting redundante

Mover archivos un nivel arriba:

```
features/resume/components/components/*.tsx → features/resume/components/*.tsx
features/resume/components/sections/sections/*.tsx → features/resume/components/sections/*.tsx
```

**Actualizar todos los imports relativos** en los archivos movidos y en los archivos que los importan. Ejecutar `pnpm run build` para verificar.

---

### Tarea 5 — Consolidar RichTextEditor duplicado

Investigar cuál de las dos copias es la activa:
- `shared/components/common/RichTextEditor.tsx`
- `components/common/RichTextEditor.tsx`

Eliminar la que no se usa. Si el proyecto ya usa TipTap para rich text, ambas podrían ser dead code.

---

## Orden recomendado

1. Tarea 1 (dead code) — riesgo cero
2. Tarea 2 (console.log) — trivial
3. Tarea 3 (TemplateId) — se resuelve con Tarea 1
4. Tarea 5 (RichTextEditor) — investigar
5. Tarea 4 (aplanar nesting) — la más compleja, dejar para el final

## Verificación

Después de cada tarea: `pnpm run build`. Si pasa, la tarea está completa.
