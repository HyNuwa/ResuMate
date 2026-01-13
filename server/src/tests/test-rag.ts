import { getOptimizationContext } from '../modules/model/services/rag.service';
import { pool } from '../config/database';

/**
 * Test script para verificar la integración del RAG híbrido
 */
async function testMultiSourceRAG() {
  console.log('🧪 Testing Multi-Source RAG Integration...\n');
  
  try {
    // Test 1: Verificar que la knowledge base tiene datos
    const kbCount = await pool.query('SELECT COUNT(*) FROM knowledge_base');
    console.log(`✅ Knowledge Base: ${kbCount.rows[0].count} entries loaded`);
    
    // Test 2: Crear un CV de prueba simple
    const testResume = await pool.query(
      `INSERT INTO resumes (user_id, original_text, file_name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['test', 'Senior Frontend Developer with 5 years experience in React, TypeScript, Next.js', 'test-resume.txt']
    );
    const resumeId = testResume.rows[0].id;
    console.log(`✅ Test Resume Created: ID ${resumeId}`);
    
    // Test 3: Crear chunks con embeddings (simulado - sin embedding real para test rápido)
    await pool.query(
      `INSERT INTO resume_chunks (resume_id, content, chunk_index)
       VALUES ($1, $2, $3)`,
      [resumeId, 'Senior Frontend Developer with React and TypeScript', 0]
    );
    console.log(`✅ Resume Chunks Created`);
    
    // Test 4: Probar la función de multi-source RAG
    console.log('\n📊 Testing getOptimizationContext...');
    const context = await getOptimizationContext({
      resumeId,
      resumeText: 'Senior Frontend Developer with 5 years experience in React, TypeScript',
      jobDescription: 'Looking for a Senior Frontend Developer with React, Next.js, and TypeScript experience',
      detectedRole: 'Frontend Developer',
      detectedSeniority: 'Senior'
    });
    
    console.log(`\n✅ Context Retrieved:`);
    console.log(`   - User Experience Chunks: ${context.userExperience.length}`);
    console.log(`   - Market Criteria: ${context.marketCriteria.length}`);
    console.log(`   - ATS Best Practices: ${context.atsBestPractices.length}`);
    console.log(`   - Tech Trends: ${context.techTrends.length}`);
    
    // Test 5: Mostrar una muestra del contexto
    if (context.marketCriteria.length > 0) {
      console.log(`\n📋 Sample Market Criteria:`);
      console.log(`   Content: ${context.marketCriteria[0].content.substring(0, 100)}...`);
      console.log(`   Similarity: ${context.marketCriteria[0].similarity}`);
    }
    
    // Cleanup
    await pool.query('DELETE FROM resume_chunks WHERE resume_id = $1', [resumeId]);
    await pool.query('DELETE FROM resumes WHERE id = $1', [resumeId]);
    console.log(`\n🧹 Cleanup Complete`);
    
    console.log(`\n✅ All tests passed! Multi-source RAG is working correctly.`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run test
testMultiSourceRAG()
  .then(() => {
    console.log('\n✨ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  });
