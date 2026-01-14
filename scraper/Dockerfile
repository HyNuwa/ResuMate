# ==========================================
# Scraper Microservice Dockerfile
# ==========================================
# Este contenedor ejecuta el scraper de Python con Crawl4AI y Playwright

FROM python:3.10-slim

# Metadata
LABEL maintainer="ResuMate"
LABEL description="Scraper microservice con Crawl4AI y Playwright"

# Instalar dependencias del sistema para Playwright (navegador Chromium headless)
# Estas son las librerías que Chromium necesita para funcionar sin interfaz gráfica
RUN apt-get update && apt-get install -y \
    # Core Chromium dependencies
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    # Rendering libraries
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libxshmfence1 \
    # Utilities
    wget \
    ca-certificates \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivo de dependencias primero (para aprovechar cache de Docker)
# Si requirements.txt no cambia, Docker reutiliza esta capa
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Instalar navegador Chromium para Playwright
# Esto descarga el navegador dentro del contenedor
RUN playwright install chromium && \
    playwright install-deps chromium

# Copiar código de la aplicación
COPY . .

# Exponer puerto 8000 (FastAPI default)
EXPOSE 8000

# Variables de entorno por defecto
ENV HOST=0.0.0.0
ENV PORT=8000
ENV ENV=production

# Health check: Docker verifica cada 30s que el servicio responde
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Comando de inicio
# En desarrollo: usar --reload para hot-reload
# En producción: remover --reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
