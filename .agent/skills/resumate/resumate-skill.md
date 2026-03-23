---
name: resumate
description: "ResuMate is an open-source CV builder. Use this skill when working on ResuMate features, bug fixes, or refactoring."
---

# ResuMate Development Skill

## When to Use This Skill

Use this skill when:
- Building new features for ResuMate
- Fixing bugs in the CV editor or templates
- Refactoring frontend or backend code
- Adding new templates
- Implementing i18n
- Working on authentication or sharing features

## Project Context

See [context.md](./context.md) for full project overview.

## Quick Start

### Build
```bash
npm run build  # Builds @resumate/schema then resumate (app)
```

### Development
```bash
npm run dev        # Starts app dev server
cd server && npm run dev  # Starts backend
```

### Key Commands
```bash
npm run lint    # Lint all packages
npx tsc --noEmit  # Type-check without building
```

## Architecture Guidelines

### Frontend Structure
- **Feature-sliced**: `app/src/features/{resume,templates,dashboard,ai}/`
- **Shared**: `app/src/shared/` for UI primitives, hooks, lib
- **Pages**: `app/src/pages/` for route components

### Backend Structure
- **Modules**: `server/src/modules/{resume,auth,share,ai}/`
- **Pattern**: Routes → Controller → Service → Repository
- **Validation**: AJV middleware for request validation

### Schema Package
- **Location**: `packages/schema/src/`
- **Schema**: `resume.schema.json` (AJV compatible, draft 2020-12)
- **Types**: Auto-generated TypeScript types from schema
- **Validation**: Shared AJV validation functions

## Type Migration (In Progress)

The frontend is transitioning from old `Resume` type to new `ResumeData` from `@resumate/schema`.

### Old Type (deprecated)
```typescript
// app/src/shared/types/resume.ts
interface Resume {
  metadata: CVMetadata;
  profile: ProfileData;
  experience: ExperienceEntry[];
  // ...
}
```

### New Type
```typescript
// packages/schema/src/types.ts
interface ResumeData {
  picture: Picture;
  basics: Basics;
  summary: Summary;
  sections: Sections;
  customSections: CustomSection[];
  metadata: Metadata;
}
```

### Migration Notes
- API service (`cv.service.ts`) uses `ResumeData`
- Store (`useCVStore`) still uses old `Resume` type
- Components that pass data to API need type assertions: `as unknown as ResumeData`
- Full migration tracked in implementation plan

## Template Development

### Registry Pattern
Templates are registered in `features/templates/registry.ts`:
```typescript
export interface TemplateDefinition {
  id: string;
  name: string;
  preview: string;
  component: React.FC<ResumeProps>;
  supports: {
    sidebar: boolean;
    multiColumn: boolean;
    customCSS: boolean;
  };
}
```

### Template Structure
```
features/templates/
├── registry.ts       # Template registration
├── components/       # Template React components
└── shared/          # Shared template utilities
```

## Common Patterns

### Adding a New Section Type
1. Add type definition to `packages/schema/src/types.ts`
2. Add JSON Schema to `packages/schema/src/sections/`
3. Add validation schema to `packages/schema/src/validate.ts`
4. Add form component in `features/resume/components/sections/`
5. Add to template rendering

### API Changes
1. Update `server/src/modules/resume/resume.controller.ts`
2. Update `server/src/modules/resume/resume.service.ts`
3. Update `server/src/modules/resume/resume.repository.ts`
4. Update `app/src/shared/services/cv.service.ts`
5. Update types if needed

### Database Migrations
```bash
cd server
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Important Conventions

1. **JSON Schema**: Use draft 2020-12, `$id` for AJV references
2. **API Responses**: Consistent error format `{ error: string, details?: any }`
3. **State Updates**: Use Zustand with immer for immutable updates
4. **Component Props**: Prefer explicit interfaces over inline types
5. **i18n**: Use react-i18next, keys go in `shared/i18n/locales/`

## File Locations

| Purpose | Path |
|---------|------|
| Frontend types (old) | `app/src/shared/types/resume.ts` |
| Schema types (new) | `packages/schema/src/types.ts` |
| JSON Schema | `packages/schema/src/resume.schema.json` |
| Backend routes | `server/src/modules/resume/` |
| Frontend store | `app/src/features/resume/stores/` |
| Templates | `app/src/features/templates/` |
| CV Editor | `app/src/cv-editor/` |
| Implementation Plan | `.agent/skills/resumate/implementation_plan.md` |

## Troubleshooting

### Build Errors
If `npm run build` fails with type errors in `FormBasedEditor.tsx`:
- The store returns old `Resume` type, API expects `ResumeData`
- Use type assertion: `data as unknown as ResumeData`
- Full migration tracked in implementation plan

### Path Alias Issues
`@/` alias maps to `app/src/`. Verify in `app/tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### AJV Validation Errors
If validation fails at runtime, check:
1. Schema is loaded with `$schema: "https://json-schema.org/draft/2020-12/schema"`
2. Meta-schema is loaded: `Ajv({ meta: true, strict: false })`
3. Schema has `$id` for reference resolution
