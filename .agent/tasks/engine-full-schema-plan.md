# CV Engine: Full Schema Consumption & Dynamic Rendering

## Goal
Make the CV engine fully consume every field in the `ResumeData` schema, like Reactive Resume does. Currently only ~40% of the schema fields are read by the rendering engine. After this work, 100% of the schema drives the visual output.

## Context
- Schema types: `packages/schema/src/types.ts`
- Schema defaults: `packages/schema/src/defaults.ts`
- Template components: `app/src/templates/*/`
- Shared primitives: `app/src/templates/shared/`
- Editor (CSS var provider): `app/src/features/resume/components/FormBasedEditor.tsx`
- Printer page: `app/src/pages/PrinterPage.tsx`

The schema already defines ALL the fields below — they are persisted in the DB JSONB column. The problem is the rendering engine ignores most of them.

---

## Phase 1: Layout Engine (layout.pages[].main / sidebar)

**This is the most critical missing piece.** Currently every template hardcodes which sections go where. Instead, templates should READ `metadata.layout.pages[0].main` and `metadata.layout.pages[0].sidebar` to decide what renders in each column.

### Files to modify

#### `app/src/templates/shared/LayoutEngine.tsx` [NEW]
Create a layout engine component that:
1. Reads `resume.metadata.layout.pages[0]` (start with page 0)
2. If `fullWidth === true` OR `sidebar.length === 0`: render single column
3. Otherwise: render two columns (main + sidebar) with `sidebarWidth`%
4. For each section ID in `main[]` and `sidebar[]`, look up the section from `resume.sections[sectionId]` or `resume.summary` (if id === 'summary')
5. Render each section using a provided `renderSection(sectionKey, section)` callback

```tsx
interface LayoutEngineProps {
  resume: ResumeData;
  renderSection: (key: string, position: 'main' | 'sidebar') => React.ReactNode;
  sidebarStyle?: React.CSSProperties;  // e.g., background color for Modern template
  mainStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  gapX?: number;  // from metadata.page.gapX
}
```

#### Modify ALL template files to use LayoutEngine
Instead of hardcoding sections, each template should:
1. Define its visual wrapper (header, name, contact rendering)
2. Pass `renderSection` callback to `LayoutEngine` which renders section headings + items with template-specific styling
3. The layout engine handles which sections go where based on the schema

**Example for ModernTemplate:**
```tsx
export const ModernTemplate = memo(function ModernTemplate({ resume }) {
  const { layout } = resume.metadata;
  
  return (
    <div style={baseTextStyle}>
      {/* Template-specific header */}
      <NameBlock ... />
      
      {/* Layout engine reads layout.pages[0].main/sidebar */}
      <LayoutEngine
        resume={resume}
        sidebarStyle={{ background: primaryColor, color: 'white', padding: '16pt' }}
        renderSection={(key, position) => {
          // Each template controls HOW sections look
          return <SectionBlock key={key} sectionKey={key} resume={resume} position={position} />;
        }}
      />
    </div>
  );
});
```

**For single-column templates (Classic, Harvard, MIT, Jake Ryan):**
They can either:
- Use LayoutEngine with `sidebar: []` which renders single column
- Or keep their current structure but read `layout.pages[0].main` for section ORDER

---

## Phase 2: Picture Rendering

### `app/src/templates/shared/PictureBlock.tsx` [NEW]
Create a component that renders the user's photo:

```tsx
interface PictureBlockProps {
  picture: Picture;
  style?: React.CSSProperties;
}
```

The component should:
1. If `picture.hidden` or `!picture.url` → return null
2. Render `<img>` with:
   - `width/height` from `picture.size`
   - `borderRadius` from `picture.borderRadius` (px)
   - `border` from `picture.borderWidth` + `picture.borderColor`
   - `boxShadow` from `picture.shadowWidth` + `picture.shadowColor`
   - `transform: rotate(${picture.rotation}deg)`
   - `aspectRatio` from `picture.aspectRatio`
   - `objectFit: 'cover'`

