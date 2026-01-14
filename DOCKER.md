# 🐳 ResuMate - Docker Setup Guide

Este proyecto usa Docker para empaquetar todos los servicios en contenedores independientes.

## 📋 Pre-requisitos

1. **Instalar Docker Desktop**:
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Linux: `sudo apt install docker.io docker-compose`

2. **Verificar instalación**:
   ```bash
   docker --version
   docker-compose --version
   ```

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
# IMPORTANTE: Agregar tu OPENROUTER_API_KEY
```

### 2. Construir imágenes (Primera vez o después de cambios)

```bash
# Construir todos los servicios
docker-compose build

# Esto puede tomar 5-10 minutos la primera vez
```

### 3. Iniciar servicios

```bash
# Levantar todo en segundo plano (-d = detached)
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f server
```

### 4. Verificar que todo funciona

```bash
# Verificar servicios corriendo
docker-compose ps

# Probar endpoints
curl http://localhost:8000/health  # Scraper
curl http://localhost:3000/health  # Backend (crear este endpoint)
curl http://localhost:5173         # Frontend
```

### 5. Ejecutar seed (Primera vez)

```bash
# Entrar al contenedor del backend
docker-compose exec server bash

# Dentro del contenedor
npx tsx -r dotenv/config seeds/knowledge-seed.ts

# Salir
exit
```

## 🔧 Comandos Útiles

### Gestión de servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ CUIDADO: borra la DB)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart server

# Rebuild un servicio después de cambios en código
docker-compose build server
docker-compose up -d server
```

### Debugging

```bash
# Ver logs de los últimos 100 líneas
docker-compose logs --tail=100 server

# Entrar a un contenedor
docker-compose exec server bash
docker-compose exec db psql -U postgres -d resumate

# Ver uso de recursos
docker stats
```

### Limpieza

```bash
# Limpiar imágenes viejas
docker image prune -a

# Limpiar todo lo no usado (contenedores, imágenes, volúmenes)
docker system prune -a --volumes
```

##  arquitectura

```
┌─────────────────────────────────────────────────┐
│          Usuario (localhost)                    │
└──────┬──────────────┬──────────────┬────────────┘
       │              │              │
       │:5173         │:3000         │:8000
       │              │              │
┌──────▼───────┐  ┌───▼──────────┐  ┌▼────────────┐
│   Frontend   │  │   Backend    │  │   Scraper   │
│  (React)     │──▶  (Node.js)   │──▶  (Python)   │
└──────────────┘  └───┬──────────┘  └─────────────┘
                      │:5432
                  ┌───▼──────────┐
                  │  PostgreSQL  │
                  │  + pgvector  │
                  └──────────────┘
```

## 🐛 Troubleshooting

### Error: "port already in use"

```bash
# Windows
netstat -ano | findstr :5432

# Mac/Linux
lsof -i :5432

# Cambiar puerto en docker-compose.yml o detener proceso conflictivo
```

### Error: "database connection refused"

```bash
# Verificar logs de la DB
docker-compose logs db

# Esperar a que el healthcheck pase
docker-compose ps

# La DB puede tardar 20-30 segundos en estar lista
```

### Cambios en código no se reflejan

```bash
# Para TypeScript/backend, rebuild la imagen
docker-compose build server
docker-compose up -d server

# Para frontend, debería funcionar con hot-reload automático
# Si no, rebuild también
docker-compose build app
docker-compose up -d app
```

### Scraper falla al iniciar

```bash
# Ver logs del scraper
docker-compose logs scraper

# Verificar que OPENROUTER_API_KEY está en .env
# El scraper tarda ~40s en iniciar (descarga Chromium)
```

## 📊 Servicios y Puertos

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| Frontend | 5173 | http://localhost:5173 | React app |
| Backend | 3000 | http://localhost:3000 | API REST |
| Scraper | 8000 | http://localhost:8000 | Microservicio Python |
| Database | 5432 | localhost:5432 | PostgreSQL |

## 🔐 Seguridad

- **NUNCA** commitear el archivo `.env` al repositorio
- Cambiar `DB_PASSWORD` en producción
- En producción, usar `secrets` de Docker Swarm o Kubernetes

## 📝 Notas

- Los volúmenes de desarrollo (`./server/src:/app/src`) permiten hot-reload
- En producción, remover estos volúmenes del `docker-compose.yml`
- El `healthcheck` de cada servicio asegura que estén listos antes de iniciar dependientes
