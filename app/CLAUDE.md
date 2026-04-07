# ResuMate Frontend (app/)

## Descripcion del Proyecto

Frontend de ResuMate - una aplicacion para crear y gestionar curriculums Vitae (CVs). La aplicacion permite a los usuarios crear, editar, formatear y exportar CVs de manera profesional.

**Stack Tecnologico:**
- React 19 con TypeScript
- Vite 7 (bundler)
- Tailwind CSS 4
- Zustand (state management)
- Tiptap 3 (editor WYSIWYG)
- i18next (internacionalizacion)
- Radix UI (componentes base)
- Framer Motion (animaciones)
- @dnd-kit (drag and drop)
- @react-pdf/renderer (exportacion PDF)
- @tanstack/react-query (data fetching)

## Archivos Importantes

```
app/
├── src/
│   ├── App.tsx              # Componente principal de la app
│   ├── main.tsx             # Entry point
│   ├── components/          # Componentes reutilizables
│   │   ├── editor/          # Editor Tiptap para CV
│   │   ├── layout/          # Layouts (Header, Sidebar, etc)
│   │   └── ui/              # Componentes UI base (Button, Input, etc)
│   ├── features/            # Features de dominio
│   │   ├── resume/          # Modulo de CVs
│   │   ├── templates/       # Plantillas de CV
│   │   └── export/          # Exportacion (PDF, etc)
│   ├── pages/               # Páginas de la aplicacion
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilidades y configuraciones
│   │   ├── api.ts           # Cliente API (axios)
│   │   └── i18n.ts          # Configuracion i18next
│   ├── store/               # Zustand stores
│   ├── templates/           # Plantillas de CV
│   ├── utils/               # Funciones utilitarias
│   └── styles/              # Estilos globales
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Reglas para el Agente Frontend

### Herramientas Disponibles
- **Leer/Escribir archivos**: Puede modificar cualquier archivo en `app/`
- **Glob/Buscar**: Para encontrar archivos y patrones
- **Bash**: Para ejecutar scripts npm (dev, build, lint, typecheck)

### Scripts Disponibles
```bash
pnpm dev          # Iniciar servidor de desarrollo
pnpm build        # Build de produccion
pnpm lint         # Ejecutar ESLint
pnpm preview      # Preview del build
```

### Convenciones de Codigo
- Usar **Tailwind CSS** para estilos (no CSS plano)
- Usar **Radix UI** como base para componentes complejos
- Usar **clsx** o **tailwind-merge** para conditional classes
- Componentes: PascalCase (ej. `ResumeEditor.tsx`)
- Hooks: camelCase con prefijo `use` (ej. `useResumeStore.ts`)
- Stores Zustand: archivos en `src/store/`

### Patrones de Diseño
- **Feature-based architecture**: agrupar por feature, no por tipo
- **Custom hooks**: extraer logica reutilizable
- **Componentes presentacionales vs contenedores**
- **TypeScript strict mode**: no usar `any` sin necesidad

---

## Lo que este Agente NO debe hacer

### Restricciones de Scope

1. **NO modificar la base de datos**
   - No tocar `server/src/db/schema.ts`
   - No tocar migraciones en `server/drizzle/`
   - No modificar queries SQL

2. **NO modificar el backend/server**
   - No editar `server/src/` ni sus submódulos
   - No modificar API routes en `server/src/modules/`
   - No tocar middlewares del server

3. **NO modificar el scraper Python**
   - No editar `scraper/` ni sus archivos

4. **NO modificar el schema compartido**
   - No editar `packages/schema/src/`
   - Los schemas JSON son definidos por el equipo de backend

5. **NO realizar cambios en la logica de negocio del servidor**
   - No añadir/modificar endpoints de API
   - No modificar la logica de autenticacion del server

### Cuando Necesitas Ayuda del Backend
Si necesitas un nuevo endpoint de API, contacta al **Agente de Backend** especificando:
- El endpoint que necesitas (GET, POST, etc)
- Los parametros requeridos
- La respuesta esperada
- El caso de uso en el frontend

---

## Contacto con Otros Agentes

| Agente | Scope | Contacto |
|--------|-------|----------|
| **Agente Backend** | `server/` - API, DB, logica de negocio | Modifica `server/src/modules/*` |
| **Agente Schema** | `packages/schema/` - JSON schemas, validacion | Modifica `packages/schema/src/` |
| **Agente Scraper** | `scraper/` - Extraccion CV de URLs | Modifica `scraper/` |
| **Agente DevOps** | Docker, CI/CD, infraestructura | Archivos `Dockerfile`, `docker-compose.yml` |

---

## Notas Importantes

- La comunicacion con el backend se hace via **axios** (configurado en `src/lib/api.ts`)
- Los schemas de validacion (`@resumate/schema`) se consumen como paquete npm workspace
- El editor de CV usa **Tiptap 3** - no usar otros editores sin consultar
- Las traducciones estan en `src/lib/i18n/` - no hardcodear textos visibles
