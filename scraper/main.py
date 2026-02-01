"""
ResuMate CV Scraper - Crawl-then-Extract Architecture
FastAPI microservice with resilient two-phase CV extraction
"""

# Fix for Python 3.13 + Windows + Playwright
import sys
import asyncio
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
import os
import logging
import json
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from crawl4ai.content_filter_strategy import PruningContentFilter
import httpx

# ==========================================
# Logging Configuration
# ==========================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# ==========================================
# Lifespan Event Handler
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 ResuMate CV Scraper v4.0 - Crawl-then-Extract Architecture")
    logger.info(f"   LLM Available: {'✅' if os.getenv('OPENROUTER_API_KEY') else '❌'}")
    yield
    # Shutdown
    logger.info("👋 Shutting down")

# ==========================================
# FastAPI App
# ==========================================
app = FastAPI(
    title="ResuMate CV Scraper",
    description="Two-phase CV extraction: Crawl → Extract",
    version="4.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Simplified Pydantic Models (Flatter Structure)
# ==========================================

class CVData(BaseModel):
    """Simplified CV data structure - flatter to avoid ForwardRef issues"""
    
    # Basic info
    full_name: Optional[str] = Field(None, description="Full name")
    summary: Optional[str] = Field(None, description="Professional summary")
    contact_info: Optional[str] = Field(None, description="Contact information")
    
    # Work experience (simplified as list of strings)
    job_titles: List[str] = Field(default=[], description="Job titles")
    companies: List[str] = Field(default=[], description="Company names")
    experience_details: List[str] = Field(default=[], description="Work experience descriptions")
    
    # Skills (flat lists)
    technical_skills: List[str] = Field(default=[], description="All technical skills")
    languages: List[str] = Field(default=[], description="Programming languages")
    frameworks: List[str] = Field(default=[], description="Frameworks")
    tools: List[str] = Field(default=[], description="Tools")
    
    # Education (simplified)
    degrees: List[str] = Field(default=[], description="Degrees/certifications")
    institutions: List[str] = Field(default=[], description="Educational institutions")
    
    model_config = ConfigDict(
        extra="allow",
        str_strip_whitespace=True
    )

# ==========================================
# Request/Response Models
# ==========================================

class CVExtractionRequest(BaseModel):
    url: str = Field(..., description="URL to extract CV from")
    use_llm: bool = Field(default=True, description="Attempt LLM extraction after crawl")
    bypass_cache: bool = Field(default=False, description="Force fresh crawl")

class CVExtractionResponse(BaseModel):
    success: bool
    url: str
    markdown: str = Field(default="", description="Clean markdown (always returned)")
    structured_data: Optional[CVData] = Field(None, description="Structured data (if LLM succeeds)")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None
    warnings: List[str] = Field(default=[], description="Non-fatal warnings")

# ==========================================
# Helper Functions
# ==========================================

async def crawl_page(url: str, bypass_cache: bool = False) -> tuple[bool, str, str]:
    """
    Phase 1: Pure crawling to get high-quality markdown
    
    Returns:
        (success, markdown_content, error_message)
    """
    try:
        logger.info(f"📄 Phase 1: Crawling {url}")
        
        # Content filter for clean markdown
        content_filter = PruningContentFilter(
            threshold=0.48,
            threshold_type="dynamic",
            min_word_threshold=5
        )
        
        markdown_generator = DefaultMarkdownGenerator(
            content_filter=content_filter
        )
        
        browser_config = BrowserConfig(
            headless=True,
            verbose=False
        )
        
        run_config = CrawlerRunConfig(
            markdown_generator=markdown_generator,
            cache_mode=CacheMode.BYPASS if bypass_cache else CacheMode.ENABLED,
            word_count_threshold=10,
            excluded_tags=["nav", "footer", "header", "aside"],
            exclude_external_links=True,
            exclude_social_media_links=True,
            process_iframes=False,
            remove_overlay_elements=True,
            page_timeout=30000
        )
        
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url=url, config=run_config)
            
            if not result.success:
                return False, "", f"Crawl failed: {result.error_message}"
            
            # Extract markdown
            markdown_content = ""
            if hasattr(result.markdown, 'raw_markdown'):
                markdown_content = result.markdown.raw_markdown
            elif hasattr(result.markdown, 'fit_markdown'):
                markdown_content = result.markdown.fit_markdown
            else:
                markdown_content = str(result.markdown)
            
            logger.info(f"✅ Crawl successful: {len(markdown_content)} chars")
            return True, markdown_content, ""
            
    except asyncio.TimeoutError:
        return False, "", "Page timeout (30s exceeded)"
    except Exception as e:
        logger.error(f"Crawl error: {e}", exc_info=True)
        return False, "", f"Crawl error: {str(e)}"

