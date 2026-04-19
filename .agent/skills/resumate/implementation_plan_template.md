# Template System Redesign

The current template system is a monolithic `ResumePreview.tsx` component with a `TEMPLATE_STYLES` map that only swaps CSS class strings. All 4 templates (`jake-ryan`, `harvard`, `mit`, `stanford`) render the **same single-column HTML structure** — the only difference is heading alignment and border styles. The system doesn't support sidebars, columns, icons, or modern layouts, and it only renders 5 of the 12 available sections.

This plan redesigns the template system so each template is a **self-contained React component** with its own layout, section rendering, and visual identity — from minimalist ATS-friendly designs to modern multi-column creative templates.

---

## User Review Required

> [!IMPORTANT]
> **Template Selection**: The plan proposes 8 templates across 3 tiers. Review the list below and let me know if you want to add, remove, or rename any.

> [!IMPORTANT]  
> **OpenCode delegation**: You mentioned planning this "para opencode". Should the actual implementation of individual template components be delegated to OpenCode, or should I execute everything here? The plan is structured so each template is an independent file that can be built in isolation.

---

## Proposed Templates (8 total)

### Tier 1 — Classic / ATS-Friendly (single-column, no sidebar)

| ID | Name | Visual Style |
|----|------|-------------|
| `classic` | Classic | Clean single-column. Name centered, thin horizontal rules, serif-friendly. Think "Overleaf default". The safe default. |
| `harvard` | Harvard | Formal academic. Name centered, uppercase section headings with bottom border, italic dates. |
| `jake-ryan` | Jake Ryan | The LaTeX community favorite. Name centered bold, compact spacing, uppercase headings with colored underline. |
| `mit` | MIT | Technical/compact. Name left-aligned, grey background on section headings, minimal spacing. Dense. |

### Tier 2 — Modern / Two-Column (sidebar layout)

| ID | Name | Visual Style |
|----|------|-------------|
| `modern` | Modern | Left sidebar (35%) with colored background containing photo, contact, skills, languages. Main column has experience, education, projects. Icons for contact items. |
| `creative` | Creative | Bold header banner with primary color background + name/headline in white. Two-column body with a narrow left sidebar for skills/languages as pill tags. Rounded corners, accent gradients. |

### Tier 3 — Professional / Distinctive

| ID | Name | Visual Style |
|----|------|-------------|
| `executive` | Executive | Full-width header with name + headline. Subtle left accent bar (4px primary color) on each section. Single column but with skills rendered as a two-column grid. Refined, senior-level feel. |
| `minimal` | Minimal | Ultra-clean. No borders, no rules, no color except text. Name in large weight, generous whitespace, monospaced dates. Designed for design/typography-aware roles. |

---

## Current Problems to Fix

1. **Only 5 of 12 sections rendered** — `profiles`, `projects`, `awards`, `volunteer`, `publications`, `interests`, `references` are all missing from `ResumePreview.tsx`
2. **No sidebar/two-column support** — The schema has `layout.pages[].main` and `layout.pages[].sidebar` arrays + `sidebarWidth`, but the preview ignores them entirely
3. **No layout rendering engine** — Templates all share one HTML structure; there's no way for a template to define its own layout
4. **`HarvardTemplate.ts` is dead code** — Uses its own `ResumeData` type, completely disconnected from `@resumate/schema`
5. **Template thumbnails missing** — `previewImage` points to `/templates/*.png` files that don't exist

---

## Architecture

```
app/src/templates/
├── index.ts                    # Registry: TemplateId, CVTemplate[], metadata
├── registry.ts                 # Maps TemplateId → React component (lazy)
│
├── shared/                     # Shared rendering primitives
│   ├── SectionRenderer.tsx     # Generic section → items renderer
│   ├── ContactInfo.tsx         # Renders email/phone/location/website/profiles
│   ├── SectionHeading.tsx      # Configurable heading (border, bg, icon, etc.)
│   ├── EntryBlock.tsx          # Experience/education/project/cert entry
│   ├── SkillsBlock.tsx         # Skills with keywords, badges, or levels
│   ├── sanitize.ts             # DOMPurify wrapper (extracted from preview)
│   └── types.ts                # Common template prop types
│
├── classic/
│   └── ClassicTemplate.tsx     # Full-page React component
├── harvard/
│   └── HarvardTemplate.tsx
├── jake-ryan/
│   └── JakeRyanTemplate.tsx
├── mit/
│   └── MitTemplate.tsx
├── modern/
│   └── ModernTemplate.tsx      # Two-column with sidebar
├── creative/
│   └── CreativeTemplate.tsx    # Banner header + sidebar
├── executive/
│   └── ExecutiveTemplate.tsx
└── minimal/
    └── MinimalTemplate.tsx
```

Each template is a **standalone React component** that receives `ResumeData` and renders the entire CV. Templates can use shared primitives or render custom HTML entirely on their own.

```tsx
// Template component contract
interface TemplateProps {
  resume: ResumeData;
}

// Example: app/src/templates/modern/ModernTemplate.tsx
export function ModernTemplate({ resume }: TemplateProps) {
  // Full control over layout, sections, and styling
}
```

### ResumePreview becomes a thin dispatcher

```tsx
// app/src/features/resume/components/preview/ResumePreview.tsx
export function ResumePreview({ resume }: { resume: ResumeData }) {
  const Template = getTemplateComponent(resume.metadata.template);
  return <Template resume={resume} />;
}
```

