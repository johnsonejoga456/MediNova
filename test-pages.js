/**
 * Quick Test Script - Test Auth Pages
 * This script tests if your auth pages are accessible
 */

console.log('🔍 Healthcare System - Auth Pages Test\n');
console.log('='.repeat(60));

console.log('\n📍 Your auth pages should be accessible at:');
console.log('   Login:    http://localhost:3000/auth/login');
console.log('   Register: http://localhost:3000/auth/register');

console.log('\n📁 File structure check:');
const fs = require('fs');
const path = require('path');

const loginPage = path.join(__dirname, 'app', 'auth', 'login', 'page.tsx');
const registerPage = path.join(__dirname, 'app', 'auth', 'register', 'page.tsx');

if (fs.existsSync(loginPage)) {
    console.log('   ✅ Login page exists at: app/auth/login/page.tsx');
} else {
    console.log('   ❌ Login page NOT FOUND');
}

if (fs.existsSync(registerPage)) {
    console.log('   ✅ Register page exists at: app/auth/register/page.tsx');
} else {
    console.log('   ❌ Register page NOT FOUND');
}

console.log('\n🚀 Dev Server Status:');
const { exec } = require('child_process');

exec('netstat -ano | findstr :3000', (error, stdout) => {
    if (stdout) {
        console.log('   ✅ Dev server is running on port 3000');
        console.log('   📱 Open your browser and navigate to:');
        console.log('      http://localhost:3000/auth/login');
    } else {
        console.log('   ❌ No server running on port 3000');
        console.log('   📝 Start the dev server with: npm run dev');
    }
});

console.log('\n💡 TROUBLESHOOTING:');
console.log('   1. Make sure dev server is running (npm run dev)');
console.log('   2. Try http://localhost:3000 first (home page)');
console.log('   3. Then navigate to http://localhost:3000/auth/login');
console.log('   4. Clear browser cache if pages don\'t load');
console.log('   5. Check browser console for JavaScript errors');

console.log('\n' + '='.repeat(60));