async def extract_with_llm(markdown: str, url: str) -> tuple[Optional[CVData], Optional[str]]:
    """
    Phase 2: Independent LLM extraction (happens AFTER successful crawl)
    
    Returns:
        (cv_data, error_message)
    """
    try:
        logger.info("🤖 Phase 2: LLM extraction")
        
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return None, "OPENROUTER_API_KEY not configured"
        
        # Direct API call to OpenRouter (no Crawl4AI coupling)
        prompt = f"""
Extract professional CV information from the following markdown content.

Return a JSON object with these fields (return empty arrays/null if not found):
- full_name: string (person's name)
- summary: string (professional summary)
- job_titles: array of strings (job positions)
- companies: array of strings (companies worked at)
- experience_details: array of strings (key achievements/responsibilities)
- technical_skills: array of strings (all technical skills)
- languages: array of strings (programming languages)
- frameworks: array of strings (frameworks/libraries)
- tools: array of strings (tools/technologies)
- degrees: array of strings (education degrees)
- institutions: array of strings (schools/universities)
- contact_info: string (email/contact if visible)

MARKDOWN CONTENT:
{markdown[:8000]}

Return only valid JSON, no markdown formatting."""

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "google/gemini-2.5-flash",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 2000
                }
            )
        
        if response.status_code != 200:
            return None, f"LLM API error: {response.status_code}"
        
        result = response.json()
        llm_output = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        # Parse JSON from LLM output
        # Clean markdown code blocks if present
        if "```json" in llm_output:
            llm_output = llm_output.split("```json")[1].split("```")[0]
        elif "```" in llm_output:
            llm_output = llm_output.split("```")[1].split("```")[0]
        
        parsed = json.loads(llm_output.strip())
        
        # Validate with Pydantic (strict=False for leniency)
        cv_data = CVData.model_validate(parsed, strict=False)
        
        logger.info(f"✅ LLM extraction successful: {cv_data.full_name or 'N/A'}")
        return cv_data, None
        
    except json.JSONDecodeError as e:
        logger.warning(f"LLM output was not valid JSON: {e}")
        return None, f"LLM returned invalid JSON: {str(e)}"
    except Exception as e:
        logger.warning(f"LLM extraction failed: {e}", exc_info=True)
        return None, f"LLM extraction error: {str(e)}"

# ==========================================
# API Endpoints
# ==========================================

@app.get("/")
async def root():
    return {
        "service": "ResuMate CV Scraper",
        "version": "4.0.0",
        "architecture": "Crawl-then-Extract (2-phase)",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "cv-scraper",
        "llm_configured": bool(os.getenv("OPENROUTER_API_KEY"))
    }

@app.post("/extract-cv", response_model=CVExtractionResponse)
async def extract_cv(request: CVExtractionRequest):
    """
    Two-phase CV extraction: Crawl → Extract
    
    Phase 1: Always crawl for markdown (reliable)
    Phase 2: Optionally extract with LLM (best-effort)
    
    Returns markdown even if LLM fails!
    """
    logger.info(f"🔍 Starting extraction: {request.url}")
    
    warnings = []
    
    # ==========================================
    # PHASE 1: Pure Crawling (Always succeeds or fails clearly)
    # ==========================================
    success, markdown, error = await crawl_page(request.url, request.bypass_cache)
    
    if not success:
        logger.error(f"❌ Phase 1 failed: {error}")
        return CVExtractionResponse(
            success=False,
            url=request.url,
            markdown="",
            error=error
        )
    
    # At this point we ALWAYS have markdown
    logger.info(f"✅ Phase 1 complete: {len(markdown)} chars")
    
    # ==========================================
    # PHASE 2: LLM Extraction (Best-effort, optional)
    # ==========================================
    structured_data = None
    
    if request.use_llm:
        cv_data, llm_error = await extract_with_llm(markdown, request.url)
        
        if llm_error:
            warnings.append(f"LLM extraction failed: {llm_error}")
            logger.warning(f"⚠️ Phase 2 failed (non-fatal): {llm_error}")
        else:
            structured_data = cv_data
            logger.info("✅ Phase 2 complete: structured data extracted")
    else:
        logger.info("⏭️ Phase 2 skipped (use_llm=False)")
    
    # ==========================================
    # Return Response (markdown is ALWAYS present)
    # ==========================================
    return CVExtractionResponse(
        success=True,
        url=request.url,
        markdown=markdown,
        structured_data=structured_data,
        metadata={
            "markdown_length": len(markdown),
            "has_structured_data": structured_data is not None,
            "llm_attempted": request.use_llm,
            "warnings_count": len(warnings)
        },
        warnings=warnings
    )

# ==========================================
# Run Server
# ==========================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"🌐 Starting on {host}:{port}")
    
    uvicorn.run(app, host=host, port=port, log_level="info")
