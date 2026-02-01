"""
Check available OpenRouter models
"""
import httpx
import os
import json
from dotenv import load_dotenv
import asyncio

load_dotenv()

async def list_models():
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not api_key:
        print("❌ OPENROUTER_API_KEY not found")
        return
    
    print("Fetching available models from OpenRouter...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://openrouter.ai/api/v1/models",
                headers={"Authorization": f"Bearer {api_key}"}
            )
            
            if response.status_code == 200:
                models = response.json()
                
                # Filter for Gemini models
                print("\n🔍 Available Gemini models:")
                gemini_models = [m for m in models.get('data', []) if 'gemini' in m.get('id', '').lower()]
                
                for model in gemini_models[:10]:  # Show first 10
                    print(f"  • {model.get('id')}")
                    if model.get('pricing'):
                        print(f"    Price: ${model['pricing'].get('prompt', 'N/A')}/token")
                
                # Show all free models
                print("\n💰 Free models:")
                free_models = [m for m in models.get('data', []) if ':free' in m.get('id', '')]
                for model in free_models[:10]:
                    print(f"  • {model.get('id')}")
                    
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
                
    except Exception as e:
        print(f"💥 Exception: {e}")

if __name__ == "__main__":
    asyncio.run(list_models())