### Integrate into templates
- **Modern**: Show photo at top of sidebar
- **Creative**: Show photo in the header banner
- **Executive**: Small photo next to name
- **Classic/Harvard/MIT/Jake Ryan**: Don't show photo (academic style)

---

## Phase 3: Missing metadata.page fields

### 3a: `page.gapX` and `page.gapY`

These should control spacing:
- `gapX`: horizontal gap between main and sidebar columns (used in LayoutEngine)
- `gapY`: vertical gap between sections

**Modify `LayoutEngine.tsx`** to use `gapX` for column gap.
**Modify `SectionRenderer.tsx`** to add `marginBottom: gapY` to each section container.

Pass these values through CSS vars:
```tsx
// In FormBasedEditor.tsx and PrinterPage.tsx paperStyle:
'--preview-gap-x': `${metadata.page.gapX}px`,
'--preview-gap-y': `${metadata.page.gapY}px`,
```

### 3b: `page.hideIcons`

**Modify `ContactInfo.tsx`**: Read this from resume data or accept as prop.
When `hideIcons === true`, don't render the Mail/Phone/MapPin/Globe/Linkedin/Github lucide icons.

The easiest way: add a `hideIcons` prop to ContactInfo (already has `showIcons`, but templates need to pass the schema value):
```tsx
<ContactInfo 
  showIcons={!resume.metadata.page.hideIcons}
  ...
/>
```

---

## Phase 4: Section columns

Each section has a `columns` field (1, 2, or 3). This controls how many columns the ITEMS within that section render in.

### Modify `SectionRenderer.tsx`
When `section.columns > 1`, wrap items in a CSS grid:
```tsx
const gridStyle = section.columns > 1 ? {
  display: 'grid',
  gridTemplateColumns: `repeat(${section.columns}, 1fr)`,
  gap: 'var(--preview-gap-x, 16px)',
} : {};

return (
  <div>
    {renderHeading?.(section.title)}
    <div style={gridStyle}>
      {items.map(...)}
    </div>
  </div>
);
```

This is especially useful for Skills (2 columns), Languages (2-3 columns), and Interests.

---

## Phase 5: Design level display

`metadata.design.level` controls how skill/language proficiency levels are shown.

### Modify `SkillsBlock.tsx` and `LanguagesBlock.tsx`
Add a `levelDisplay` prop that reads from `metadata.design.level.type`:

| `level.type` | Visual |
|---|---|
| `'hidden'` | Don't show level indicator |
| `'circle'` | 5 circles, filled up to `skill.level` |
| `'square'` | 5 squares, filled up to `skill.level` |
| `'rectangle'` | Thin rectangle bar, partially filled |
| `'rectangle-full'` | Full-width bar, partially filled |
| `'progress-bar'` | Rounded progress bar with percentage |
| `'icon'` | Custom icon repeated `skill.level` times |

### `app/src/templates/shared/LevelIndicator.tsx` [NEW]
```tsx
interface LevelIndicatorProps {
  level: number;        // 0-5
  maxLevel?: number;    // default 5
  type: LevelDisplayType;
  icon?: string;        // for 'icon' type
  primaryColor?: string;
}
```

---

## Phase 6: Custom CSS injection

### Modify `FormBasedEditor.tsx` and `PrinterPage.tsx`
When `metadata.css.enabled === true` and `metadata.css.value` is non-empty:
1. Inject a `<style>` tag with the custom CSS inside the paper div
2. Scope it to the paper container to avoid leaking styles

```tsx
{metadata.css.enabled && metadata.css.value && (
  <style>{`.paper-container { ${metadata.css.value} }`}</style>
)}
```

Or use a scoped approach with a unique class on the paper div.

---

## Phase 7: Custom Sections rendering

### Modify each template
After rendering all standard sections, iterate over `resume.customSections`:

