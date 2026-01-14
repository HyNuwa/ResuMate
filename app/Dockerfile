# ==========================================
# Frontend Dockerfile (React + Vite)
# ==========================================

FROM node:20-slim

# Metadata
LABEL maintainer="ResuMate"
LABEL description="ResuMate Frontend App"

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto 5173 (Vite default)
EXPOSE 5173

# Variables de entorno
ENV VITE_API_URL=http://localhost:3000

# Nota importante sobre --host:
# Vite por defecto solo escucha en localhost (127.0.0.1)
# --host 0.0.0.0 permite conexiones desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Para producción, usar este CMD en su lugar:
# RUN npm run build
# CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
