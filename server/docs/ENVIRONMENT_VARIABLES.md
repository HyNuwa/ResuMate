# Environment Variables - ResuMate

Complete reference for all environment variables used in the ResuMate application.

---

## Server (Node.js Backend)

### Core Configuration

```env
NODE_ENV=development
PORT=3000
```

- **NODE_ENV**: Environment mode (`development`, `production`)
- **PORT**: Server port (default: `3000`)

### Client URLs

```env
CLIENT_URL=http://localhost:5173
ADMIN_CLIENT_URL=http://localhost:5175
```

- **CLIENT_URL**: Frontend application URL
- **ADMIN_CLIENT_URL**: Admin panel URL (if applicable)

### Session

```env
SESSION_SECRET=your_secret_here
```

- **SESSION_SECRET**: Secret key for session encryption (generate with `openssl rand -base64 32`)

### Database (PostgreSQL)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=resumate
DB_DIALECT=postgres
```

- **DB_HOST**: PostgreSQL server host
- **DB_PORT**: PostgreSQL port (default: `5432`)
- **DB_USER**: Database user
- **DB_PASSWORD**: Database password
- **DB_NAME**: Database name
- **DB_DIALECT**: Database type (always `postgres`)

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
```

- **RATE_LIMIT_WINDOW_MS**: Time window in milliseconds (default: 15 min)
- **RATE_LIMIT_MAX_REQUESTS**: Max requests per window

### Logging

```env
LOG_LEVEL=info
LOG_FORMAT=combined
```

- **LOG_LEVEL**: Log level (`error`, `warn`, `info`, `debug`)
- **LOG_FORMAT**: Log format (`combined`, `dev`, `short`)

### LLM Configuration (OpenRouter)

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
LLM_MODEL=groq/llama-3.3-70b-versatile
```

- **OPENROUTER_API_KEY**: OpenRouter API key (get at https://openrouter.ai/keys)
- **OPENAI_API_KEY**: Optional OpenAI key (if using OpenAI directly)
- **LLM_MODEL**: Model to use via OpenRouter
  - Free options: `groq/llama-3.3-70b-versatile`, `meta-llama/llama-3.1-8b-instruct`

### App Info (OpenRouter)

```env
APP_URL=http://localhost:5173
APP_NAME=resumate
```

- **APP_URL**: Application URL (required by OpenRouter)
- **APP_NAME**: Application name (required by OpenRouter)

### CV Scraper Service

```env
SCRAPER_URL=http://localhost:8000
```

- **SCRAPER_URL**: Python scraper service URL (default: `http://localhost:8000`)
- Required for CV extraction endpoints (`/api/scraper/*`)
- The Python service must be running for these features to work

### Optional Services

```env
IPINFO_TOKEN=your_token
GEO_ANONYMIZE_IPS=false
HUGGINGFACE_API_KEY=hf_...
```

- **IPINFO_TOKEN**: IP geolocation service token
- **GEO_ANONYMIZE_IPS**: Anonymize IP addresses in logs
- **HUGGINGFACE_API_KEY**: HuggingFace API key for embeddings (currently unused)

---

## Python Scraper Service

Location: `scraper/.env`

### Required

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

- **OPENROUTER_API_KEY**: Same key as backend (for LLM extraction)

### Optional

```env
PORT=8000
HOST=0.0.0.0
ENV=development
```

- **PORT**: Scraper service port (default: `8000`)
- **HOST**: Bind address (default: `0.0.0.0`)
- **ENV**: Environment mode

---

## Setup Checklist

### Minimal Setup (Core Features)

1. ✅ `NODE_ENV=development`
2. ✅ `PORT=3000`
3. ✅ Database credentials (`DB_*`)
4. ✅ `SESSION_SECRET`

### CV Optimization Feature

5. ✅ `OPENROUTER_API_KEY` (backend)
6. ✅ `LLM_MODEL` (choose free model)
7. ✅ `APP_URL` and `APP_NAME`

### CV Scraper Feature

8. ✅ `SCRAPER_URL=http://localhost:8000` (backend)
9. ✅ `OPENROUTER_API_KEY` (scraper/.env)
10. ✅ Python service running

---

## Environment-Specific Configs

### Development

```env
NODE_ENV=development
LOG_LEVEL=debug
CLIENT_URL=http://localhost:5173
SCRAPER_URL=http://localhost:8000
```

### Production

```env
NODE_ENV=production
LOG_LEVEL=warn
CLIENT_URL=https://yourdomain.com
SCRAPER_URL=https://scraper.yourdomain.com
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Security Notes

⚠️ **Never commit `.env` files to version control**

- Use `.env.example` as template
- Rotate `SESSION_SECRET` regularly
- Keep API keys secure
- Use environment variables in CI/CD

---

## Troubleshooting

### "Scraper service not available"

- Verify `SCRAPER_URL` is correct
- Check Python service is running: `curl http://localhost:8000/health`

### "LLM API error"

- Verify `OPENROUTER_API_KEY` is valid
- Check API key has credits
- Ensure `LLM_MODEL` is supported

### "Database connection failed"

- Verify PostgreSQL is running
- Check `DB_*` credentials
- Test connection: `psql -h localhost -U postgres -d resumate`
