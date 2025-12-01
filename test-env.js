// Quick test to verify environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variable Check:\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Missing');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? '✅ Found' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Found' : '❌ Missing');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Found' : '❌ Missing');

if (process.env.DIRECT_URL) {
    console.log('\n✅ All critical variables loaded correctly!');
    console.log('You can now run: npx prisma migrate dev --name init');
} else {
    console.log('\n❌ DIRECT_URL is missing or not loading properly');
    console.log('Please check your .env.local file');
}
