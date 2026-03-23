# ResuMate — Plan de Refactorización Open-Source

## Visión del Producto

ResuMate es un **creador de CVs de código abierto** donde la **seguridad es prioridad** y los **datos pertenecen al usuario**. Inspirado en [Reactive Resume](https://github.com/amruthpillai/reactive-resume), con:

- 🔒 **Privacidad primero** — datos encriptados, exportación completa, sin vendor lock-in
- ✨ **Alta personalización** — 12+ plantillas, Google Fonts, CSS custom, drag-and-drop de secciones
- 🤖 **IA integrada** — mejora de redacción, análisis ATS, tailoring por job description
- 🌍 **Multilingüe** — interfaz y CVs en múltiples idiomas (i18n)
- 👁️ **Vista previa en tiempo real** — edición WYSIWYG instantánea
- 📤 **Exportación flexible** — PDF, JSON Resume, enlaces compartibles con contraseña y tracking

---

## Estado Actual del Codebase

### Lo que ya existe y funciona

| Componente | Estado | Tecnología |
|---|---|---|
| Frontend SPA | ✅ Funcional | Vite + React 19 + TailwindCSS v4 |
| Editor de CV | ✅ Funcional | 13 componentes, TipTap, dnd-kit |
| State Management | ✅ Con undo/redo | Zustand (1 store monolítico) |
| API Backend | ✅ Funcional | Express 5, 4 grupos de rutas |
| Base de Datos | ✅ Funcional | PostgreSQL + Drizzle ORM + pgvector |
| Optimización IA | ✅ Básica | OpenRouter (LangChain) |
| Scraper de CVs | ✅ Integrado | Python (Crawl4AI) |
| Templates | ⚠️ Solo 1 | HarvardTemplate |

### Problemas Identificados

| Problema | Impacto |
|---|---|
| TypeScript types ([resume.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts)) no alineados con JSON Schema ([schema.json](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/.agent/skills/resumate/schema/schema.json)) | Datos inconsistentes entre frontend/backend |
| No hay validación AJV | Datos corruptos pueden guardarse |
| Server [index.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/server/src/index.ts) monolítico (345 líneas de config) | Difícil de mantener/testear |
| Un solo store Zustand para todo | Re-renders innecesarios |
| Carpetas mezcladas (`consonants/`, `cv-editor/`, `shared/`) | Sin arquitectura clara |
| `user_cvs.data` es `jsonb` sin schema | No hay garantía de estructura |
| Solo 1 template implementado | Lejos del objetivo de 12+ |
| Sin i18n | Solo español hardcoded |
| Sin autenticación | Todo anónimo |
| Sin enlaces compartibles | Feature faltante |

---

## Arquitectura Propuesta

### Estructura Inspirada en Reactive Resume

```
resumate/
├── packages/
│   └── schema/                  # [NEW] Paquete compartido
│       ├── src/
│       │   ├── resume.schema.json   # JSON Schema maestro (AJV)
│       │   ├── sections/            # Sub-schemas por sección
│       │   ├── metadata.schema.json
│       │   ├── defaults.ts          # Valores por defecto
│       │   ├── types.ts             # Types auto-generados del schema
│       │   └── validate.ts          # Funciones AJV compartidas
│       └── package.json
│
├── server/
│   └── src/
│       ├── app.ts                   # Express app factory
│       ├── server.ts                # Bootstrap del servidor
│       ├── middleware/              # [NEW] Middlewares separados
│       │   ├── security.ts
│       │   ├── validation.ts        # AJV middleware
│       │   ├── geolocation.ts
│       │   └── error-handler.ts
│       ├── modules/
│       │   ├── resume/              # [REFACTOR] Antes "model" + "cv-sync"
│       │   │   ├── resume.controller.ts
│       │   │   ├── resume.service.ts
│       │   │   ├── resume.repository.ts
│       │   │   └── resume.routes.ts
│       │   ├── auth/                # [NEW]
│       │   ├── share/               # [NEW] Enlaces compartibles
│       │   ├── ai/                  # [REFACTOR] IA centralizada
│       │   └── scraper/
│       └── db/
│           ├── schema.ts            # Drizzle schema actualizado
│           └── migrations/
│
├── app/
│   └── src/
│       ├── app/                     # App shell (router, providers)
│       │   ├── router.tsx
│       │   └── providers.tsx
│       ├── features/               # [NEW] Feature-sliced
│       │   ├── resume/
│       │   │   ├── components/
│       │   │   │   ├── editor/      # Editor principal
│       │   │   │   ├── sections/    # Formularios por sección
│       │   │   │   ├── preview/     # Preview en tiempo real
│       │   │   │   └── settings/    # Panel de configuración
│       │   │   ├── stores/          # Zustand stores de resume
│       │   │   │   ├── resume.store.ts
│       │   │   │   └── editor.store.ts
│       │   │   ├── hooks/
│       │   │   ├── services/        # API calls
│       │   │   └── types/
│       │   ├── templates/
│       │   │   ├── registry.ts
│       │   │   ├── components/      # Template renderers
│       │   │   └── shared/          # Utilidades compartidas
│       │   ├── ai/
│       │   ├── dashboard/           # Lista de CVs
│       │   └── share/               # Vista pública de CV
│       ├── shared/
│       │   ├── components/ui/       # Radix + shadcn primitives
│       │   ├── components/common/   # Logo, Layout, etc.
│       │   ├── hooks/
│       │   ├── lib/                 # queryClient, utils
│       │   └── i18n/               # [NEW] Internacionalización
│       └── main.tsx
```

---

## Fases de Implementación

### Fase 1 — Schema & Base de Datos (AJV Foundation)

> [!IMPORTANT]
> Esta es la fase más crítica. Todo el sistema depende del schema. Debemos definirlo bien antes de escribir código.

#### 1.1 Crear paquete `@resumate/schema`

El JSON Schema actual en [.agent/skills/resumate/schema/schema.json](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/.agent/skills/resumate/schema/schema.json) (2895 líneas) está bien como referencia, pero necesita adaptarse:

**Cambios clave vs. schema actual:**
- Agregar campo `$version` para versionado del schema
- Agregar `$id` para referencia AJV
- Separar en sub-schemas por sección (composability)
- Generar TypeScript types automáticamente desde el schema
- Incluir `defaults` para cada sección (para crear CVs vacíos)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://resumate.dev/schema/resume/v1",
  "$version": "1.0.0",
  "type": "object",
  "properties": {
    "basics": { "$ref": "#/$defs/basics" },
    "picture": { "$ref": "#/$defs/picture" },
    "summary": { "$ref": "#/$defs/summary" },
    "sections": { "$ref": "#/$defs/sections" },
    "customSections": { "$ref": "#/$defs/customSections" },
    "metadata": { "$ref": "#/$defs/metadata" }
  },
  "$defs": { /* sub-schemas */ }
}
```

#### 1.2 Migrar DB Schema (Drizzle)

**Tabla `user_cvs` actual:**
```sql
user_cvs(id UUID, title TEXT, data JSONB, created_at, updated_at)
```

**Tabla `user_cvs` refactorizada:**
```sql
user_cvs(
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),     -- [NEW] Relación con usuario
  title TEXT NOT NULL,
  slug TEXT UNIQUE,                       -- [NEW] Para URLs compartibles
  schema_version TEXT NOT NULL,           -- [NEW] Versión del schema
  data JSONB NOT NULL,                    -- Validado con AJV antes de guardar
  visibility TEXT DEFAULT 'private',     -- [NEW] private | public | link
  password_hash TEXT,                     -- [NEW] Protección por contraseña
  view_count INTEGER DEFAULT 0,          -- [NEW] Tracking de vistas
  locale TEXT DEFAULT 'en',              -- [NEW] Idioma del CV
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Nueva tabla `users`:**
```sql
users(
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Nueva tabla `cv_views`:**
```sql
cv_views(
  id SERIAL PRIMARY KEY,
  cv_id UUID REFERENCES user_cvs(id),
  viewer_ip_hash TEXT,                    -- IP anonimizada
  user_agent TEXT,
  viewed_at TIMESTAMP
)
```

#### 1.3 Validación AJV en el Server

Se añade un middleware que valida todo JSON de CV entrante:

```typescript
// server/src/middleware/validation.ts
import Ajv from 'ajv';
import resumeSchema from '@resumate/schema/resume.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(resumeSchema);

