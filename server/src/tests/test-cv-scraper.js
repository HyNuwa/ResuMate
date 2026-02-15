/**
 * Quick test script for CV extraction integration
 * Tests the Node.js backend calling the Python scraper service
 */

const API_URL = 'http://localhost:3000/api/scraper';
const TEST_PROFILE = 'https://github.com/unclecode';

async function testHealthCheck() {
    console.log('\n🔍 Test 1: Health Check');
    console.log('─'.repeat(50));

    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();

        console.log('✅ Status:', response.status);
        console.log('📊 Response:', JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function testCVExtraction() {
    console.log('\n🔍 Test 2: CV Profile Extraction');
    console.log('─'.repeat(50));
    console.log('Profile:', TEST_PROFILE);

    try {
        const startTime = Date.now();

        const response = await fetch(`${API_URL}/extract-cv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: TEST_PROFILE,
                use_llm: true,
                bypass_cache: false
            })
        });

        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('✅ Status:', response.status);
        console.log('⏱️  Duration:', duration + 's');
        console.log('\n📊 Metadata:');
        console.log('   - Markdown length:', data.metadata?.markdown_length || 0);
        console.log('   - Has structured data:', data.metadata?.has_structured_data || false);
        console.log('   - LLM attempted:', data.metadata?.llm_attempted || false);
        console.log('   - Warnings:', data.warnings?.length || 0);

        if (data.structured_data) {
            console.log('\n👤 Extracted Data:');
            console.log('   - Name:', data.structured_data.full_name || 'N/A');
            console.log('   - Job Titles:', data.structured_data.job_titles?.length || 0);
            console.log('   - Companies:', data.structured_data.companies?.length || 0);
            console.log('   - Skills:', data.structured_data.technical_skills?.length || 0);
            console.log('   - Languages:', data.structured_data.languages?.length || 0);
        }

        if (data.markdown) {
            const preview = data.markdown.substring(0, 200);
            console.log('\n📝 Markdown Preview:');
            console.log(preview + '...\n');
        }

        if (data.error) {
            console.error('⚠️  Error:', data.error);
        }

        if (data.warnings?.length > 0) {
            console.warn('⚠️  Warnings:', data.warnings);
        }

        return response.status === 200 && data.success;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function testInvalidURL() {
    console.log('\n🔍 Test 3: Invalid URL Handling');
    console.log('─'.repeat(50));

    try {
        const response = await fetch(`${API_URL}/extract-cv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: 'not-a-valid-url'
            })
        });

        const data = await response.json();

        console.log('✅ Status:', response.status);
        console.log('📊 Response:', JSON.stringify(data, null, 2));
        return response.status === 400;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('\n🚀 CV Scraper Integration Tests');
    console.log('═'.repeat(50));

    const results = {
        healthCheck: await testHealthCheck(),
        cvExtraction: await testCVExtraction(),
        invalidURL: await testInvalidURL()
    };

    console.log('\n📋 Test Results Summary');
    console.log('═'.repeat(50));
    console.log('Health Check:', results.healthCheck ? '✅ PASS' : '❌ FAIL');
    console.log('CV Extraction:', results.cvExtraction ? '✅ PASS' : '❌ FAIL');
    console.log('Invalid URL:', results.invalidURL ? '✅ PASS' : '❌ FAIL');

    const allPassed = Object.values(results).every(r => r);
    console.log('\n' + (allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
    console.log('═'.repeat(50) + '\n');

    process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
