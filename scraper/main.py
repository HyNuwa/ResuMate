from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from crawl4ai import AsyncWebCrawler
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from pydantic import BaseModel
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ResuMate Job Scraper",
    description="Microservicio de scraping con Crawl4AI para ResuMate",
    version="1.0.0"
)

# CORS: Permitir requests desde el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Modelos Pydantic
# ==========================================

class ScrapeRequest(BaseModel):
    url: str

class JobExtractionRequest(BaseModel):
    url: str
    use_llm: bool = False

# ==========================================
# Endpoints
# ==========================================

@app.get("/")
async def root():
    """Root endpoint con info del servicio"""
    return {
        "service": "ResuMate Scraper",
        "status": "running",
        "version": "1.0.0",
        "endpoints": ["/health", "/extract", "/extract-job"]
    }

@app.get("/health")
async def health_check():
    """Health check para Docker healthcheck"""
    return {
        "status": "healthy",
        "service": "scraper",
        "crawl4ai": "ready"
    }

@app.post("/extract")
async def extract_content(request: ScrapeRequest):
    """
    Extrae contenido de una URL y devuelve markdown limpio.
    
    Args:
        request: ScrapeRequest con url a scrapear
        
    Returns:
        Dict con markdown y cleaned_html
    """
    logger.info(f"Extracting content from: {request.url}")
    
    try:
        async with AsyncWebCrawler(verbose=False) as crawler:
            result = await crawler.arun(url=request.url)
            
            if result.success:
                logger.info(f"Successfully extracted {len(result.markdown)} chars from {request.url}")
                return {
                    "success": True,
                    "url": request.url,
                    "markdown": result.markdown,
                    "cleaned_html": result.cleaned_html,
                    "metadata": {
                        "title": getattr(result, 'title', None),
                        "length": len(result.markdown)
                    }
                }
            else:
                logger.error(f"Scraping failed for {request.url}: {result.error_message}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Scraping failed: {result.error_message}"
                )
                
    except Exception as e:
        logger.error(f"Error extracting content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-job")
async def extract_job_structured(request: JobExtractionRequest):
    """
    Extrae datos estructurados de una job posting.
    
    Args:
        request: JobExtractionRequest con url y opción use_llm
        
    Returns:
        Dict con markdown y opcionalmente structured_data si use_llm=True
    """
    logger.info(f"Extracting job from: {request.url} (LLM: {request.use_llm})")
    
    try:
        extraction_strategy = None
        
        # Si pide LLM extraction, configurar estrategia con Gemini
        if request.use_llm:
            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                raise HTTPException(
                    status_code=500,
                    detail="OPENROUTER_API_KEY not configured"
                )
            
            job_schema = {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Job title"
                    },
                    "company": {
                        "type": "string",
                        "description": "Company name"
                    },
                    "required_skills": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of required skills"
                    },
                    "nice_to_have": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Nice to have skills"
                    },
                    "experience_years": {
                        "type": "number",
                        "description": "Years of experience required"
                    },
                    "seniority": {
                        "type": "string",
                        "enum": ["Junior", "Mid", "Senior"],
                        "description": "Seniority level"
                    },
                    "key_responsibilities": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Main job responsibilities"
                    }
                },
                "required": ["title", "required_skills"]
            }
            
            extraction_strategy = LLMExtractionStrategy(
                provider="openai",  # OpenAI-compatible API
                api_token=api_key,
                base_url="https://openrouter.ai/api/v1",
                model="google/gemini-2.0-flash-exp:free",
                schema=job_schema,
                instruction="Extract structured job requirements from this job posting. Be thorough and accurate."
            )
            
            logger.info("Using LLM extraction strategy with Gemini")
        
        async with AsyncWebCrawler(verbose=False) as crawler:
            result = await crawler.arun(
                url=request.url,
                extraction_strategy=extraction_strategy
            )
            
            if result.success:
                response = {
                    "success": True,
                    "url": request.url,
                    "markdown": result.markdown,
                    "metadata": {
                        "length": len(result.markdown)
                    }
                }
                
                # Si usó LLM y hay datos estructurados, incluirlos
                if request.use_llm and result.extracted_content:
                    try:
                        import json
                        structured = json.loads(result.extracted_content)
                        response["structured_data"] = structured
                        logger.info(f"Extracted structured data: {structured.get('title', 'N/A')}")
                    except json.JSONDecodeError:
                        logger.warning("Failed to parse LLM extracted content as JSON")
                        response["structured_data"] = result.extracted_content
                
                return response
            else:
                logger.error(f"Job extraction failed: {result.error_message}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Extraction failed: {result.error_message}"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# Startup/Shutdown Events
# ==========================================

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 ResuMate Scraper Microservice started")
    logger.info(f"Environment: {os.getenv('ENV', 'development')}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 ResuMate Scraper Microservice shutting down")

# ==========================================
# Ejecutar servidor
# ==========================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
