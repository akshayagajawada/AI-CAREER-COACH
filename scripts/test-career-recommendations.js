/**
 * Test script for Career Recommendations Feature
 * Run this to verify the O*NET integration is working correctly
 * 
 * Usage: node scripts/test-career-recommendations.js
 */

// Load environment variables
require('dotenv').config();

// Simple fetch polyfill for Node.js if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

const ONET_API_BASE = 'https://services.onetcenter.org/ws';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testOnetConnection() {
  log('\n🔧 Testing O*NET API Connection...', colors.blue);
  
  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;

  if (!username || !password) {
    log('❌ FAILED: O*NET credentials not found!', colors.red);
    log('Please set ONET_USERNAME and ONET_PASSWORD in your .env file', colors.yellow);
    log('Get credentials at: https://services.onetcenter.org/', colors.yellow);
    return false;
  }

  log(`Using username: ${username}`, colors.reset);

  try {
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const response = await fetch(`${ONET_API_BASE}/online/search?keyword=software`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      log(`❌ FAILED: API returned status ${response.status}`, colors.red);
      if (response.status === 401) {
        log('Invalid credentials. Please check your ONET_USERNAME and ONET_PASSWORD', colors.yellow);
      }
      return false;
    }

    const data = await response.json();
    log('✅ SUCCESS: O*NET API connection working!', colors.green);
    log(`Found ${data.occupation?.length || 0} software-related careers`, colors.reset);
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, colors.red);
    return false;
  }
}

async function testCareerSearch() {
  log('\n🔍 Testing Career Search...', colors.blue);

  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;
  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const response = await fetch(`${ONET_API_BASE}/online/search?keyword=developer`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    const careers = data.occupation || [];

    log(`✅ Found ${careers.length} developer careers`, colors.green);
    
    if (careers.length > 0) {
      log('\nSample careers:', colors.reset);
      careers.slice(0, 5).forEach((career, idx) => {
        log(`${idx + 1}. ${career.title} (${career.code})`, colors.reset);
      });
    }

    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, colors.red);
    return false;
  }
}

async function testCareerDetails() {
  log('\n📋 Testing Career Details Retrieval...', colors.blue);

  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;
  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  // Test with a common O*NET code (Software Developers)
  const testCode = '15-1252.00';

  try {
    const response = await fetch(`${ONET_API_BASE}/online/occupations/${testCode}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    
    log(`✅ Retrieved details for: ${data.title}`, colors.green);
    log(`Description: ${data.description?.substring(0, 100)}...`, colors.reset);
    
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, colors.red);
    return false;
  }
}

async function testSkillsRetrieval() {
  log('\n🎯 Testing Skills Retrieval...', colors.blue);

  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;
  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  const testCode = '15-1252.00';

  try {
    const response = await fetch(`${ONET_API_BASE}/online/occupations/${testCode}/skills`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    const skills = data.skill || [];
    
    log(`✅ Retrieved ${skills.length} skills`, colors.green);
    
    if (skills.length > 0) {
      log('\nTop 5 skills:', colors.reset);
      skills.slice(0, 5).forEach((skill, idx) => {
        log(`${idx + 1}. ${skill.element_name || skill.name}`, colors.reset);
      });
    }
    
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, colors.red);
    return false;
  }
}

async function runAllTests() {
  log('═══════════════════════════════════════════════', colors.blue);
  log('  Career Recommendations Feature - Test Suite  ', colors.blue);
  log('═══════════════════════════════════════════════', colors.blue);

  const tests = [
    { name: 'O*NET Connection', fn: testOnetConnection },
    { name: 'Career Search', fn: testCareerSearch },
    { name: 'Career Details', fn: testCareerDetails },
    { name: 'Skills Retrieval', fn: testSkillsRetrieval },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      log(`\n❌ Test "${test.name}" crashed: ${error.message}`, colors.red);
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  log('\n═══════════════════════════════════════════════', colors.blue);
  log('  Test Summary  ', colors.blue);
  log('═══════════════════════════════════════════════', colors.blue);

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? colors.green : colors.red;
    log(`${icon} ${result.name}`, color);
  });

  log(`\n${passed}/${total} tests passed`, passed === total ? colors.green : colors.yellow);

  if (passed === total) {
    log('\n🎉 All tests passed! Your O*NET integration is working correctly.', colors.green);
    log('You can now use the Career Recommendations feature in the app.', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', colors.yellow);
    log('Make sure your O*NET credentials are correct in the .env file.', colors.yellow);
  }

  log('\n');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