export const validateResumeData = (req, res, next) => {
  if (!validate(req.body.data)) {
    return res.status(400).json({
      error: 'Invalid resume data',
      details: validate.errors
    });
  }
  next();
};
```

---

### Fase 2 — Server Architecture Refactor

#### 2.1 Modularizar [index.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/server/src/index.ts)

Dividir las 345 líneas en:

| Archivo | Responsabilidad |
|---|---|
| `server.ts` | Bootstrap, listen, health checks |
| `app.ts` | Express app factory, middleware chain |
| `middleware/security.ts` | Helmet, CORS, rate-limit, headers |
| `middleware/geolocation.ts` | IP + geo data (sin logs excesivos) |
| `middleware/error-handler.ts` | Error handler global |
| `middleware/validation.ts` | AJV validation |

#### 2.2 Patrón Controller → Service → Repository

Cada módulo sigue:
```
routes.ts → controller.ts → service.ts → repository.ts
```

- **Controller**: Parsea request, llama al service, envía response
- **Service**: Lógica de negocio, validación
- **Repository**: Queries a la DB vía Drizzle

#### 2.3 Autenticación

Implementar con Passport.js (ya instalado pero sin usar):
- Registro/Login con email + password (bcrypt)
- Sesiones con PostgreSQL store
- Middleware `isAuthenticated` para rutas protegidas

---

### Fase 3 — Frontend Architecture Refactor

#### 3.1 Reestructurar carpetas (Feature-Sliced)

**Mover archivos existentes:**

| Origen | Destino |
|---|---|
| `cv-editor/` | `features/resume/components/editor/` |
| `cv-editor/sections/` | `features/resume/components/sections/` |
| `cv-editor/store/` | `features/resume/stores/` |
| `cv-list/` | `features/dashboard/` |
| `cv-optimization/` | `features/ai/` |
| `templates/` | `features/templates/` |
| `shared/services/` | `features/resume/services/` |
| `shared/types/` | Eliminar (generado desde `@resumate/schema`) |
| `schema/resume/` | Eliminar (mover lógica a `@resumate/schema`) |
| `consonants/` → `constants/` | `shared/constants/` |

#### 3.2 Separar Zustand Stores

El store monolítico [useCVStore.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/cv-editor/store/useCVStore.ts) se divide en:

| Store | Responsabilidad |
|---|---|
| `useResumeStore` | Datos del CV (sections + basics) |
| `useEditorStore` | Estado del editor (panel activo, zoom, etc.) |
| `useHistoryStore` | Undo/redo (middleware de Zustand) |
| `useTemplateStore` | Template seleccionado + configuración |

#### 3.3 Alinear Types con JSON Schema

Usar `json-schema-to-typescript` para generar types automáticamente:

```bash
npx json-schema-to-typescript schema.json > types.ts
```

Esto elimina el problema actual donde [resume.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts) define [ProfileData](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#78-87) con `fullName`, pero el schema usa `name` + `headline`.

#### 3.4 i18n

Implementar con `react-i18next`:
- Archivos de traducción en `shared/i18n/locales/`
- Soporte inicial: [es](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/app/src/shared/types/resume.ts#67-77), [en](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/server/src/index.ts#105-108)
- Wrapper `<I18nProvider>` en el app shell

---

### Fase 4 — Template & Rendering Engine

#### 4.1 Sistema de Templates

Crear un registry similar a Reactive Resume:

```typescript
// features/templates/registry.ts
export interface TemplateDefinition {
  id: string;
  name: string;
  preview: string;        // URL de la imagen de preview
  component: React.FC<ResumeProps>;
  supports: {
    sidebar: boolean;
    multiColumn: boolean;
    customCSS: boolean;
  };
}

