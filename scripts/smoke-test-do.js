/**
 * Smoke Test Script for DigitalOcean App Platform Deployment
 * Run after deployment to verify frontend functionality
 */

const https = require('https');
const http = require('http');

// Configuration - update with your DO domain
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://content-repurposing-engine.ondigitalocean.app';

let passed = 0;
let failed = 0;
const results = [];

function test(name, url, expectedStatus = 200) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const startTime = Date.now();

        protocol.get(url, (res) => {
            const duration = Date.now() - startTime;
            let data = '';

            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const ok = res.statusCode === expectedStatus;
                if (ok) {
                    passed++;
                    results.push(`  PASS: ${name} (${res.statusCode}, ${duration}ms)`);
                } else {
                    failed++;
                    results.push(`  FAIL: ${name} (expected ${expectedStatus}, got ${res.statusCode}, ${duration}ms)`);
                }
                resolve();
            });
        }).on('error', (err) => {
            failed++;
            results.push(`  FAIL: ${name} (${err.message})`);
            resolve();
        });
    });
}

async function runSmokeTests() {
    console.log('\n========================================');
    console.log('Content Repurposing Engine - Smoke Tests');
    console.log(`Target: ${APP_URL}`);
    console.log('========================================\n');

    // Test 1: Homepage loads
    await test('Homepage (200)', APP_URL, 200);

    // Test 2: Dashboard page
    await test('Dashboard page (200)', `${APP_URL}/dashboard/`, 200);

    // Test 3: Success page
    await test('Success page (200)', `${APP_URL}/success/`, 200);

    // Test 4: Cancel page
    await test('Cancel page (200)', `${APP_URL}/cancel/`, 200);

    // Test 5: 404 handling
    await test('404 page (404)', `${APP_URL}/nonexistent-page/`, 404);

    // Print results
    console.log('\nResults:');
    results.forEach(r => console.log(r));

    console.log(`\n========================================`);
    console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('========================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runSmokeTests().catch(err => {
    console.error('Smoke test runner error:', err.message);
    process.exit(1);
});
