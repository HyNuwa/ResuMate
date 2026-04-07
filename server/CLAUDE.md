# ResuMate Backend (server/)

## Descripcion del Proyecto

Backend de ResuMate - API REST para gestion de curriculums Vitae (CVs). Provee endpoints para CRUD de resumes, integracion con IA (RAG pipeline), scraping de CVs desde URLs, exportacion a PDF, y sincronizacion con servicios externos.

**Stack Tecnologico:**
- Node.js con Express 5 y TypeScript
- Drizzle ORM (PostgreSQL + pgvector para embeddings)
- Neon Database (PostgreSQL serverless)
- LangChain + OpenAI/HuggingFace (AI/RAG pipeline)
- Passport (autenticacion)
- Helmet + rate limiting (seguridad)
- Puppeteer (generacion PDF)
- node-cron (tareas programadas)

## Archivos Importantes

```
server/
├── src/
│   ├── app.ts                 # Factory de Express (createApp)
│   ├── server.ts              # Entry point, listen()
│   ├── config/
│   │   └── database.ts        # Configuracion de conexion DB
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema (TABLAS)
│   │   └── index.ts          # exports de db
│   ├── middleware/
│   │   ├── security.ts        # Helmet, CORS, rate limiting
│   │   ├── geolocation.ts     # GeoIP middleware
│   │   ├── error-handler.ts   # Manejo global de errores
│   │   └── validation.ts      # AJV validation schemas
│   └── modules/
│       ├── resume/            # CRUD de resumes (routes, service, repository, controller)
│       ├── ai/                # RAG pipeline, embeddings
│       ├── scraper/           # Integracion con scraper Python
│       ├── knowledge/        # Base de conocimiento para IA
│       ├── printer/          # Generacion PDF via Puppeteer
│       ├── cv-sync/           # Sincronizacion (legacy, en transicion)
│       ├── cron/              # Tareas programadas
│       ├── model/             # Rutas legacy AI
│       └── utils/
│           └── geo_utils.ts   # Utilidades de geolocalizacion
├── drizzle/                   # Migraciones Drizzle
│   ├── meta/
│   └── *.sql
├── migrations/               # Migraciones SQL raw
├── seeds/                    # Seeds de base de datos
├── docs/                     # Documentacion API
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

## Reglas para el Agente Backend

### Herramientas Disponibles
- **Leer/Escribir archivos**: Puede modificar cualquier archivo en `server/`
- **Glob/Buscar**: Para encontrar archivos y patrones
- **Bash**: Para ejecutar scripts npm (dev, build, db:generate, db:push, db:seed)

### Scripts Disponibles
```bash
pnpm dev              # Iniciar servidor con nodemon + ts-node
pnpm build            # Compilar TypeScript
pnpm start            # Iniciar produccion (dist/)
pnpm db:generate      # Generar migraciones Drizzle
pnpm db:push          # Push schema a DB
pnpm db:seed          # Seed base de datos
```

### Convenciones de Codigo
- **Arquitectura modular**: cada modulo en `src/modules/<nombre>/`
- **Patron Repository**: para acceso a datos
- **Patron Service**: para logica de negocio
- **Patron Controller**: para handling de requests
- **Middlewares funcionales**: separar concerns
- **TypeScript strict mode**: no usar `any` sin necesidad

### Estructura de Modulo
```
modules/<name>/
├── <name>.routes.ts    # Express Router
├── <name>.controller.ts # Request handlers
├── <name>.service.ts   # Logica de negocio
├── <name>.repository.ts # Acceso a datos (opcional)
└── index.ts            # Export publico
```

---

## Lo que este Agente NO debe hacer

### Restricciones de Scope

1. **NO modificar el frontend**
   - No editar `app/src/` ni sus componentes
   - No modificar archivos CSS o estilos en `app/`

2. **NO modificar el scraper Python**
   - No editar `scraper/` ni sus archivos
   - La logica de scraping es responsabilidad del **Agente Scraper**

3. **NO modificar el schema compartido**
   - No editar `packages/schema/src/`
   - Los schemas JSON son definidos por el equipo de schema

4. **NO realizar cambios en la logica de presentacion**
   - No generar HTML/CSS para el cliente
   - La presentacion es responsabilidad del **Agente Frontend**

5. **NO modificar archivos de infraestructura**
   - No tocar `Dockerfile` principal (del monorepo)
   - No modificar `docker-compose.yml` del root

### Cuando Necesitas Ayuda de Otros Agentes
- **Frontend**: Si necesitas un nuevo endpoint, coordination con el Agente Frontend
- **Scraper**: Para integracion con CV scraper, contacta al Agente Scraper
- **Schema**: Para cambios en schemas de validacion, contacta al Agente Schema

---

## Contacto con Otros Agentes

| Agente | Scope | Contacto |
|--------|-------|----------|
| **Agente Frontend** | `app/` - UI, componentes, paginas | Modifica `app/src/` |
| **Agente Schema** | `packages/schema/` - JSON schemas, validacion | Modifica `packages/schema/src/` |
| **Agente Scraper** | `scraper/` - Extraccion CV de URLs | Modifica `scraper/` |
| **Agente DevOps** | Docker, CI/CD, infraestructura | Archivos `Dockerfile`, `docker-compose.yml` |

---

## Notas Importantes

- La base de datos usa **Neon PostgreSQL** con **pgvector** para embeddings
- El RAG pipeline usa **LangChain** con **OpenRouter API**
- Las migraciones se manejan con **Drizzle Kit**
- La geolocalizacion usa **geoip-lite** y **ipinfo.io** como fallback
- Hay rutas legacy en `modules/model/` y `modules/cv-sync/` en proceso de refactor
- El scraper Python corre como servicio separado y se comunica via HTTP
