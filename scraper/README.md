# ResuMate CV Scraper - Usage Guide

## Overview
The CV Scraper is a FastAPI microservice that extracts professional information from CV, portfolio, and profile URLs using Crawl4AI with both LLM-based and CSS-based extraction strategies.

## Features
- ✅ **High-performance async crawling** with AsyncWebCrawler
- ✅ **Smart caching** (CacheMode.ENABLED) to minimize redundant requests
- ✅ **LLM-based extraction** using Gemini Flash for intelligent parsing
- ✅ **CSS-based fallback** for structured pages
- ✅ **Dual output**: Clean Markdown (RAG) + Structured JSON (Database)
- ✅ **Comprehensive error handling** for timeouts and failures
- ✅ **Content filtering** with PruningContentFilter for clean results

## Quick Start

### 1. Install Dependencies
```bash
cd scraper
pip install -r requirements.txt
crawl4ai-setup  # Install browser dependencies
```

### 2. Configure Environment
Create a `.env` file:
```env
OPENROUTER_API_KEY=your_api_key_here
PORT=8000
HOST=0.0.0.0
ENV=development
```

### 3. Run the Server
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

### `POST /extract-cv`
Extract professional information from a CV/portfolio URL.

**Request Body:**
```json
{
  "url": "https://example.com/my-portfolio",
  "use_llm": true,
  "bypass_cache": false
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/my-portfolio",
  "markdown": "# John Doe\n\n## Experience...",
  "structured_data": {
    "full_name": "John Doe",
    "work_experience": [
      {
        "job_title": "Senior Developer",
        "company": "Tech Corp",
        "duration": "2020 - Present",
        "responsibilities": [
          "Led development team",
          "Architected microservices"
        ]
      }
    ],
    "technical_skills": {
      "languages": ["Python", "JavaScript", "TypeScript"],
      "frameworks": ["React", "FastAPI", "Node.js"],
      "tools": ["Docker", "AWS", "Git"]
    },
    "education": [
      {
        "degree": "BS Computer Science",
        "institution": "University",
        "year": "2016"
      }
    ],
    "summary": "Experienced software engineer...",
    "contact_info": "john@example.com"
  },
  "metadata": {
    "extraction_method": "llm",
    "markdown_length": 1234,
    "has_structured_data": true
  },
  "error": null
}
```

## Data Models

### CVData (Complete CV Structure)
```python
class CVData(BaseModel):
    full_name: str
    work_experience: List[WorkExperience]
    technical_skills: TechnicalSkills
    education: List[Education]
    summary: Optional[str]
    contact_info: Optional[str]
```

### WorkExperience
```python
class WorkExperience(BaseModel):
    job_title: str
    company: str
    duration: str
    responsibilities: List[str]
```

### TechnicalSkills
```python
class TechnicalSkills(BaseModel):
    languages: List[str]
    frameworks: List[str]
    tools: List[str]
```

### Education
```python
class Education(BaseModel):
    degree: str
    institution: str
    year: str
```

## Usage Examples

### Python Client
```python
import requests

response = requests.post(
    "http://localhost:8000/extract-cv",
    json={
        "url": "https://github.com/username",
        "use_llm": True,
        "bypass_cache": False
    }
)

data = response.json()

if data["success"]:
    # Use markdown for RAG
    markdown = data["markdown"]
    
    # Use structured data for database
    cv_data = data["structured_data"]
    print(f"Extracted CV for: {cv_data['full_name']}")
else:
    print(f"Error: {data['error']}")
```

### cURL
```bash
curl -X POST http://localhost:8000/extract-cv \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/portfolio",
    "use_llm": true,
    "bypass_cache": false
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:8000/extract-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/cv',
    use_llm: true,
    bypass_cache: false
  })
});

const data = await response.json();

if (data.success) {
  console.log('CV Data:', data.structured_data);
  console.log('Markdown:', data.markdown);
}
```

## Error Handling

The scraper handles various error scenarios:

1. **Timeout Errors** (30s limit)
   ```json
   {
     "success": false,
     "error": "Request timed out. The page took too long to load."
   }
   ```

2. **Missing API Key** (falls back to CSS)
   - Automatically switches to CSS extraction if OPENROUTER_API_KEY is missing

3. **Extraction Failures**
   ```json
   {
     "success": false,
     "error": "Extraction failed: [detailed error message]"
   }
   ```

4. **Invalid LLM Output**
   - Returns markdown only if LLM produces invalid JSON
   - `structured_data` will be `null`

## Configuration Options

### Extraction Strategy Selection
- **`use_llm: true`** - Best for complex, unstructured portfolios
- **`use_llm: false`** - Faster, works for standardized CV layouts

### Caching
- **`bypass_cache: false`** - Use cached results (default)
- **`bypass_cache: true`** - Force fresh extraction

### Content Filtering
The scraper uses PruningContentFilter with:
- `threshold: 0.48` - Balance between content and noise
- `threshold_type: "dynamic"` - Adaptive filtering
- `min_word_threshold: 5` - Skip blocks with <5 words

## Best Practices

1. **Use LLM for complex layouts** (personal websites, portfolios)
2. **Use CSS fallback for standardized CVs** (LinkedIn, Indeed)
3. **Enable caching during development** to save API costs
4. **Store both markdown and JSON** for maximum flexibility
5. **Handle errors gracefully** in your application

## Troubleshooting

### Browser Issues
```bash
# Reinstall Playwright browsers
python -m playwright install --with-deps chromium
```

### Environment Variable Issues
```python
# Check if API key is loaded
import os
print(os.getenv("OPENROUTER_API_KEY"))
```

### Dependency Issues
```bash
# Reinstall dependencies
pip uninstall crawl4ai -y
pip install -U crawl4ai
crawl4ai-setup
```

## Advanced: Custom Extraction

You can easily modify the extraction schema in `main.py`:

```python
# Add new field to CVData model
class CVData(BaseModel):
    full_name: str
    certifications: List[str] = []  # New field
    # ... other fields
```

Then update the LLM instruction to extract it:
```python
instruction="""
Extract professional information including:
- Certifications and licenses
- ... other instructions
"""
```

## Performance

- **With LLM**: ~5-15 seconds per page (depends on token usage)
- **Without LLM**: ~2-5 seconds per page
- **Caching**: Near-instant for cached pages

## Token Usage

The scraper logs token usage when using LLM extraction:
```
Total tokens used: 1234
Estimated cost: $0.001
```

## Next Steps

1. Test with your CV URLs
2. Adjust extraction schema as needed
3. Integrate with your RAG pipeline
4. Set up database storage for structured data