---

## Proposed Changes

### Phase 1: Foundation — Shared primitives + dispatcher

#### [NEW] `app/src/templates/shared/types.ts`
- `TemplateProps` interface
- `SectionKey` type (all 12 standard section keys)

#### [NEW] `app/src/templates/shared/sanitize.ts`
- Extract `sanitizeHtml()` from `ResumePreview.tsx`

#### [NEW] `app/src/templates/shared/SectionRenderer.tsx`
- Takes a `sectionKey` and `resume`, renders the correct items
- Handles `hidden` check, empty check, and section title
- Used by all templates to avoid duplicating section logic

#### [NEW] `app/src/templates/shared/ContactInfo.tsx`
- Renders email, phone, location, website, and profile links
- Supports horizontal (single-column) and stacked (sidebar) layouts
- Optionally shows icons via lucide-react

#### [NEW] `app/src/templates/shared/EntryBlock.tsx`
- Renders a single experience/education/project/certification/award/volunteer/publication entry
- Configurable: title/subtitle/dates position, description rendering

#### [NEW] `app/src/templates/shared/SkillsBlock.tsx`
- Renders skills in different modes: inline keywords, tag pills, level bars, two-column grid

#### [NEW] `app/src/templates/registry.ts`
- `getTemplateComponent(templateId: string): React.ComponentType<TemplateProps>`
- Uses `React.lazy()` for code-splitting

#### [MODIFY] `app/src/templates/index.ts`
- Add new template IDs to `TemplateId` union
- Add entries to `CV_TEMPLATES` array with metadata
- Keep `CVTemplate` interface, add `category: 'classic' | 'modern' | 'professional'`

#### [MODIFY] `app/src/features/resume/components/preview/ResumePreview.tsx`
- Replace monolithic component with thin dispatcher that loads template from registry
- Remove `TEMPLATE_STYLES` map (logic moves to individual templates)

#### [DELETE] `app/src/templates/HarvardTemplate.ts`
- Dead code with its own incompatible types

---

### Phase 2: Classic templates (Tier 1)

Build the 4 single-column templates. These are the simplest since they're single-column, no sidebar:

#### [NEW] `app/src/templates/classic/ClassicTemplate.tsx`
#### [NEW] `app/src/templates/harvard/HarvardTemplate.tsx`
#### [NEW] `app/src/templates/jake-ryan/JakeRyanTemplate.tsx`
#### [NEW] `app/src/templates/mit/MitTemplate.tsx`

Each renders **all 12 sections** (when not hidden and not empty), respecting `metadata.layout.pages[0].main` order. These are the most ATS-friendly — pure single-column, clean HTML.

---

### Phase 3: Modern templates (Tier 2)

Build the two-column templates that use `metadata.layout`:

#### [NEW] `app/src/templates/modern/ModernTemplate.tsx`
- Reads `layout.pages[0].main` and `layout.pages[0].sidebar`
- Left sidebar with `sidebarWidth`% width, colored background from `design.colors.primary`
- Photo support (from `picture`)
- Contact info stacked vertically with icons
- Skills rendered as tag pills

#### [NEW] `app/src/templates/creative/CreativeTemplate.tsx`
- Full-width header banner with primary color gradient
- Name + headline in white text over the banner
- Below: narrow left sidebar + wide main column
- Skills as rounded pill tags, bold accent colors

---

### Phase 4: Professional templates (Tier 3)

#### [NEW] `app/src/templates/executive/ExecutiveTemplate.tsx`
- Thick left accent border per section
- Two-column skills grid
- Refined spacing, larger body text

#### [NEW] `app/src/templates/minimal/MinimalTemplate.tsx`
- No borders, no colors, no rules
- Name in extra-large weight
- Monospaced dates
- Maximum whitespace

---

### Phase 5: Template Picker update + thumbnails

#### [MODIFY] `app/src/features/resume/components/TemplatePicker.tsx`
- Group templates by category (Classic, Modern, Professional)
- Show category tabs/headers
- Update grid to handle 8 templates (currently 4)

#### [NEW] Template thumbnail images
- Generate preview thumbnails for each template (can use generate_image tool or screenshots)
- Place in `app/public/templates/`

#### [MODIFY] `packages/schema/src/defaults.ts`
- Change `DEFAULT_METADATA.template` from `'classic'` to match actual default template ID

---

## Open Questions

1. **Which templates should OpenCode build?** All of them, or should I build the foundation + one reference template and OpenCode builds the rest?

2. **Section ordering** — Should templates respect `metadata.layout.pages[0].main` array for section order, or should each template have its own hardcoded order?

3. **Photo support** — The schema has a `picture` object. Should the modern/creative templates render the photo, or skip it for now?

4. **Per-template default metadata** — When a user picks a template, should it override their metadata (colors, fonts, margins) with template-specific defaults? E.g., picking "Modern" could set `primary: '#6366f1'` and `fontFamily: 'Poppins'`.

5. **Template thumbnails** — Should I generate static image thumbnails, or render live mini-previews using the actual template components with dummy data?

---

## Verification Plan

### Automated
- Verify all templates render without errors with `createEmptyResume()` data
- Verify all templates render the full sample CV data (all 12 sections populated)
- Verify PDF export works with each template via Puppeteer

### Manual  
- Visual review of each template in the editor preview
- Template switching in the TemplatePicker
- PDF download for each template
