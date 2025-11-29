/**
 * 🔧 Prisma Client Singleton
 * 
 * This file creates a single instance of Prisma Client that's reused across your app.
 * 
 * WHY IS THIS IMPORTANT?
 * - In development, Next.js hot-reloads code frequently
 * - Without this pattern, you'd create a new database connection on every reload
 * - Too many connections = database errors!
 * 
 * This singleton pattern ensures only ONE Prisma Client instance exists.
 */

import { PrismaClient } from '@prisma/client'

// Extend the global namespace to include prisma
// This prevents TypeScript errors
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Create Prisma Client with logging
 * 
 * Log levels explained:
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

/**
 * In development: Reuse existing client or create new one
 * In production: Always create new client
 * 
 * The global.prisma trick prevents multiple instances in dev mode
 */
const prisma = global.prisma ?? prismaClientSingleton()

// In development, save to global to survive hot-reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma

/**
 * 📖 HOW TO USE THIS:
 * 
 * In any file where you need database access:
 * 
 * import prisma from '@/lib/db/prisma'
 * 
 * // Find a user by email
 * const user = await prisma.user.findUnique({
 *   where: { email: 'doctor@hospital.com' }
 * })
 * 
 * // Create a new patient
 * const patient = await prisma.patient.create({
 *   data: {
 *     userId: user.id,
 *     dateOfBirth: new Date('1990-01-01'),
 *     gender: 'MALE',
 *     country: 'USA'
 *   }
 * })
 * 
 * // Update appointment status
 * const appointment = await prisma.appointment.update({
 *   where: { id: appointmentId },
 *   data: { status: 'COMPLETED' }
 * })
 * 
 * 🎯 TypeScript Magic:
 * After running `npx prisma generate`, you get full autocomplete!
 * Try typing `prisma.` and see all your models pop up!
 */
