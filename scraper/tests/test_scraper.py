"""
Test script for ResuMate CV Scraper
Tests the CV extraction endpoint with sample URLs
"""

import asyncio
import requests
import json
from typing import Optional

# Configuration
BASE_URL = "http://localhost:8000"
TEST_URLS = [
    "https://github.com/unclecode",  # GitHub profile (public CV-like page)
    "https://www.linkedin.com/in/luisinaadp/",  # LinkedIn (may require auth)
]

def test_health_check():
    """Test the health check endpoint"""
    print("🏥 Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")
    return response.status_code == 200

def test_cv_extraction(url: str, use_llm: bool = True, bypass_cache: bool = False):
    """
    Test CV extraction with a given URL
    
    Args:
        url: URL to extract CV from
        use_llm: Whether to use LLM extraction
        bypass_cache: Whether to bypass cache
    """
    print(f"\n{'='*80}")
    print(f"🔍 Testing CV Extraction")
    print(f"   URL: {url}")
    print(f"   LLM: {use_llm}")
    print(f"   Bypass Cache: {bypass_cache}")
    print(f"{'='*80}\n")
    
    try:
        response = requests.post(
            f"{BASE_URL}/extract-cv",
            json={
                "url": url,
                "use_llm": use_llm,
                "bypass_cache": bypass_cache
            },
            timeout=60  # Give it time for LLM processing
        )
        
        print(f"✅ Response Status: {response.status_code}\n")
        
        data = response.json()
        
        # Print results
        print("📊 Results:")
        print(f"   Success: {data.get('success')}")
        print(f"   URL: {data.get('url')}")
        
        if data.get('error'):
            print(f"   ❌ Error: {data['error']}")
            return False
        
        # Markdown preview
        markdown = data.get('markdown', '')
        print(f"\n📝 Markdown Preview ({len(markdown)} chars):")
        print(f"   {markdown[:200]}..." if len(markdown) > 200 else f"   {markdown}")
        
        # Structured data
        structured = data.get('structured_data')
        if structured:
            print(f"\n🎯 Structured Data:")
            print(f"   Full Name: {structured.get('full_name', 'N/A')}")
            
            # Work experience
            experience = structured.get('work_experience', [])
            print(f"   Work Experience: {len(experience)} entries")
            if experience:
                for i, exp in enumerate(experience[:2], 1):  # Show first 2
                    print(f"      {i}. {exp.get('job_title')} at {exp.get('company')}")
            
            # Skills
            skills = structured.get('technical_skills', {})
            if skills:
                print(f"   Languages: {', '.join(skills.get('languages', [])[:5])}")
                print(f"   Frameworks: {', '.join(skills.get('frameworks', [])[:5])}")
                print(f"   Tools: {', '.join(skills.get('tools', [])[:5])}")
            
            # Education
            education = structured.get('education', [])
            print(f"   Education: {len(education)} entries")
            if education:
                for i, edu in enumerate(education[:2], 1):
                    print(f"      {i}. {edu.get('degree')} - {edu.get('institution')}")
        else:
            print("\n⚠️  No structured data extracted")
        
        # Metadata
        metadata = data.get('metadata', {})
        print(f"\n📈 Metadata:")
        print(f"   Extraction Method: {metadata.get('extraction_method')}")
        print(f"   Markdown Length: {metadata.get('markdown_length')}")
        print(f"   Has Structured Data: {metadata.get('has_structured_data')}")
        
        return data.get('success', False)
        
    except requests.exceptions.Timeout:
        print("⏱️  Request timed out (>60s)")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the server running?")
        return False
    except Exception as e:
        print(f"💥 Unexpected error: {str(e)}")
        return False

def save_test_results(url: str, data: dict, filename: str = "test_results.json"):
    """Save test results to a JSON file"""
    try:
        # Load existing results
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                results = json.load(f)
        except FileNotFoundError:
            results = []
        
        # Add new result
        results.append({
            "url": url,
            "timestamp": "test",
            "data": data
        })
        
        # Save
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Results saved to {filename}")
    except Exception as e:
        print(f"⚠️  Failed to save results: {e}")

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("🚀 ResuMate CV Scraper - Test Suite")
    print("="*80 + "\n")
    
    # Check if server is running
    if not test_health_check():
        print("❌ Server is not responding. Please start it with:")
        print("   python main.py")
        return
    
    print("\n✅ Server is healthy!\n")
    
    # Test with a sample URL (GitHub profile as it's public and CV-like)
    test_url = "https://github.com/unclecode"
    
    print("\n" + "="*80)
    print("Test 1: LLM Extraction (Recommended)")
    print("="*80)
    success_llm = test_cv_extraction(test_url, use_llm=True, bypass_cache=False)
    
    print("\n" + "="*80)
    print("Test 2: CSS Extraction (Fallback)")
    print("="*80)
    success_css = test_cv_extraction(test_url, use_llm=False, bypass_cache=True)
    
    # Summary
    print("\n" + "="*80)
    print("📊 Test Summary")
    print("="*80)
    print(f"✅ LLM Extraction: {'PASSED' if success_llm else 'FAILED'}")
    print(f"✅ CSS Extraction: {'PASSED' if success_css else 'FAILED'}")
    
    print("\n💡 Tips:")
    print("   - Modify TEST_URLS at the top to test your own URLs")
    print("   - Check .env file for OPENROUTER_API_KEY")
    print("   - Use bypass_cache=True for fresh extractions")
    print("   - Check server logs for detailed debugging")
    
    print("\n✨ Testing complete!\n")

if __name__ == "__main__":
    main()
