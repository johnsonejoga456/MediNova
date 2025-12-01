// Test database connection
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Testing database connection...\n');

    try {
        // Test connection
        await prisma.$connect();
        console.log('✅ Database connected successfully!\n');

        // Check if users table exists
        const userCount = await prisma.user.count();
        console.log(`📊 Found ${userCount} user(s) in database\n`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    firstName: true,
                    lastName: true,
                },
            });
            console.log('Existing users:');
            users.forEach((user) => {
                console.log(`  - ${user.email} (${user.role})`);
            });
        } else {
            console.log('⚠️  No users found. Run: node prisma/seed.js to create test users');
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('\nDebug info:');
        console.error('Error code:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

main();