export const templateRegistry = new Map<string, TemplateDefinition>();
```

#### 4.2 Templates a implementar (12+)

Templates inspirados en los de Reactive Resume + propios:
1. **Classic** — Diseño limpio estándar
2. **Harvard** — (ya existe, refactorizar)
3. **MIT** — Técnico/minimalista
4. **Stanford** — Con sidebar
5. **Modern** — Dos columnas con color accent
6. **Compact** — Alta densidad de información
7. **Creative** — Para diseñadores
8. **Executive** — Para cargos senior
9. **ATS-Optimized** — Sin gráficos, máxima compatibilidad
10. **Timeline** — Con timeline visual
11. **Minimal** — Ultra limpio
12. **Professional** — Con foto y sidebar

#### 4.3 Google Fonts

Integración dinámica:
```typescript
// Cargar fuentes bajo demanda cuando el usuario las selecciona
const loadFont = (family: string, weights: string[]) => {
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@${weights.join(';')}&display=swap`;
  document.head.appendChild(link);
};
```

---

### Fase 5 — AI Integration

#### 5.1 Asistente de Escritura

Integrar en el RichTextEditor (TipTap) un botón de IA:
- Mejorar redacción de bullet points
- Sugerir logros cuantificables
- Corregir gramática

#### 5.2 ATS Optimization

- Analizar CV contra keywords de job description
- Score de compatibilidad ATS
- Sugerir keywords faltantes

#### 5.3 CV Tailoring

- Adaptar automáticamente un CV base a una oferta de trabajo
- Reordenar secciones por relevancia
- Ajustar el summary/headline

---

### Fase 6 — Export & Sharing

| Feature | Implementación |
|---|---|
| PDF Export | Mejorar `@react-pdf/renderer` existente |
| JSON Resume | Mapper desde nuestro schema → JSON Resume standard |
| Shareable Links | Ruta `/cv/share/:slug` + password check |
| View Tracking | Tabla `cv_views`, counter en `user_cvs` |
| Import JSON | Drag-and-drop JSON → validatear con AJV → cargar |

---

## User Review Required

> [!WARNING]
> **Decisiones que necesitan tu aprobación antes de proceder:**

1. **Monorepo vs. Multi-repo**: El plan propone un paquete compartido `@resumate/schema`. ¿Prefieres un monorepo con workspaces (npm/pnpm workspaces) o simplemente una carpeta `packages/schema/` con path aliases?

2. **Autenticación**: ¿Quieres autenticación completa (email + password + OAuth) en esta fase, o solo la estructura base para agregarla después?

3. **Orden de ejecución**: ¿Empezamos por la Fase 1 (Schema/DB) y avanzamos secuencialmente, o prefieres priorizar la reestructuración del frontend (Fase 3)?

4. **Templates**: ¿Los 12 templates se implementan como componentes React (renderizado en navegador) o como templates HTML string que se renderizan en un iframe/headless browser para PDF?

5. **Scope del primer PR**: ¿Quieres un refactor incremental (fase por fase, cada una mergeable) o un refactor big-bang (todo junto)?

---

## Verificación

### Validación Automatizada
- **AJV Schema tests**: Crear test suite que valide CVs de ejemplo contra el schema
  - Comando: `npx vitest run packages/schema/tests/`
- **Server API tests**: Tests de integración para CRUD de CVs con validación
  - Comando: `npx vitest run server/src/tests/`
- **Frontend build**: Verificar que el build de Vite no tiene errores
  - Comando: `cd app && npm run build`
- **Type checking**: Verificar que los types generados son correctos
  - Comando: `cd app && npx tsc --noEmit`

### Verificación Manual
- **Crear un CV nuevo** → verificar que se guarda con el schema correcto en la DB
- **Editar un CV existente** → verificar que se migra automáticamente al nuevo schema
- **Exportar a PDF** → verificar que el template renderiza correctamente
- **Cambiar idioma** → verificar que la interfaz cambia
- **Abrir enlace compartible** → verificar que pide contraseña y muestra el CV

> [!NOTE]
> Dado que no hay tests automatizados existentes en el proyecto (solo [test-cv-scraper.js](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/server/src/tests/test-cv-scraper.js) y [test-rag.ts](file:///c:/Users/Usuario/Desktop/DevProjects/Ideas/ResuMate/server/src/tests/test-rag.ts) que son tests manuales), la verificación inicial dependerá de tests manuales y se irán agregando tests automatizados por fase.
