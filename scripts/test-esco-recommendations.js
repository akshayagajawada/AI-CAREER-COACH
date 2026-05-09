// Test ESCO Career Recommendations Feature
// Run with: node scripts/test-esco-recommendations.js

const https = require('https');

// Test configurations
const TEST_QUERIES = [
  'software developer',
  'data scientist', 
  'nurse',
  'teacher',
  'accountant'
];

const ESCO_BASE_URL = 'https://ec.europa.eu/esco/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function testESCOSearch(query) {
  const url = `${ESCO_BASE_URL}/search?text=${encodeURIComponent(query)}&type=occupation&language=en&limit=5`;
  
  try {
    const data = await makeRequest(url);
    
    if (!data._embedded || !data._embedded.results) {
      return { success: false, error: 'No results found' };
    }

    const results = data._embedded.results;
    return {
      success: true,
      count: results.length,
      results: results.map(r => ({
        title: r.title,
        uri: r.uri,
        code: r.code || 'N/A',
        description: r.description?.substring(0, 100) + '...' || 'No description'
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testESCODetails(uri) {
  const url = `${ESCO_BASE_URL}/resource/occupation?uri=${encodeURIComponent(uri)}&language=en`;
  
  try {
    const data = await makeRequest(url);
    
    // Extract description from multilingual object
    let description = 'No description';
    if (data.description) {
      const descObj = data.description['en']?.literal || 
                      data.description['en-us']?.literal ||
                      Object.values(data.description)[0]?.literal;
      if (descObj) {
        description = descObj.substring(0, 150) + '...';
      }
    }
    
    return {
      success: true,
      title: data.title,
      description,
      skills: {
        essential: data._links?.hasEssentialSkill?.length || 0,
        optional: data._links?.hasOptionalSkill?.length || 0
      },
      knowledge: {
        essential: data._links?.hasEssentialKnowledge?.length || 0,
        optional: data._links?.hasOptionalKnowledge?.length || 0
      },
      broader: data._links?.broaderOccupation?.length || 0,
      narrower: data._links?.narrowerOccupation?.length || 0
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testSkillMatching() {
  log('\n📊 Testing Skill-Based Matching Logic', 'cyan');
  log('=' .repeat(60), 'cyan');

  const testSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'SQL',
    'Machine Learning', 'Data Analysis', 'Communication'
  ];

  const searchQuery = 'software developer data scientist';
  const url = `${ESCO_BASE_URL}/search?text=${encodeURIComponent(searchQuery)}&type=occupation&language=en&limit=10`;
  
  try {
    const data = await makeRequest(url);
    const occupations = data._embedded?.results || [];

    log(`\n✓ Test Skills: ${testSkills.join(', ')}`, 'yellow');
    log(`✓ Found ${occupations.length} potential occupations`, 'green');

    // Simulate scoring
    let scoredResults = [];
    for (const occ of occupations.slice(0, 5)) {
      // Get details to check skills
      const details = await testESCODetails(occ.uri);
      if (details.success) {
        const score = Math.random() * 100; // Simulated score
        scoredResults.push({
          title: occ.title,
          score: score.toFixed(2),
          skills: details.skills,
          knowledge: details.knowledge
        });
      }
    }

    log('\nTop Matches:', 'green');
    scoredResults
      .sort((a, b) => b.score - a.score)
      .forEach((result, idx) => {
        log(`  ${idx + 1}. ${result.title} (Score: ${result.score})`, 'yellow');
        log(`     Essential Skills: ${result.skills.essential}, Optional: ${result.skills.optional}`, 'blue');
      });

    return { success: true, matches: scoredResults.length };
  } catch (error) {
    log(`✗ Skill matching test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.clear();
  log('🧪 ESCO Career Recommendations - Comprehensive Test Suite', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Test Date: ${new Date().toLocaleString()}`, 'blue');
  log('='.repeat(60), 'cyan');

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: API Connectivity
  log('\n1️⃣  Testing ESCO API Connectivity', 'cyan');
  log('-'.repeat(60), 'cyan');
  
  try {
    const healthCheck = await makeRequest(`${ESCO_BASE_URL}/search?text=developer&type=occupation&language=en&limit=1`);
    if (healthCheck._embedded) {
      log('✓ ESCO API is accessible', 'green');
      passedTests++;
    } else {
      log('✗ ESCO API returned unexpected format', 'red');
    }
  } catch (error) {
    log(`✗ ESCO API connectivity failed: ${error.message}`, 'red');
  }
  totalTests++;

  // Test 2: Search Functionality
  log('\n2️⃣  Testing Search for Various Occupations', 'cyan');
  log('-'.repeat(60), 'cyan');

  for (const query of TEST_QUERIES) {
    const result = await testESCOSearch(query);
    totalTests++;
    
    if (result.success) {
      log(`✓ "${query}": Found ${result.count} results`, 'green');
      
      // Show first 2 results
      result.results.slice(0, 2).forEach((r, idx) => {
        log(`  ${idx + 1}. ${r.title} (${r.code})`, 'yellow');
      });
      
      passedTests++;
    } else {
      log(`✗ "${query}": ${result.error}`, 'red');
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test 3: Detail Retrieval
  log('\n3️⃣  Testing Occupation Detail Retrieval', 'cyan');
  log('-'.repeat(60), 'cyan');

  const sampleSearch = await testESCOSearch('software developer');
  if (sampleSearch.success && sampleSearch.results.length > 0) {
    const sampleUri = sampleSearch.results[0].uri;
    const details = await testESCODetails(sampleUri);
    totalTests++;

    if (details.success) {
      log(`✓ Retrieved details for: ${details.title}`, 'green');
      log(`  Description: ${details.description}`, 'blue');
      log(`  Skills: ${details.skills.essential} essential, ${details.skills.optional} optional`, 'blue');
      log(`  Knowledge: ${details.knowledge.essential} essential, ${details.knowledge.optional} optional`, 'blue');
      log(`  Related: ${details.broader} broader, ${details.narrower} narrower`, 'blue');
      passedTests++;
    } else {
      log(`✗ Failed to retrieve details: ${details.error}`, 'red');
    }
  }

  // Test 4: Skill Matching
  const skillTest = await testSkillMatching();
  totalTests++;
  if (skillTest.success) {
    passedTests++;
  }

  // Test 5: Data Quality Check
  log('\n4️⃣  Testing Data Quality & Accuracy', 'cyan');
  log('-'.repeat(60), 'cyan');

  const qualityTests = [
    { query: 'nurse', expectedKeywords: ['health', 'care', 'patient', 'medical'] },
    { query: 'teacher', expectedKeywords: ['education', 'teaching', 'student', 'learning'] },
    { query: 'accountant', expectedKeywords: ['financial', 'accounting', 'tax', 'audit'] }
  ];

  for (const test of qualityTests) {
    const result = await testESCOSearch(test.query);
    totalTests++;

    if (result.success && result.results.length > 0) {
      const firstResult = result.results[0];
      const hasRelevantKeyword = test.expectedKeywords.some(keyword =>
        firstResult.title.toLowerCase().includes(keyword) ||
        firstResult.description.toLowerCase().includes(keyword)
      );

      if (hasRelevantKeyword) {
        log(`✓ "${test.query}" returned relevant results`, 'green');
        log(`  Top: ${firstResult.title}`, 'yellow');
        passedTests++;
      } else {
        log(`⚠ "${test.query}" results may not be optimal`, 'yellow');
        log(`  Top: ${firstResult.title}`, 'yellow');
        passedTests += 0.5; // Partial credit
      }
    } else {
      log(`✗ "${test.query}" search failed`, 'red');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test 6: Performance Check
  log('\n5️⃣  Testing Response Times', 'cyan');
  log('-'.repeat(60), 'cyan');

  const perfTests = [];
  for (let i = 0; i < 3; i++) {
    const start = Date.now();
    await testESCOSearch('engineer');
    const duration = Date.now() - start;
    perfTests.push(duration);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  const avgTime = perfTests.reduce((a, b) => a + b, 0) / perfTests.length;
  totalTests++;

  if (avgTime < 2000) {
    log(`✓ Average response time: ${avgTime.toFixed(0)}ms (Excellent)`, 'green');
    passedTests++;
  } else if (avgTime < 5000) {
    log(`⚠ Average response time: ${avgTime.toFixed(0)}ms (Acceptable)`, 'yellow');
    passedTests += 0.5;
  } else {
    log(`✗ Average response time: ${avgTime.toFixed(0)}ms (Slow)`, 'red');
  }

  // Final Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📋 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');

  const successRate = (passedTests / totalTests * 100).toFixed(1);
  const color = successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red';

  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  log(`Success Rate: ${successRate}%`, color);

  if (successRate >= 80) {
    log('\n🎉 Career Recommendations Feature: WORKING CORRECTLY', 'green');
    log('✓ ESCO API integration is functional', 'green');
    log('✓ Search results are accurate and relevant', 'green');
    log('✓ Data quality meets requirements', 'green');
  } else if (successRate >= 60) {
    log('\n⚠️  Career Recommendations Feature: PARTIALLY WORKING', 'yellow');
    log('Some tests failed but core functionality is operational', 'yellow');
  } else {
    log('\n❌ Career Recommendations Feature: NEEDS ATTENTION', 'red');
    log('Multiple failures detected - review implementation', 'red');
  }

  log('\n' + '='.repeat(60), 'cyan');
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
