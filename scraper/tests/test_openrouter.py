"""
Test OpenRouter API connection
"""
import httpx
import os
import json
from dotenv import load_dotenv
import asyncio

load_dotenv()

async def test_openrouter():
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not api_key:
        print("❌ OPENROUTER_API_KEY not found in .env")
        return
    
    print(f"✅ API Key found: {api_key[:20]}...")
    
    # Test request
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",  # Optional but recommended
        "X-Title": "ResuMate CV Scraper"  # Optional but recommended
    }
    
    payload = {
        "model": "google/gemini-2.5-flash",
        "messages": [
            {"role": "user", "content": "Say hello in JSON format with a 'message' field"}
        ]
    }
    
    print(f"\n📡 Sending request to: {url}")
    print(f"🤖 Model: {payload['model']}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            print(f"\n📊 Status Code: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"\n✅ Success!")
                print(json.dumps(result, indent=2))
            else:
                print(f"\n❌ Error!")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"\n💥 Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_openrouter())
