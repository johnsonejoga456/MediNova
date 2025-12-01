/**
 * 🔧 Prisma Client Singleton
 * * This file creates a single instance of Prisma Client that's reused across your app.
 * * WHY IS THIS IMPORTANT?
 * - In development, Next.js hot-reloads code frequently
 * - Without this pattern, you'd create a new database connection on every reload
 * - Too many connections = database errors!
 * * This singleton pattern ensures only ONE Prisma Client instance exists.
 */

import { PrismaClient } from '@prisma/client'

/**
 * Create Prisma Client with logging
 * * Log levels explained:
 * - query: Shows actual SQL queries (useful for learning/debugging)
 * - error: Shows database errors
 * - warn: Shows warnings
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']  // Verbose logging in development
      : ['error'],                   // Only errors in production
  })
}

// 1. Create a typed object for the global scope
// We use 'globalThis' which is the modern standard, replacing the old 'global'
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

/**
 * In development: Reuse existing client or create new one
 * In production: Always create new client
 * * The globalForPrisma.prisma trick prevents multiple instances in dev mode
 */
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// In development, save to globalThis to survive hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

/**
 * 📖 HOW TO USE THIS:
 * * In any file where you need database access:
 * * import prisma from '@/lib/db/prisma'
 * * // Find a user by email
 * const user = await prisma.user.findUnique({
 * where: { email: 'doctor@hospital.com' }
 * })
 * * // Create a new patient
 * const patient = await prisma.patient.create({
 * data: {
 * userId: user.id,
 * dateOfBirth: new Date('1990-01-01'),
 * gender: 'MALE',
 * country: 'USA'
 * }
 * })
 * * // Update appointment status
 * const appointment = await prisma.appointment.update({
 * where: { id: appointmentId },
 * data: { status: 'COMPLETED' }
 * })
 * * 🎯 TypeScript Magic:
 * After running `npx prisma generate`, you get full autocomplete!
 * Try typing `prisma.` and see all your models pop up!
 */