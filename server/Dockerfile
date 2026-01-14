# ==========================================
# Backend Dockerfile (Node.js + TypeScript + Drizzle)
# ==========================================
# Multi-stage build para imagen de producción optimizada

# ====================================
# Etapa 1: Builder - Compila TypeScript
# ====================================
FROM node:20-slim AS builder

# Metadata
LABEL maintainer="ResuMate"
LABEL description="Backend builder stage"

# Instalar OpenSSL (requerido por Drizzle ORM)
RUN apt-get update && \
    apt-get install -y openssl &&  \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias primero
# Docker cachea esta capa si package.json no cambió
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
# El output normalmente va a /dist
RUN npm run build

# ====================================
# Etapa 2: Production - Imagen final ligera
# ====================================
FROM node:20-slim

# Metadata
LABEL maintainer="ResuMate"
LABEL description="ResuMate Backend API"

# Instalar OpenSSL
RUN apt-get update && \
    apt-get install -y openssl curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar SOLO dependencias de producción
# Esto reduce significativamente el tamaño de la imagen
RUN npm ci --only=production

# Copiar código compilado desde la etapa builder
COPY --from=builder /app/dist ./dist

# Copiar archivos de Drizzle (migraciones, config)
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Crear directorio para uploads
RUN mkdir -p /app/uploads

# Exponer puerto 3000
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check: Docker verifica que el servidor responde
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicio:
# Nota: Las migraciones deben ejecutarse manualmente después de que el contenedor esté corriendo
# Ejecutar: docker compose exec server npx drizzle-kit generate && docker compose exec server npx drizzle-kit migrate
CMD ["node", "dist/src/index.js"]
