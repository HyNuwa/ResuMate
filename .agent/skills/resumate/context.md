# ResuMate Project Context

## Project Overview

ResuMate is an open-source CV/resume builder inspired by Reactive Resume. Key priorities:
- **Privacy-first** — encrypted data, full export, no vendor lock-in
- **High customization** — 12+ templates, Google Fonts, CSS custom, drag-and-drop sections
- **Integrated AI** — writing improvement, ATS analysis, job description tailoring
- **Multilingual** — interface and CVs in multiple languages (i18n)
- **Real-time preview** — WYSIWYG editing
- **Flexible export** — PDF, JSON Resume, shareable links with password & tracking

## Architecture

### Tech Stack
- **Frontend**: Vite + React 19 + TailwindCSS v4
- **Backend**: Express 5 + PostgreSQL + Drizzle ORM + pgvector
- **AI**: OpenRouter (LangChain)
- **Scraper**: Python (Crawl4AI)

### Directory Structure
```
resumate/
├── packages/
│   └── schema/           # Shared JSON Schema + TypeScript types
├── server/               # Express backend
│   └── src/
│       ├── modules/      # resume, auth, share, ai, scraper
│       └── db/           # Drizzle schema + migrations
└── app/                  # React frontend
    └── src/
        ├── features/     # Feature-sliced (resume, templates, dashboard, ai)
        ├── shared/       # UI components, hooks, lib
        └── pages/        # Route pages
```

## Current State (Phase 3)

### Working
- Frontend SPA with TipTap rich text editor
- CV editor with 13+ components, dnd-kit
- Zustand state management with undo/redo
- Express API with 4 route groups
- PostgreSQL + Drizzle ORM + pgvector
- Basic OpenRouter AI optimization
- Python CV scraper integration
- 1 template (Harvard)

### Known Issues
- TypeScript types in `app/src/shared/types/resume.ts` don't align with `packages/schema/src/types.ts`
- AJV validation not yet integrated in server middleware
- Server `index.ts` is monolithic (345 lines)
- Single Zustand store for everything (performance issues)
- Mixed folder structure (`consonants/`, `cv-editor/`, `shared/`)
- `user_cvs.data` is `jsonb` without schema enforcement
- Only 1 template (goal: 12+)
- No i18n (Spanish hardcoded)
- No authentication
- No shareable links

## Key Types

### Old (in `app/src/shared/types/resume.ts`)
```typescript
interface Resume {
  metadata: CVMetadata;
  profile: ProfileData;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillsData;
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  enabledCategories: string[];
}
```

### New (in `packages/schema/src/types.ts`)
```typescript
interface ResumeData {
  picture: Picture;
  basics: Basics;
  summary: Summary;
  sections: Sections;
  customSections: CustomSection[];
  metadata: Metadata;
}
```

**Migration Status**: The `@resumate/schema` package is created and builds successfully. The API service (`cv.service.ts`) uses `ResumeData`. However, the frontend store (`useCVStore`) and most components still use the old `Resume` type. This creates type mismatches that require type assertions (`as unknown as ResumeData`) to compile.

## Database Schema

**Table `user_cvs`** (current):
```sql
user_cvs(id UUID, title TEXT, data JSONB, created_at, updated_at)
```

**Table `user_cvs`** (target):
```sql
user_cvs(
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  schema_version TEXT NOT NULL,
  data JSONB NOT NULL,
  visibility TEXT DEFAULT 'private',
  password_hash TEXT,
  view_count INTEGER DEFAULT 0,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Conventions

- **Path aliases**: `@/` maps to `app/src/`
- **Schema package**: `@resumate/schema` is a workspace dependency
- **API endpoints**: `/api/resumes` for CV CRUD operations
- **State management**: Zustand with feature-sliced stores (in progress)
- **Templates**: Registry pattern with `TemplateDefinition` interface
