// Database Connection String Validator
require('dotenv').config({ path: '.env' });

console.log('🔍 Database Connection String Validator\n');

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

console.log('Checking DATABASE_URL...');
if (databaseUrl) {
    console.log('✅ DATABASE_URL is set');

    // Check for common issues
    const hasUnescapedAt = (databaseUrl.match(/@/g) || []).length > 1;
    const hasUnescapedHash = databaseUrl.includes('#');
    const hasUnescapedDollar = databaseUrl.includes('$');
    const hasUnescapedPercent = (databaseUrl.match(/%/g) || []).length > 0 && !databaseUrl.includes('%40');

    if (hasUnescapedAt) {
        console.log('⚠️  Warning: Found multiple @ symbols - password might not be encoded');
    }
    if (hasUnescapedHash) {
        console.log('⚠️  Warning: Found # symbol - should be %23');
    }
    if (hasUnescapedDollar) {
        console.log('⚠️  Warning: Found $ symbol - should be %24');
    }

    // Show sanitized version (hide password)
    const sanitized = databaseUrl.replace(/:([^@]+)@/, ':****@');
    console.log('Format:', sanitized);
} else {
    console.log('❌ DATABASE_URL is not set!');
}

console.log('\nChecking DIRECT_URL...');
if (directUrl) {
    console.log('✅ DIRECT_URL is set');
    const sanitized = directUrl.replace(/:([^@]+)@/, ':****@');
    console.log('Format:', sanitized);
} else {
    console.log('❌ DIRECT_URL is not set!');
}

console.log('\n' + '='.repeat(60));
console.log('💡 Tips:');
console.log('1. Password should only contain: A-Z, a-z, 0-9, _ (underscore)');
console.log('2. OR encode special characters: @ → %40, # → %23, $ → %24');
console.log('3. Connection string format:');
console.log('   postgresql://postgres:PASSWORD@host:port/database');
console.log('='.repeat(60));
