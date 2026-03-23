# Plan: Eliminar Tipos Legacy — Migrar Todo a `@resumate/schema`

## Contexto

El frontend tiene **dos sistemas de tipos** para representar un CV:

| | Tipo viejo ([Resume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#67-77)) | Tipo nuevo ([ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433)) |
|---|---|---|
| **Definido en** | [resume.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts) | [@resumate/schema](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts) |
| **Store** | [useCVStore](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts) | [useResumeStore](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/useResumeStore.ts) |
| **Puente** | [legacyAdapter.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/types/legacyAdapter.ts) | — |

El [legacyAdapter.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/types/legacyAdapter.ts) existe únicamente porque los componentes siguen usando el tipo viejo. **Este plan elimina el adapter convirtiendo directamente todos los consumidores al tipo nuevo.**

## Diferencias Clave entre Tipos

Referencia rápida de mapeo que OpenCode necesita para refactorizar cada componente:

| Concepto | Tipo Viejo | Tipo Nuevo ([ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433)) |
|---|---|---|
| Nombre | `resume.profile.fullName` | `resume.basics.name` |
| Email/Phone/Location | `resume.profile.*` | `resume.basics.*` |
| LinkedIn | `resume.profile.linkedin` | `resume.basics.customFields[]` o `resume.sections.profiles.items[]` |
| Website | `resume.profile.website` (string) | `resume.basics.website` (`{ url, label }`) |
| Summary | `resume.profile.summary` | `resume.summary.content` |
| Experience | `resume.experience[]` (flat array) | `resume.sections.experience.items[]` |
| Education | `resume.education[]` | `resume.sections.education.items[]` |
| Experience fields | `position, company, startDate, endDate` | `position, company, period` (single string) |
| Education fields | `institution, degree, graduationDate, gpa, achievements` | `school, degree, period, grade, description` |
| Skills | `resume.skills.categories[]` (categoría con `items: string[]`) | `resume.sections.skills.items[]` ([SkillItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#131-141) con `name, keywords[]`) |
| Certifications | `resume.certifications[]` con `name, issuer, issueDate` | `resume.sections.certifications.items[]` con `title, issuer, date` |
| Languages | `resume.languages[]` con `language, proficiency` | `resume.sections.languages.items[]` con `language, fluency` |
| Sección visible | `enabledCategories.includes('x')` | `!resume.sections.x.hidden` |
| Metadata id/title | `resume.metadata.id`, `resume.metadata.title` | `resume.metadata.notes` (id gestionado por DB), `resume.metadata.template` |
| Typography | `resume.metadata.typography` (`fontWeight: string`) | `resume.metadata.typography` (`fontWeights: string[]`) |
| Design colors | `resume.metadata.design.primary` (string directo) | `resume.metadata.design.colors.primary` (anidado en `colors`) |
| Page settings | `marginH, marginV, spacingH, spacingV, language` | `marginX, marginY, gapX, gapY, locale` |
| Page format | `'A4' \| 'Letter' \| 'Custom'` | `'a4' \| 'letter' \| 'free-form'` |
| Factory functions | [createExperienceEntry()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#155-165), [createEducationEntry()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#166-176), etc. | [createExperienceItem()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#79-94), [createEducationItem()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#95-111), etc. |

---

## Proposed Changes

> [!IMPORTANT]
> **Orden de ejecución obligatorio**: Las fases deben ejecutarse en orden porque los archivos modificados en fases anteriores son dependencias de los de fases posteriores. Cada fase debe dejar el proyecto compilable (`tsc --noEmit` sin errores) antes de pasar a la siguiente.

### Fase 1 — Migrar Settings Panel y tipos de metadata

El [SettingsPanel](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/SettingsPanel.tsx#122-307) usa tipos de settings ([TypographySettings](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#404-408), [DesignSettings](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#392-396), [PageSettings](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#23-31), etc.) que existen tanto en el viejo como en el nuevo schema pero con shapes diferentes.

#### [MODIFY] [SettingsPanel.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/SettingsPanel.tsx)

- Cambiar imports de `@/shared/types/resume` → `@resumate/schema`
- [CVMetadata](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#54-65) → [Metadata](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#409-418) (del schema)
- Los props de typography/design/page pasan a usar los tipos del schema
- `typography.body.fontWeight` (string) → `typography.body.fontWeights` (string[])
- `design.primary` → `design.colors.primary`, `design.text` → `design.colors.text`, etc.
- `page.language` → `page.locale`, `page.marginH` → `page.marginX`, `page.marginV` → `page.marginY`, `page.spacingH` → `page.gapX`, `page.spacingV` → `page.gapY`
- [PageFormat](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#21-22) de `'A4' | 'Letter' | 'Custom'` → `'a4' | 'letter' | 'free-form'`
- Eliminar imports de `DEFAULT_TYPOGRAPHY`, `DEFAULT_DESIGN`, `DEFAULT_PAGE` del viejo archivo (ya no necesarios, los defaults están en el schema)

---

### Fase 2 — Migrar section components

Cada componente de sección ([ExperienceSection](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#242-245), [EducationSection](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#246-249), etc.) usa los tipos viejos como props. Migrar a los tipos del schema.

#### [MODIFY] [ProfileSection.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/sections/sections/ProfileSection.tsx)

- [ProfileData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#78-87) → [Basics](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#49-58) (de `@resumate/schema`)
- `data.fullName` → `data.name`, `data.summary` eliminado (ahora es `summary.content` a nivel superior)
- `data.website` string → `data.website.url`

#### [MODIFY] [ExperienceSection.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/sections/sections/ExperienceSection.tsx)

- [ExperienceEntry](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#88-97) → [ExperienceItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#89-102) (de `@resumate/schema`)
- [createExperienceEntry](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#155-165) → [createExperienceItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#79-94)
- `e.startDate` / `e.endDate` → `e.period` (string único)

#### [MODIFY] [EducationSection.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/sections/sections/EducationSection.tsx)

- [EducationEntry](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#98-107) → [EducationItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#103-117)
- [createEducationEntry](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#166-176) → [createEducationItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#95-111)
- `e.institution` → `e.school`, `e.graduationDate` → `e.period`, `e.gpa` → `e.grade`, `e.achievements` → `e.description`

#### [MODIFY] [SkillsSection.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/sections/sections/SkillsSection.tsx)

- [SkillsData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#108-111) / [SkillCategory](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#112-117) → `SkillItem[]` (array plano, sin categorías)
- [createSkillCategory](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#177-183) → [createSkillItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#125-138)
- La UI que muestra "categorías con items" se simplifica a una lista de [SkillItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#131-141) con `name` y opcionalmente `keywords[]`

#### [MODIFY] [CertificationsSection.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/sections/sections/CertificationsSection.tsx)

- [CertificationEntry](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#118-126) → [CertificationItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#172-183)
- [createCertificationEntry](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#193-202) → [createCertificationItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#177-190)
- `c.name` → `c.title`, `c.issueDate` → `c.date`, `c.expirationDate` → campo en `c.description`

#### [MODIFY] [LanguagesSection.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/sections/sections/LanguagesSection.tsx)

- [LanguageEntry](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#127-132) → [LanguageItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#142-150)
- [createLanguageEntry](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#203-209) → [createLanguageItem](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#139-150)
- `l.proficiency` (enum de 5 valores) → `l.fluency` (string libre)

---

### Fase 3 — Migrar container components (CollapsibleSections, SectionModal, DynamicSections)

Estos componentes pasan datos a los section components. Necesitan usar los nuevos tipos en sus props y lógica interna.

#### [MODIFY] [CollapsibleSections.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/CollapsibleSections.tsx)

- Todos los tipos de props migran a los del schema
- [getSubItems()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/CollapsibleSections.tsx#27-70) se actualiza con los nombres de campos nuevos (`e.position` mantiene, `c.name` → `c.title`, `l.proficiency` → `l.fluency`, skills sin categorías)
- Props interface: `profile: Resume['profile']` → `basics: Basics`, `skills: SkillsData` → `skills: SkillItem[]`, etc.

#### [MODIFY] [SectionModal.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/SectionModal.tsx)

- Misma migración de tipos en imports, props, y factories
- [createExperienceEntry()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#155-165) → [createExperienceItem()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#79-94), etc.

#### [MODIFY] [DynamicSections.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/DynamicSections.tsx)

- Misma migración de tipos

---

### Fase 4 — Migrar FormBasedEditor, Preview, y Pages (eliminar useCVStore)

Esta es la fase central. [FormBasedEditor](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/FormBasedEditor.tsx#72-280) actualmente lee de `useCVStore` (legacy) y convierte a/desde el tipo nuevo vía el adapter. Después de esta fase, usa `useResumeStore` directamente.

#### [MODIFY] [FormBasedEditor.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/FormBasedEditor.tsx)

- Eliminar import de [oldToNewResume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/types/legacyAdapter.ts#29-93) y `useCVStore`
- Importar `useResumeStore` + selectores del nuevo store
- Mapear los action names: [updateProfile](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts#60-63) → [updateBasics](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/useResumeStore.ts#53-59), `updateTypography/Design/Page` → [updateMetadata({ typography/design/page: ... })](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/useResumeStore.ts#144-149)
- [addCategory](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts#103-109)/[removeCategory](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts#110-115)/[reorderCategories](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts#116-121) → implementar como toggles de `section.hidden` en el nuevo store (puede requerir agregar un par de actions a `useResumeStore`)
- `enabledCategories` ya no existe como array; derivar de `Object.entries(sections).filter(([,s]) => !s.hidden)`
- Auto-save: ya no necesita [oldToNewResume()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/types/legacyAdapter.ts#29-93), puede pasar [resume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/utils/markdownConverter.ts#4-71) directamente a la API
- [SettingsPanel](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/SettingsPanel.tsx#122-307) props: metadata ahora es el tipo nuevo, sin `DEFAULT_*` del viejo archivo
- `paperStyle` CSS vars: `design.primary` → `design.colors.primary`, `typography.body.fontWeight` → `typography.body.fontWeights[0]`, `page.marginV/marginH` → `page.marginY/marginX`

#### [MODIFY] [PreviewToolbar.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/PreviewToolbar.tsx)

- [Resume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#67-77) → [ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433)
- `resume.metadata.title` → `resume.metadata.template` (para filename) o usar un título separado

#### [MODIFY] [ResumePreview.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/components/components/preview/ResumePreview.tsx)

- [Resume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#67-77) → [ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433)
- `enabledCategories.includes('x')` → `!resume.sections.x.hidden`
- `resume.profile.fullName` → `resume.basics.name`
- `resume.profile.email/phone/location/linkedin` → `resume.basics.email/phone/location` + profiles
- `resume.profile.summary` → `resume.summary.content`
- `resume.experience[]` → `resume.sections.experience.items[]`
- Experience fields: `exp.startDate - exp.endDate` → `exp.period`
- `resume.education[]` → `resume.sections.education.items[]`
- Education fields: `edu.institution` → `edu.school`, `edu.graduationDate` → `edu.period`, `edu.gpa` → `edu.grade`, `edu.achievements` → `edu.description`
- `resume.skills.categories[]` → `resume.sections.skills.items[]`
- Skills render: `cat.name: cat.items.join(', ')` → `item.name: item.keywords.join(', ')`
- `resume.certifications[]` → `resume.sections.certifications.items[]` con `cert.name` → `cert.title`
- `resume.languages[]` → `resume.sections.languages.items[]` con `l.proficiency` → `l.fluency`

#### [MODIFY] [CVEditorPage.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/pages/CVEditorPage.tsx)

- Eliminar import de `useCVStore` y [newToOldResume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/types/legacyAdapter.ts#169-195)
- Usar `useResumeStore` → [setResume(cv.data)](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/useResumeStore.ts#46-49) directamente (ya es [ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433))

#### [MODIFY] [CreateCVPage.tsx](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/pages/CreateCVPage.tsx)

- [createEmptyResume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#367-381) de `@/shared/types/resume` → de `@resumate/schema`
- [Resume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#67-77) → [ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433)
- `cv.metadata.template` → `cv.metadata.template`, `cv.metadata.layoutVariant` → manejar dentro del nuevo metadata

#### [MODIFY] [useResumeStore.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/useResumeStore.ts)

- Agregar actions faltantes que `useCVStore` tenía pero el nuevo store no:
  - `toggleSectionHidden(sectionKey: string)` — reemplaza [addCategory](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts#103-109)/[removeCategory](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts#110-115)
  - `reorderSections(newOrder: string[])` — reemplaza [reorderCategories](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts#116-121) (implementar como reordenamiento del layout en `metadata.layout.pages`)

---

### Fase 5 — Migrar markdownConverter + Eliminar archivos legacy

#### [MODIFY] [markdownConverter.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/utils/markdownConverter.ts)

- [Resume](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#67-77) → [ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433)
- `resume.profile.fullName` → `resume.basics.name`
- `resume.experience[]` → `resume.sections.experience.items[]`
- Similar mapeo para education, skills, etc.
- [createCVMetadata()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#184-192) → ya no se usa, [markdownToResume()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/utils/markdownConverter.ts#143-191) devuelve [ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433) usando [createEmptyResume()](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/defaults.ts#367-381) del schema

#### [DELETE] [legacyAdapter.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/types/legacyAdapter.ts)

#### [DELETE] [useCVStore.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/stores/legacy/useCVStore.ts)

#### [DELETE] [resume.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts)

> [!CAUTION]
> Eliminar [resume.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts) solo después de confirmar que **ningún** archivo lo importa. Los `DEFAULT_TYPOGRAPHY`, `DEFAULT_DESIGN`, `DEFAULT_PAGE` exportados ahí se reemplazan por los valores del schema (`DEFAULT_METADATA.typography`, `DEFAULT_METADATA.design`, `DEFAULT_METADATA.page`).

#### [MODIFY] [features/resume/index.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/features/resume/index.ts)

- Eliminar `export * from './types/legacyAdapter.js'`
- Actualizar comentario que dice "Components still use legacy types"

---

## Verification Plan

### Automated — TypeScript Compilation

Después de cada fase, ejecutar:

```bash
cd c:\Users\Usuario\Desktop\DevProjects\Ideas\ResuMate
pnpm run typecheck
```

Esto ejecuta `tsc --noEmit` para el schema y el app. Si compila sin errores, los tipos están correctamente migrados.

### Automated — Build Check

Al finalizar todas las fases:

```bash
cd c:\Users\Usuario\Desktop\DevProjects\Ideas\ResuMate
pnpm run build
```

Verifica que Vite genera el bundle sin errores de runtime.

### Manual — Testing Funcional en el Browser

> [!NOTE]
> No hay tests unitarios en el proyecto actualmente. La verificación principal es manual.

1. **Iniciar el dev server** con `pnpm run dev` desde la raíz del proyecto
2. **Crear un CV nuevo**: Ir a `/new`, seleccionar un template, verificar que el editor carga sin errores en consola
3. **Editar el perfil**: Completar nombre, email, phone, location y verificar que se muestra en el preview en tiempo real
4. **Agregar experiencia**: Añadir una entrada, completar los campos, verificar que aparece en el preview
5. **Agregar educación, skills, certificaciones, idiomas**: Lo mismo para cada sección
6. **Cambiar settings**: Modificar tipografía, colores y márgenes, verificar reflejo en el preview
7. **Guardar y recargar**: Verificar que el auto-save funciona y al recargar la página el CV se carga correctamente sin errores
8. **Exportar JSON**: Usar el botón de exporta JSON y verificar que el archivo exportado tiene la estructura [ResumeData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/packages/schema/src/types.ts#425-433) del nuevo schema (con `basics`, `sections`, etc.)
