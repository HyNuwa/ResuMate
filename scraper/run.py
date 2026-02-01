"""
Script wrapper para ejecutar el scraper con el event loop correcto
Evita el bug de Python 3.13 + Windows + Playwright
"""

import sys
import asyncio

# Fix CRÍTICO para Python 3.13 en Windows
if sys.platform == 'win32':
    # Configurar política ANTES de que uvicorn configure su event loop
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    print("✅ Configured WindowsSelectorEventLoopPolicy")

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting ResuMate Scraper on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
        loop="asyncio"  # Usar event loop de asyncio (con nuestra política)
    )