```tsx
{resume.customSections
  .filter(cs => !cs.hidden)
  .map(cs => (
    <div key={cs.id}>
      <SectionHeading title={cs.title} variant={headingVariant} />
      {cs.items.map(item => renderCustomItem(cs.type, item))}
    </div>
  ))
}
```

### `app/src/templates/shared/CustomSectionRenderer.tsx` [NEW]
Maps `cs.type` to the correct entry component:
- `'experience'` → ExperienceEntry
- `'education'` → EducationEntry
- `'skills'` → SkillsBlock
- etc.

---

## Phase 8: Missing basics fields

### 8a: `basics.headline`
All templates should show headline under the name when present. Currently only Modern/Creative/Executive/Minimal show it. Add to Classic, Harvard, MIT, Jake Ryan.

### 8b: `basics.customFields[]`
Each custom field has `{ id, icon, text, link }`.
**Modify `ContactInfo.tsx`** to render custom fields alongside standard contact items.

### 8c: `item.options.showLinkInTitle`
When `options.showLinkInTitle === true`, the entry title should be wrapped in an `<a>` tag linking to `item.website.url`.

**Modify all Entry components** in `EntryBlock.tsx`:
```tsx
const titleContent = item.options?.showLinkInTitle && item.website?.url ? (
  <a href={item.website.url} style={{ color: 'inherit', textDecoration: 'underline' }}>
    {titleText}
  </a>
) : titleText;
```

---

## Phase 9: Dynamic Google Fonts loader

### `app/src/shared/hooks/useFontLoader.ts` [NEW]
Currently only 5 fonts are hardcoded in `index.html`. Create a hook that:
1. Reads `metadata.typography.body.fontFamily` and `metadata.typography.heading.fontFamily`
2. Dynamically creates a Google Fonts `<link>` tag for those families + weights
3. Removes old link tags when fonts change
4. Handles deduplication

```tsx
export function useFontLoader(typography: TypographySettings) {
  useEffect(() => {
    const families = new Set<string>();
    
    const addFamily = (style: FontStyle) => {
      const weights = style.fontWeights.join(';');
      families.add(`family=${style.fontFamily}:wght@${weights}`);
    };
    
    addFamily(typography.body);
    addFamily(typography.heading);
    
    const url = `https://fonts.googleapis.com/css2?${[...families].join('&')}&display=swap`;
    
    const link = document.createElement('link');
    link.id = 'resumate-dynamic-fonts';
    link.rel = 'stylesheet';
    link.href = url;
    
    // Remove old one
    document.getElementById('resumate-dynamic-fonts')?.remove();
    document.head.appendChild(link);
    
    return () => link.remove();
  }, [typography.body.fontFamily, typography.heading.fontFamily,
      JSON.stringify(typography.body.fontWeights),
      JSON.stringify(typography.heading.fontWeights)]);
}
```

### Use in:
- `FormBasedEditor.tsx` — for live preview
- `PrinterPage.tsx` — for PDF generation

Remove the hardcoded font link from `index.html` (keep the preconnect).

---

## Execution Order

Do these in order — each phase builds on the previous:

1. **Phase 3** (gapX/Y, hideIcons) — Quick wins, small changes
2. **Phase 8** (headline, customFields, showLinkInTitle) — Small but visible improvements
3. **Phase 5** (level display) — New component, improves skills rendering
4. **Phase 4** (section columns) — Small change in SectionRenderer
5. **Phase 2** (picture) — New component + template integration
6. **Phase 9** (font loader) — New hook, improves typography
7. **Phase 1** (layout engine) — **Largest change**, refactors all templates
8. **Phase 6** (custom CSS) — Simple injection
9. **Phase 7** (custom sections) — New renderer + template changes

---

## Verification

After each phase:
1. Open the editor and verify the preview reflects changes
2. Check browser console for errors
3. Test with the "Classic" template (single column) and "Modern" template (two columns)
4. Verify the settings panel controls (right sidebar) still work

Final verification:
- Save a CV, reload, verify all settings persist
- Export as PDF with Puppeteer, verify PDF reflects all visual settings
- Change template, verify layout changes accordingly
