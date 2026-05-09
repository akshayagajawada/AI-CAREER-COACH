// Debug Career Recommendation Logic
import {
  searchCareers,
  getCareerRecommendations
} from '../lib/onet-service.js';

async function debug() {
  console.log('🔍 Debugging Career Recommendation Logic\n');
  
  // Test 1: What does searching for "JavaScript" return?
  console.log('1. Searching for "JavaScript"...');
  const jsResults = await searchCareers('JavaScript');
  console.log(`   Found ${jsResults.length} results:`);
  jsResults.slice(0, 5).forEach((r, idx) => {
    console.log(`   ${idx + 1}. ${r.title} (${r.code || 'N/A'})`);
  });
  
  // Test 2: What about "software"?
  console.log('\n2. Searching for "software"...');
  const softwareResults = await searchCareers('software');
  console.log(`   Found ${softwareResults.length} results:`);
  softwareResults.slice(0, 5).forEach((r, idx) => {
    console.log(`   ${idx + 1}. ${r.title} (${r.code || 'N/A'})`);
  });
  
  // Test 3: What about "developer"?
  console.log('\n3. Searching for "developer"...');
  const devResults = await searchCareers('developer');
  console.log(`   Found ${devResults.length} results:`);
  devResults.slice(0, 5).forEach((r, idx) => {
    console.log(`   ${idx + 1}. ${r.title} (${r.code || 'N/A'})`);
  });
  
  // Test 4: Full recommendation
  console.log('\n4. Getting recommendations for JS developer profile...');
  const recommendations = await getCareerRecommendations({
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    interests: ['software development'],
    experience: 'web development'
  });
  
  console.log(`\n   Found ${recommendations.length} recommendations:`);
  recommendations.slice(0, 10).forEach((r, idx) => {
    console.log(`   ${idx + 1}. ${r.title} (Match: ${r.matchScore}%, Required Skills: ${r.requiredSkills.length})`);
    console.log(`      Matched: ${r.matchedSkills.length}, Missing: ${r.missingSkills.length}`);
  });
  
  console.log('\n✅ Debug complete');
}

debug().catch(console.error);
