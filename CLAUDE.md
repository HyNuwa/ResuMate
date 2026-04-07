# ResuMate Monorepo

## Descripcion del Proyecto

**ResuMate** es una aplicacion para crear, gestionar y exportar curriculums Vitae (CVs) de manera profesional. El proyecto esta organizado como un monorepo pnpm con multiples paquetes.

## Estructura del Proyecto

```
ResuMate/
├── app/                    # Frontend React (Vite + React 19)
├── server/                 # Backend Node.js (Express + TypeScript)
├── packages/
│   └── schema/            # Paquete compartido de schemas y tipos
├── scraper/               # Microservicio Python (FastAPI + Crawl4AI)
├── docker-compose.yml     # Orquestacion de contenedores
├── package.json           # Workspace root (pnpm)
└── CLAUDE.md             # Este archivo
```

## Agentes y sus Responsabilidades

| Agente | Directorio | Responsabilidad |
|--------|------------|-----------------|
| **Agente Frontend** | `app/` | UI, componentes React, estilos, paginas |
| **Agente Backend** | `server/` | API REST, base de datos, logica de negocio |
| **Agente Schema** | `packages/schema/` | Tipos TypeScript, JSON schemas, validacion |
| **Agente Scraper** | `scraper/` | Extraccion de CVs desde URLs publicas |
| **Agente DevOps** | Root + Docker | Docker, docker-compose, infraestructura |

## Scripts del Workspace

```bash
# Desarrollo
pnpm dev:app           # Iniciar frontend (app/)
pnpm dev:server        # Iniciar backend (server/)

# Build
pnpm build            # Build completo (schema + app)
pnpm build:schema      # Solo el paquete schema

# Calidad de codigo
pnpm typecheck        # TypeScript en todos los paquetes
```

## Comunicacion entre Servicios

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Backend    │────▶│  Database   │
│  (Frontend) │◀────│  (Node.js)  │     │  (PostgreSQL)│
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Scraper    │
                   │  (Python)   │
                   └─────────────┘
```

### Puertos
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3000`
- **Scraper**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

---

## Reglas Globales

### Lo que TODOS los agentes deben seguir

1. **Usar pnpm** para todo en el workspace root
2. **No modificar directamente** archivos de otros agentes sin coordinacion
3. **Mantener sincronizados** los schemas entre `packages/schema/` y el codigo
4. **Usar TypeScript strict mode** en todos los proyectos TypeScript
5. **No hardcodear** API URLs - usar variables de entorno
6. **No crear archivos en la raiz** sin coordinacion con DevOps

### Variables de Entorno Importantes

| Variable | Descripcion | Donde se usa |
|----------|-------------|--------------|
| `DATABASE_URL` | Connection string PostgreSQL | server |
| `OPENROUTER_API_KEY` | API key para LLM | server, scraper |
| `SCRAPER_URL` | URL del scraper | server |
| `VITE_API_URL` | URL del backend | app |
| `NODE_ENV` | development/production | server |

---

## Lo que NO se debe hacer (Reglas del Monorepo)

### Restricciones Universales

1. **NO hacer cambios breaking en schemas** sin coordinar con frontend y backend
2. **NO modificar Dockerfiles** sin consultar con DevOps
3. **NO ejecutar migraciones de DB** en produccion sin approval
4. **NO hacer commit de secrets** - usar `.env.example` como guia
5. **NO saltarse el lint/typecheck** antes de hacer commit
6. **NO crear dependencias circulares** entre paquetes

### Cuadro de Restricciones por Agente

| Agente | NO puede modificar |
|--------|---------------------|
| **Frontend** | server/src/db/, scraper/, packages/schema/src/ |
| **Backend** | app/src/components/, scraper/, packages/schema/src/ |
| **Schema** | app/src/, server/src/, scraper/ |
| **Scraper** | app/src/, server/src/, packages/schema/src/ |
| **DevOps** | Nada de codigo (solo Docker e infraestructura) |

---

## Contacto Directo entre Agentes

### Agente Frontend necesita ayuda del Backend?
1. Lee `server/CLAUDE.md` para entender los endpoints
2. Verifica si el endpoint existe en `server/src/modules/*/routes.ts`
3. Si no existe, contacta al Agente Backend con:
   - Endpoint requerido (GET/POST/etc)
   - Payload y respuesta esperados
   - Caso de uso

### Agente Backend necesita ayuda del Schema?
1. Lee `packages/schema/CLAUDE.md`
2. Verifica si el tipo ya existe en `packages/schema/src/types.ts`
3. Si necesitas cambios, contacta al Agente Schema con:
   - Tipo/interface requerida
   - Campos necesarios
   - Como se usara

### Cualquier agente necesita ayuda de DevOps?
- Para Docker: revisa `docker-compose.yml` y los Dockerfiles
- Para CI/CD: revisa archivos de configuracion en `.github/` (si existen)
- Para publicar paquetes: consulta la configuracion de pnpm workspace

---

## Documentacion Adicional

- `docker-compose.yml` - Arquitectura de contenedores
- `server/docs/ENVIRONMENT_VARIABLES.md` - Variables de entorno del server
- `server/docs/API_SCRAPER.md` - Documentacion del API scraper
- `packages/schema/src/resume.schema.json` - Schema JSON del CV
