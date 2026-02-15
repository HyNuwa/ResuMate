# CV Scraper API Documentation

## Overview

The ResuMate CV Scraper API provides endpoints for extracting professional profile information from various online sources (GitHub, LinkedIn, portfolios, etc.). The integration uses a Python microservice (FastAPI) communicating with the Node.js backend.

---

## Architecture

```
Client → Node.js Backend (:3000) → Python Scraper (:8000) → Web Profiles
```

The Node.js backend acts as a proxy to the Python scraper service, providing:
- Type-safe TypeScript interfaces
- Request validation
- Centralized error handling
- Integration with the main ResuMate API

---

## Endpoints

### Health Check

**GET** `/api/scraper/health`

Check if the scraper service is available and LLM is configured.

**Response:**
```json
{
  "status": "healthy",
  "service": "cv-scraper",
  "llm_configured": true
}
```

---

### Extract CV Profile

**POST** `/api/scraper/extract-cv`

Extract professional information from a profile URL.

#### Request Body

```typescript
{
  url: string;           // Required: GitHub/LinkedIn/portfolio URL
  use_llm?: boolean;     // Optional: Use LLM extraction (default: true)
  bypass_cache?: boolean; // Optional: Force fresh crawl (default: false)
}
```

#### Response

```typescript
{
  success: boolean;
  url: string;
  markdown: string;                    // Always present (for RAG)
  structured_data?: CVData;            // Present if LLM succeeds
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

#### CVData Structure

```typescript
interface CVData {
  full_name?: string;
  summary?: string;
  contact_info?: string;
  job_titles: string[];
  companies: string[];
  experience_details: string[];
  technical_skills: string[];
  languages: string[];
  frameworks: string[];
  tools: string[];
  degrees: string[];
  institutions: string[];
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Using fetch
const response = await fetch('http://localhost:3000/api/scraper/extract-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://github.com/username',
    use_llm: true,
    bypass_cache: false
  })
});

const data = await response.json();

if (data.success) {
  console.log('Markdown:', data.markdown);
  console.log('Profile name:', data.structured_data?.full_name);
  console.log('Skills:', data.structured_data?.technical_skills);
}
```

### Using Axios

```typescript
import axios from 'axios';

const { data } = await axios.post('http://localhost:3000/api/scraper/extract-cv', {
  url: 'https://github.com/username',
  use_llm: true
});

console.log(`Extracted ${data.metadata.markdown_length} chars`);
```

### cURL

```bash
curl -X POST http://localhost:3000/api/scraper/extract-cv \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/unclecode",
    "use_llm": true,
    "bypass_cache": false
  }'
```

### Python Client

```python
import requests

response = requests.post(
    "http://localhost:3000/api/scraper/extract-cv",
    json={
        "url": "https://github.com/username",
        "use_llm": True,
        "bypass_cache": False
    }
)

data = response.json()

if data["success"]:
    print(f"Name: {data['structured_data']['full_name']}")
    print(f"Skills: {data['structured_data']['technical_skills']}")
```

---

## Response Patterns

### ✅ Success (LLM Extraction Worked)

```json
{
  "success": true,
  "url": "https://github.com/username",
  "markdown": "# Professional Profile\n\n...",
  "structured_data": {
    "full_name": "John Doe",
    "job_titles": ["Senior Developer", "Tech Lead"],
    "companies": ["Tech Corp", "StartupXYZ"],
    "technical_skills": ["Python", "TypeScript", "React"]
  },
  "metadata": {
    "markdown_length": 19465,
    "has_structured_data": true,
    "llm_attempted": true,
    "warnings_count": 0
  },
  "warnings": []
}
```

### ⚠️ Partial Success (Crawl OK, LLM Failed)

```json
{
  "success": true,
  "markdown": "# Profile Content...",
  "structured_data": null,
  "metadata": {
    "has_structured_data": false,
    "llm_attempted": true
  },
  "warnings": ["LLM extraction failed: API timeout"]
}
```

> **Note:** Markdown is still usable for RAG ingestion even if LLM fails.

### ❌ Complete Failure (Crawl Failed)

```json
{
  "success": false,
  "url": "https://invalid-url.com",
  "markdown": "",
  "error": "Page timeout (30s exceeded)",
  "metadata": {
    "markdown_length": 0,
    "has_structured_data": false
  }
}
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| `200` | Success (even if LLM fails, check `success` field) |
| `400` | Bad request (invalid URL format) |
| `500` | Server error |
| `503` | Python scraper service unavailable |

---

## Configuration

### Environment Variables

Both services require configuration:

#### Node.js Backend (`.env`)

```env
# Scraper service URL
SCRAPER_URL=http://localhost:8000
```

#### Python Scraper (`.env`)

```env
# OpenRouter API key for LLM extraction
OPENROUTER_API_KEY=your_api_key_here

# Server configuration
PORT=8000
HOST=0.0.0.0
```

---

## Best Practices

1. **Use LLM extraction for unstructured profiles** (personal websites, GitHub)
2. **Cache results** by default to save API costs
3. **Handle both markdown and structured data** - markdown works for RAG even when LLM fails
4. **Set reasonable timeouts** - extraction can take 10-20 seconds
5. **Validate URLs** before sending to avoid wasted API calls

---

## Performance

- **With LLM**: 10-20 seconds per page
- **Without LLM**: 2-5 seconds per page  
- **Cached**: Near-instant

---

## Troubleshooting

### Python Service Not Responding

```bash
# Verify Python service is running
curl http://localhost:8000/health

# Expected: {"status": "healthy", "llm_configured": true}
```

### LLM Extraction Always Fails

- Verify `OPENROUTER_API_KEY` is set in `scraper/.env`
- Check API key has credits at https://openrouter.ai
- Review Python service logs for detailed errors

### Invalid URL Errors

The API validates URL format. Ensure URLs include protocol:
- ✅ `https://github.com/username`
- ❌ `github.com/username`

---

## Integration Checklist

Before using in production:

- [ ] Python scraper service running on port 8000
- [ ] Node.js backend running on port 3000
- [ ] `OPENROUTER_API_KEY` configured
- [ ] Test with `node src/tests/test-cv-scraper.js`
- [ ] Configure error logging
- [ ] Set up monitoring for service availability

---

## Next Steps

- Store extracted data in PostgreSQL
- Add rate limiting per user
- Implement Redis caching layer
- Support authenticated LinkedIn scraping
