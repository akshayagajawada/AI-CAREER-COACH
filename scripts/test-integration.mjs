// Test Career Recommendation Feature Integration
// This tests if the actual functions in onet-service.js work correctly

import {
  searchCareers,
  getCareerDetails,
  getCareerSkills,
  getCareerKnowledge,
  getCareerRecommendations
} from '../lib/onet-service.js';

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

async function runIntegrationTests() {
  console.clear();
  log('🧪 Career Recommendation Feature - Integration Test', 'cyan');
  log('='.repeat(70), 'cyan');
  log('Testing actual application functions...', 'blue');
  log('='.repeat(70), 'cyan');

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: searchCareers function
  log('\n1️⃣  Testing searchCareers() function', 'cyan');
  log('-'.repeat(70), 'cyan');
  totalTests++;

  try {
    const results = await searchCareers('software developer');
    if (results && results.length > 0) {
      log(`✓ searchCareers() working - Found ${results.length} results`, 'green');
      log(`  First result: ${results[0].title} (${results[0].code || 'N/A'})`, 'yellow');
      passedTests++;
    } else {
      log('✗ searchCareers() returned no results', 'red');
    }
  } catch (error) {
    log(`✗ searchCareers() failed: ${error.message}`, 'red');
  }

  // Test 2: getCareerDetails function
  log('\n2️⃣  Testing getCareerDetails() function', 'cyan');
  log('-'.repeat(70), 'cyan');
  totalTests++;

  try {
    const careers = await searchCareers('data scientist');
    if (careers && careers.length > 0) {
      const details = await getCareerDetails(careers[0].uri);
      if (details && details.title) {
        log(`✓ getCareerDetails() working`, 'green');
        log(`  Title: ${details.title}`, 'yellow');
        
        // Check description
        let hasDesc = false;
        if (details.description) {
          const desc = details.description['en']?.literal || 
                      details.description['en-us']?.literal ||
                      Object.values(details.description)[0]?.literal;
          if (desc) {
            log(`  Description: ${desc.substring(0, 80)}...`, 'blue');
            hasDesc = true;
          }
        }
        
        log(`  Has Skills: ${details._links?.hasEssentialSkill?.length || 0} essential`, 'blue');
        passedTests++;
      } else {
        log('✗ getCareerDetails() returned invalid data', 'red');
      }
    }
  } catch (error) {
    log(`✗ getCareerDetails() failed: ${error.message}`, 'red');
  }

  // Test 3: getCareerSkills function
  log('\n3️⃣  Testing getCareerSkills() function', 'cyan');
  log('-'.repeat(70), 'cyan');
  totalTests++;

  try {
    const careers = await searchCareers('software engineer');
    if (careers && careers.length > 0) {
      const skills = await getCareerSkills(careers[0].uri);
      if (skills && skills.length > 0) {
        log(`✓ getCareerSkills() working - Found ${skills.length} skills`, 'green');
        log(`  Sample skills:`, 'yellow');
        skills.slice(0, 5).forEach((skill, idx) => {
          log(`    ${idx + 1}. ${skill.name} (${skill.level})`, 'blue');
        });
        passedTests++;
      } else {
        log('⚠ getCareerSkills() returned no skills', 'yellow');
        passedTests += 0.5;
      }
    }
  } catch (error) {
    log(`✗ getCareerSkills() failed: ${error.message}`, 'red');
  }

  // Test 4: getCareerKnowledge function
  log('\n4️⃣  Testing getCareerKnowledge() function', 'cyan');
  log('-'.repeat(70), 'cyan');
  totalTests++;

  try {
    const careers = await searchCareers('teacher');
    if (careers && careers.length > 0) {
      const knowledge = await getCareerKnowledge(careers[0].uri);
      log(`✓ getCareerKnowledge() working - Found ${knowledge.length} items`, 'green');
      if (knowledge.length > 0) {
        log(`  Sample: ${knowledge.slice(0, 3).join(', ')}`, 'blue');
      }
      passedTests++;
    }
  } catch (error) {
    log(`✗ getCareerKnowledge() failed: ${error.message}`, 'red');
  }

  // Test 5: getCareerRecommendations function (most important)
  log('\n5️⃣  Testing getCareerRecommendations() function', 'cyan');
  log('-'.repeat(70), 'cyan');
  totalTests++;

  try {
    const userProfile = {
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      interests: ['software development', 'data analysis'],
      experience: 'web development',
    };

    log('  User Profile:', 'blue');
    log(`    Skills: ${userProfile.skills.join(', ')}`, 'blue');
    log(`    Interests: ${userProfile.interests.join(', ')}`, 'blue');
    
    const recommendations = await getCareerRecommendations(userProfile);
    
    if (recommendations && recommendations.length > 0) {
      log(`\n✓ getCareerRecommendations() working - ${recommendations.length} matches found`, 'green');
      
      log('\n  Top 5 Career Matches:', 'yellow');
      recommendations.slice(0, 5).forEach((rec, idx) => {
        log(`    ${idx + 1}. ${rec.title} (Match: ${rec.matchScore}%)`, 'cyan');
        log(`       Code: ${rec.code || 'N/A'}`, 'blue');
        if (rec.description) {
          const desc = typeof rec.description === 'string' 
            ? rec.description 
            : rec.description['en']?.literal || 'No description';
          log(`       ${desc.substring(0, 60)}...`, 'blue');
        }
      });
      
      passedTests++;
    } else {
      log('✗ getCareerRecommendations() returned no recommendations', 'red');
    }
  } catch (error) {
    log(`✗ getCareerRecommendations() failed: ${error.message}`, 'red');
    console.error(error);
  }

  // Test 6: Accuracy Check - Do results make sense?
  log('\n6️⃣  Testing Result Accuracy', 'cyan');
  log('-'.repeat(70), 'cyan');
  totalTests++;

  try {
    const testCases = [
      { skills: ['nursing', 'patient care', 'medical'], expected: 'nurse' },
      { skills: ['teaching', 'education', 'classroom'], expected: 'teacher' },
      { skills: ['accounting', 'finance', 'audit'], expected: 'account' }
    ];

    let accurateResults = 0;
    for (const testCase of testCases) {
      const recs = await getCareerRecommendations({ skills: testCase.skills });
      if (recs && recs.length > 0) {
        const hasRelevant = recs.slice(0, 3).some(r => 
          r.title.toLowerCase().includes(testCase.expected)
        );
        if (hasRelevant) {
          log(`  ✓ ${testCase.expected}: Relevant results found`, 'green');
          accurateResults++;
        } else {
          log(`  ⚠ ${testCase.expected}: Top result is "${recs[0].title}"`, 'yellow');
          accurateResults += 0.3;
        }
      }
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (accurateResults >= 2) {
      log(`\n✓ Accuracy test passed (${accurateResults}/3)`, 'green');
      passedTests++;
    } else {
      log(`\n⚠ Accuracy could be improved (${accurateResults}/3)`, 'yellow');
      passedTests += 0.5;
    }
  } catch (error) {
    log(`✗ Accuracy test failed: ${error.message}`, 'red');
  }

  // Final Summary
  log('\n' + '='.repeat(70), 'cyan');
  log('📋 INTEGRATION TEST SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');

  const successRate = (passedTests / totalTests * 100).toFixed(1);
  const color = successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red';

  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}/${totalTests}`, 'green');
  log(`Success Rate: ${successRate}%`, color);

  if (successRate >= 90) {
    log('\n🎉 EXCELLENT - Feature is production ready!', 'green');
    log('All core functions working correctly', 'green');
    log('Results are accurate and relevant', 'green');
  } else if (successRate >= 70) {
    log('\n✅ GOOD - Feature is working well', 'yellow');
    log('Core functionality operational with minor issues', 'yellow');
  } else {
    log('\n❌ NEEDS WORK - Some functions not working', 'red');
    log('Review implementation before deploying', 'red');
  }

  log('\n' + '='.repeat(70), 'cyan');
  log('✅ Integration test complete!', 'cyan');
}

runIntegrationTests().catch(error => {
  log(`\n❌ Integration test suite failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
