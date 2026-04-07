# ResuMate CV Scraper (scraper/)

## Descripcion del Proyecto

Microservicio Python para extraer informacion de curriculums Vitae (CVs) desde URLs publicas. Usa una arquitectura de dos fases: **Crawl-then-Extract** para mayor confiabilidad.

**Arquitectura:**
1. **Fase 1 (Crawl)**: Usa Crawl4AI para obtener contenido limpio en markdown
2. **Fase 2 (Extract)**: Usa OpenRouter API (Gemini) para extraer datos estructurados

**Stack Tecnologico:**
- Python 3.13+
- FastAPI (web framework)
- Crawl4AI (web crawling)
- Pydantic (validation)
- httpx (HTTP client)
- Uvicorn (ASGI server)

## Archivos Importantes

```
scraper/
├── main.py              # FastAPI app + endpoints + logica de extraccion
├── run.py               # Entry point con fix para Windows/Python 3.13
├── requirements.txt      # Dependencias Python
├── Dockerfile            # Imagen Docker del scraper
├── .env.example          # Variables de entorno ejemplo
├── tests/                # Tests del scraper
│   ├── test_scraper.py
│   ├── test_openrouter.py
│   ├── quick_test.py
│   └── list_models.py
└── README.md
```

## Reglas para el Agente Scraper

### Herramientas Disponibles
- **Leer/Escribir archivos**: Puede modificar cualquier archivo en `scraper/`
- **Glob/Buscar**: Para encontrar archivos y patrones
- **Bash**: Para ejecutar scripts Python, pip, tests

### Comandos Principales
```bash
# Desarrollo
python run.py                          # Iniciar servidor
python -m uvicorn main:app --reload  # Alternativa con uvicorn directo

# Production (Docker)
docker build -t resumate-scraper .
docker run -p 8000:8000 resumate-scraper

# Tests
pytest tests/
python tests/quick_test.py
```

### Convenciones de Codigo
- Usar **Pydantic** para todos los modelos de datos (request/response)
- Usar **async/await** para todas las operaciones de I/O
- Usar **logging** en vez de print para output
- Mantener la estructura de dos fases (Crawl → Extract)
- Siempre retornar markdown aunque LLM falle (resilience)

### Patrones de Diseño
- **Async-first**: Todo es asincrono
- **Fail-safe**: El crawler SIEMPRE retorna algo aunque el LLM falle
- **Two-phase extraction**: Separar claramente crawl de extract

---

## Lo que este Agente NO debe hacer

### Restricciones de Scope

1. **NO modificar el frontend**
   - No editar `app/src/` ni componentes
   - No crear paginas o componentes React

2. **NO modificar el backend Node.js**
   - No editar `server/src/` ni endpoints
   - No modificar la integracion con el scraper en `server/`

3. **NO modificar el schema compartido**
   - No editar `packages/schema/src/`

4. **NO modificar el monorepo root**
   - No editar `package.json` del root
   - No modificar configuraciones del workspace

5. **NO cambiar la arquitectura fundamental**
   - No cambiar de Crawl4AI a otro crawler sin discutirlo
   - No cambiar el patron de extraccion en dos fases

### Cuando Necesitas Ayuda de Otros Agentes
- **Backend**: Para modificar como el server integra con el scraper
- **Schema**: Para cambiar los campos que se extraen (debes alinear con `CVData`)

---

## API Endpoints

### GET /
Estado del servicio y version

### GET /health
Health check con estado de LLM

### POST /extract-cv
**Request:**
```json
{
  "url": "https://example.com/cv",
  "use_llm": true,
  "bypass_cache": false
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/cv",
  "markdown": "# Contenido en markdown...",
  "structured_data": {
    "full_name": "John Doe",
    "job_titles": ["Software Engineer"],
    ...
  },
  "metadata": {...},
  "warnings": []
}
```

---

## Contacto con Otros Agentes

| Agente | Scope | Cuando Contactar |
|--------|-------|------------------|
| **Agente Backend** | `server/` | Para integracion con `/api/scraper` endpoints |
| **Agente Frontend** | `app/` | Para cambios en como se muestra el resultado del scraping |
| **Agente Schema** | `packages/schema/` | Si necesitas cambiar campos extraidos |
| **Agente DevOps** | Docker, CI/CD | Para cambios en el Dockerfile |

---

## Notas Importantes

- El scraper corre como **servicio separado** en Docker
- Se comunica con el backend via **HTTP** (no Python imports)
- El **markdown siempre se retorna**, aun si el LLM falla
- La extraccion LLM es **best-effort**, nunca blocking
- Requiere `OPENROUTER_API_KEY` en `.env` para extraccion estructurada
- Fix critico en `run.py` para Python 3.13 + Windows: usa `WindowsSelectorEventLoopPolicy`
