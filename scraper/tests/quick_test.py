"""
Quick test for LLM extraction only
"""
import requests
import json

response = requests.post(
    "http://localhost:8000/extract-cv",
    json={
        "url": "https://github.com/unclecode",
        "use_llm": True,
        "bypass_cache": True
    },
    timeout=60
)

print("Status:", response.status_code)
print("\nResponse:")
print(json.dumps(response.json(), indent=2))
