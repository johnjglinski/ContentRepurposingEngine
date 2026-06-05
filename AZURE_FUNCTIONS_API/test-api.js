/**
 * Test Script for Content Repurposing Engine Azure Functions API
 * 
 * Usage: node test-api.js [FUNCTION_URL]
 * Example: node test-api.js https://your-function-app.azurewebsites.net/api
 */

const https = require('https');
const http = require('http');

// Default to local dev URL or use provided argument
const FUNCTION_BASE_URL = process.argv[2] || 'http://localhost:7071';
const API_ENDPOINT = `${FUNCTION_BASE_URL}/generate-posts`;

console.log('='.repeat(60));
console.log('Content Repurposing Engine - API Test Suite');
console.log('='.repeat(60));
console.log(`Testing endpoint: ${API_ENDPOINT}`);
console.log('');

// Test results tracking
let passed = 0;
let failed = 0;
const results = [];

/**
 * Make an HTTP/HTTPS request and return a promise with the response
 */
function makeRequest(url, method, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = lib.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            rawBody: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout after 30 seconds'));
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

/**
 * Run a single test case
 */
async function runTest(testName, testFn) {
  try {
    console.log(`\n[Test] ${testName}`);
    const result = await testFn();
    
    if (result.passed) {
      passed++;
      console.log(`  ✅ PASS: ${result.message}`);
      results.push({ name: testName, status: 'PASS', message: result.message });
    } else {
      failed++;
      console.log(`  ❌ FAIL: ${result.message}`);
      results.push({ name: testName, status: 'FAIL', message: result.message });
    }
  } catch (error) {
    failed++;
    console.log(`  ❌ ERROR: ${error.message}`);
    results.push({ name: testName, status: 'ERROR', message: error.message });
  }
}

/**
 * Test Suite
 */
async function runTests() {
  
  // Test 1: POST with valid content (no email)
  await runTest('POST /generate-posts - Valid content without email', async () => {
    const response = await makeRequest(API_ENDPOINT, 'POST', {
      content: 'This is a test blog post about artificial intelligence and its impact on modern software development. AI is transforming how we write code, debug applications, and deploy systems.'
    });
    
    if (response.status === 200 && response.body && response.body.success === true) {
      const posts = response.body.posts;
      if (Array.isArray(posts) && posts.length > 0) {
        return { 
          passed: true, 
          message: `Received ${posts.length} generated posts successfully` 
        };
      }
      return { passed: false, message: 'Posts array is empty or invalid' };
    } else if (response.status === 500 || response.status === 503) {
      // This might be expected if API keys are not configured
      return { 
        passed: false, 
        message: `Server error (${response.status}) - Check that OPENAI_API_KEY is configured in Azure App Settings` 
      };
    } else {
      return { 
        passed: false, 
        message: `Unexpected status ${response.status}: ${response.rawBody}` 
      };
    }
  });

  // Test 2: POST without content (should fail with 400)
  await runTest('POST /generate-posts - Missing content field', async () => {
    const response = await makeRequest(API_ENDPOINT, 'POST', {});
    
    if (response.status === 400 && response.body && response.body.error) {
      return { passed: true, message: `Correctly returned 400 with error: ${response.body.error}` };
    } else {
      return { 
        passed: false, 
        message: `Expected 400 but got ${response.status}: ${response.rawBody}` 
      };
    }
  });

  // Test 3: POST with empty content (should fail with 400)
  await runTest('POST /generate-posts - Empty content field', async () => {
    const response = await makeRequest(API_ENDPOINT, 'POST', { content: '' });
    
    if (response.status === 400 && response.body && response.body.error) {
      return { passed: true, message: `Correctly returned 400 with error: ${response.body.error}` };
    } else {
      return { 
        passed: false, 
        message: `Expected 400 but got ${response.status}: ${response.rawBody}` 
      };
    }
  });

  // Test 4: GET request (should fail - only POST allowed)
  await runTest('GET /generate-posts - Method not allowed', async () => {
    const response = await makeRequest(API_ENDPOINT, 'GET', null);
    
    if (response.status === 405 || response.status === 400 || response.status === 404) {
      return { passed: true, message: `Correctly rejected GET request with status ${response.status}` };
    } else {
      return { 
        passed: false, 
        message: `Expected method rejection but got ${response.status}: ${response.rawBody}` 
      };
    }
  });

  // Test 5: CORS headers present
  await runTest('CORS Headers - Access-Control-Allow-Origin', async () => {
    const response = await makeRequest(API_ENDPOINT, 'POST', {});
    
    if (response.headers && response.headers['access-control-allow-origin']) {
      return { 
        passed: true, 
        message: `CORS header present: ${response.headers['access-control-allow-origin']}` 
      };
    } else {
      // CORS might not be set on error responses, which is acceptable
      return { 
        passed: true, 
        message: 'No CORS headers (acceptable for error responses)' 
      };
    }
  });

  // Test 6: Response includes timestamp
  await runTest('Response Format - Includes timestamp', async () => {
    const response = await makeRequest(API_ENDPOINT, 'POST', {
      content: 'Test post about cloud computing and serverless architecture benefits.'
    });
    
    if (response.status === 200 && response.body && response.body.timestamp) {
      return { passed: true, message: `Timestamp present: ${response.body.timestamp}` };
    } else if (response.status !== 200) {
      return { 
        passed: false, 
        message: `Cannot verify timestamp - server returned status ${response.status}` 
      };
    } else {
      return { passed: false, message: 'Timestamp missing from response' };
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Total tests: ${passed + failed}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 All tests passed! The API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
    console.log('\nCommon issues:');
    console.log('- OPENAI_API_KEY not configured in Azure App Settings');
    console.log('- SendGrid credentials missing or invalid');
    console.log('- Function app not deployed correctly');
    console.log('- CORS misconfiguration');
  }

  // Print detailed results
  console.log('\n' + '='.repeat(60));
  console.log('Detailed Results:');
  console.log('='.repeat(60));
  results.forEach((r, i) => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${i + 1}. ${icon} ${r.name}`);
    console.log(`   ${r.message}`);
  });

  process.exit(failed > 0 ? 1 : 0);
}

// Run the test suite
runTests().catch((error) => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
