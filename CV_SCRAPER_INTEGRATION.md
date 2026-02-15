# CV Scraper Integration - Quick Start

## Architecture Overview

The CV scraper integration consists of two services:

1. **Python Scraper Service** (FastAPI) - Port 8000
   - Handles web crawling with Crawl4AI
   - LLM-powered data extraction with OpenRouter
   - Returns markdown + structured data

2. **Node.js Backend** (Express/TypeScript) - Port 3000
   - Main ResuMate API server
   - Proxies requests to Python scraper
   - New endpoint: `POST /api/scraper/extract-cv`

## Prerequisites

- Python scraper service running on `http://localhost:8000`
- Node.js backend running on `http://localhost:3000`
- `OPENROUTER_API_KEY` configured in both `.env` files

## Quick Start

### 1. Start Python Scraper Service

```bash
cd scraper
python main.py
```

Expected output:
```
🚀 ResuMate CV Scraper v4.0 - Crawl-then-Extract Architecture
   LLM Available: ✅
🌐 Starting on 0.0.0.0:8000
```

### 2. Start Node.js Backend

```bash
cd server
npm run dev
```

Expected output:
```
🚀 Servidor ejecutándose en puerto 3000
💾 PostgreSQL + pgvector: ✅
```

### 3. Test the Integration

#### Option A: Run automated tests
```bash
cd server
node src/tests/test-cv-scraper.js
```

#### Option B: Manual curl test
```bash
# Health check
curl http://localhost:3000/api/scraper/health

# Extract CV profile
curl -X POST http://localhost:3000/api/scraper/extract-cv \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/unclecode",
    "use_llm": true,
    "bypass_cache": false
  }'
```

## API Reference

### `POST /api/scraper/extract-cv`

Extract professional information from a profile URL.

**Request:**
```typescript
{
  url: string;           // GitHub/LinkedIn profile URL
  use_llm?: boolean;     // Use LLM extraction (default: true)
  bypass_cache?: boolean; // Force fresh crawl (default: false)
}
```

**Response:**
```typescript
{
  success: boolean;
  url: string;
  markdown: string;                    // Always present (for RAG)
  structured_data?: {                  // Present if LLM succeeds
    full_name?: string;
    summary?: string;
    job_titles: string[];
    companies: string[];
    technical_skills: string[];
    languages: string[];
    frameworks: string[];
    tools: string[];
    degrees: string[];
    institutions: string[];
  };
  metadata: {
    markdown_length: number;
    has_structured_data: boolean;
    llm_attempted: boolean;
    warnings_count: number;
  };
  error?: string;
  warnings: string[];
}
```

## Response Patterns

### ✅ Success (LLM extraction worked)
```json
{
  "success": true,
  "markdown": "...",
  "structured_data": { ... },
  "metadata": {
    "has_structured_data": true
  }
}
```

### ⚠️ Partial Success (Crawl OK, LLM failed)
```json
{
  "success": true,
  "markdown": "...",
  "structured_data": null,
  "metadata": {
    "has_structured_data": false
  },
  "warnings": ["LLM extraction failed: ..."]
}
```

### ❌ Complete Failure (Crawl failed)
```json
{
  "success": false,
  "error": "Page timeout (30s exceeded)"
}
```

## Troubleshooting

### Python service not responding
- Check if `python main.py` is running
- Verify it's listening on port 8000
- Check firewall settings

### LLM extraction always fails
- Verify `OPENROUTER_API_KEY` is set in `scraper/.env`
- Check API key has credits
- Review Python service logs for error details

### "fetch failed" in tests
- Ensure Node.js backend is running on port 3000
- Check `SCRAPER_URL` env var (defaults to `http://localhost:8000`)

## Next Steps

- [ ] Add support for LinkedIn profiles
- [ ] Implement caching layer (Redis)
- [ ] Add rate limiting per user
- [ ] Create RAG market analysis feature
