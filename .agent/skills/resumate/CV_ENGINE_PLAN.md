# Plan: Motor de CVs - Arquitectura Reactive Resume

## Estado Actual

```
app/src/
├── templates/
│   ├── harvard/HarvardTemplate.tsx       ⚠️ Usa className mixing
│   ├── classic/ClassicTemplate.tsx        ✅ Inline styles
│   ├── mit/MitTemplate.tsx                 ⚠️ Corregido parcialmente
│   ├── jake-ryan/JakeRyanTemplate.tsx      ⚠️ Corregido parcialmente
│   ├── shared/
│   │   ├── EntryBlock.tsx                 ❌ Tailwind hardcodeado, sin break-inside
│   │   ├── SectionHeading.tsx             ✅ Inline styles
│   │   ├── SkillsBlock.tsx                ⚠️ Corregido parcialmente
│   │   └── SectionRenderer.tsx            ⚠️ Corregido parcialmente
├── features/resume/
│   └── components/FormBasedEditor.tsx      ✅ CSS vars inyectadas inline
└── pages/PrinterPage.tsx                 ⚠️ 200ms delay arbitrario, sin @page
```

---

## Fase 1: Eliminar Tailwind de Templates (Crítico)

### Problema
Tailwind no puede generar CSS para clases como `text-[length:var(--preview-size-body)]` → se ignoran silenciosamente.

### Archivos a modificar

| Archivo | Estado actual | Cambio necesario |
|---------|---------------|------------------|
| `EntryBlock.tsx` | `className="mb-2 text-[12px]"` | **100% inline styles** |
| `HarvardTemplate.tsx` | `className="mb-1 text-center"` | **100% inline styles** |
| `ContactInfo.tsx` | `className="flex flex-wrap..."` | **100% inline styles** |

---

## Fase 2: break-inside: avoid (Alta Prioridad)

### Problema
Puppeteer corta el PDF a mitad de un entry si no entra en la página.

### Solución
Agregar `breakInside: 'avoid'` y `pageBreakInside: 'avoid'` a todos los componentes entry.

---

## Fase 3: PrinterPage - @page y networkidle0 (Alta Prioridad)

### Problema actual
- Delay fijo de 200ms (`setTimeout`) para esperar fonts
- Sin `@page` CSS para dimensionar exactamente el papel
- Usa `px` en lugar de `pt`

### Solución
- Añadir `@page { size: A4; margin: 0; }` en un style tag
- Usar `networkidle0` en Puppeteer en lugar de delay arbitrario
- Cambiar a unidades `mm` para dimensiones de página

---

## Fase 4: Unidades pt vs px (Media Prioridad)

### Problema
Se usa `px` para tamaños de fuente. En impresión, `pt` es más apropiado.

### Cambio
- `--preview-size-body`: `${size}pt` en lugar de `${size}px`
- `--preview-size-heading`: `${size}pt`

---

## Fase 5: Refactorizar Shared Components (Baja Prioridad - Técnico)

### Problema
`ExperienceEntry` tiene estilos "default" hardcodeados via className props.

### Solución
Sistema de `styleMap` por template que define todos los estilos de un entry.

---

## Arquitectura Objetivo

```
┌─────────────────────────────────────────────────────────────┐
│                        PDF Export                            │
├─────────────────────────────────────────────────────────────┤
│  Puppeteer → networkidle0 → page.pdf()                       │
│     ↓                                                        │
│  /printer/:id                                                │
│     ↓                                                        │
│  <div style={cssVars, width:210mm, @page rules}>            │
│     ↓                                                        │
│  <ResumePreview>                                             │
│     ↓                                                        │
│  <HarvardTemplate> → CSS vars inline                         │
│     ↓                                                        │
│  <SectionRenderer> → break-inside: avoid                     │
│     ↓                                                        │
│  <ExperienceEntry> → break-inside: avoid, styleMap           │
└─────────────────────────────────────────────────────────────┘
```

## Progreso

- [x] Fase 1: Eliminar Tailwind - Completo (todos los templates + shared components)
- [x] Fase 2: break-inside: avoid - Completo (EntryBlock.tsx tiene breakInside/ pageBreakInside)
- [x] Fase 3: PrinterPage @page y networkidle0 - Completo (unidades mm, @page rules, requestAnimationFrame)
- [x] Fase 4: Unidades pt - Completo (px → pt en FormBasedEditor y PrinterPage)
- [ ] Fase 5: StyleMap system (opcional, baja prioridad)
