/**
 * Database Seed Script - Create Test Users
 * Run this with: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            email: 'admin@test.com',
            password: adminPassword,
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User',
            isActive: true,
        },
    });
    console.log('✅ Admin user created:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123\n');

    // Create doctor user
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctor = await prisma.user.upsert({
        where: { email: 'doctor@test.com' },
        update: {},
        create: {
            email: 'doctor@test.com',
            password: doctorPassword,
            role: 'DOCTOR',
            firstName: 'Dr. John',
            lastName: 'Smith',
            isActive: true,
        },
    });
    console.log('✅ Doctor user created:');
    console.log('   Email: doctor@test.com');
    console.log('   Password: doctor123\n');

    // Create patient user
    const patientPassword = await bcrypt.hash('patient123', 10);
    const patient = await prisma.user.upsert({
        where: { email: 'patient@test.com' },
        update: {},
        create: {
            email: 'patient@test.com',
            password: patientPassword,
            role: 'PATIENT',
            firstName: 'Jane',
            lastName: 'Doe',
            isActive: true,
        },
    });
    console.log('✅ Patient user created:');
    console.log('   Email: patient@test.com');
    console.log('   Password: patient123\n');

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
