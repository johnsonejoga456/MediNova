"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/auth";
import { Gender } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper to check permissions
async function checkPermissions() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // Only these roles can manage patients
    const allowedRoles = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];
    if (!allowedRoles.includes(session.user.role)) {
        throw new Error("Insufficient permissions");
    }

    return session;
}

// Get all patients with optional search and filters
export async function getPatients(params?: {
    search?: string;
    gender?: Gender;
    bloodType?: string;
}) {
    await checkPermissions();

    const where: any = {};

    // Search by name or email
    if (params?.search) {
        where.user = {
            OR: [
                { firstName: { contains: params.search, mode: "insensitive" } },
                { lastName: { contains: params.search, mode: "insensitive" } },
                { email: { contains: params.search, mode: "insensitive" } },
            ],
        };
    }

    // Filter by gender
    if (params?.gender) {
        where.gender = params.gender;
    }

    // Filter by blood type
    if (params?.bloodType) {
        where.bloodType = params.bloodType;
    }

    const patients = await prisma.patient.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    isActive: true,
                    createdAt: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return patients;
}

// Get single patient by ID
export async function getPatientById(id: string) {
    await checkPermissions();

    const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });

    if (!patient) {
        throw new Error("Patient not found");
    }

    return patient;
}

// Create new patient
export async function createPatient(data: {
    // User fields
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;

    // Patient fields
    dateOfBirth: string;
    gender: Gender;
    bloodType?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country: string;

    // Emergency contact
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;

    // Insurance
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    insuranceGroupNumber?: string;

    // Medical info
    allergies?: string;
    chronicConditions?: string;
    currentMedications?: string;
}) {
    const session = await checkPermissions();

    try {
        // Check if user with email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return { error: "User with this email already exists" };
        }

        // Create user and patient in a transaction
        const patient = await prisma.$transaction(async (tx) => {
            // Create user account for patient
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: "$2a$10$randomhashfortemporarypassword", // Temporary - should send email to set password
                    role: "PATIENT",
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    isActive: true,
                },
            });

            // Create patient profile
            const newPatient = await tx.patient.create({
                data: {
                    userId: user.id,
                    dateOfBirth: new Date(data.dateOfBirth),
                    gender: data.gender,
                    bloodType: data.bloodType,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                    country: data.country,
                    emergencyContactName: data.emergencyContactName,
                    emergencyContactPhone: data.emergencyContactPhone,
                    emergencyContactRelation: data.emergencyContactRelation,
                    insuranceProvider: data.insuranceProvider,
                    insurancePolicyNumber: data.insurancePolicyNumber,
                    insuranceGroupNumber: data.insuranceGroupNumber,
                    allergies: data.allergies,
                    chronicConditions: data.chronicConditions,
                    currentMedications: data.currentMedications,
                },
                include: {
                    user: true,
                },
            });

            return newPatient;
        });

        revalidatePath("/dashboard/patients");
        return { success: true, patient };
    } catch (error) {
        console.error("Error creating patient:", error);
        return { error: "Failed to create patient" };
    }
}

// Update patient
export async function updatePatient(
    id: string,
    data: Partial<{
        // User fields
        firstName: string;
        lastName: string;
        phoneNumber: string;

        // Patient fields
        dateOfBirth: string;
        gender: Gender;
        bloodType: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        emergencyContactName: string;
        emergencyContactPhone: string;
        emergencyContactRelation: string;
        insuranceProvider: string;
        insurancePolicyNumber: string;
        insuranceGroupNumber: string;
        allergies: string;
        chronicConditions: string;
        currentMedications: string;
    }>
) {
    await checkPermissions();

    try {
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!patient) {
            return { error: "Patient not found" };
        }

        // Update in transaction
        const updated = await prisma.$transaction(async (tx) => {
            // Update user fields
            if (data.firstName || data.lastName || data.phoneNumber) {
                await tx.user.update({
                    where: { id: patient.userId },
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        phoneNumber: data.phoneNumber,
                    },
                });
            }

            // Update patient fields
            const updatedPatient = await tx.patient.update({
                where: { id },
                data: {
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                    gender: data.gender,
                    bloodType: data.bloodType,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                    country: data.country,
                    emergencyContactName: data.emergencyContactName,
                    emergencyContactPhone: data.emergencyContactPhone,
                    emergencyContactRelation: data.emergencyContactRelation,
                    insuranceProvider: data.insuranceProvider,
                    insurancePolicyNumber: data.insurancePolicyNumber,
                    insuranceGroupNumber: data.insuranceGroupNumber,
                    allergies: data.allergies,
                    chronicConditions: data.chronicConditions,
                    currentMedications: data.currentMedications,
                },
                include: { user: true },
            });

            return updatedPatient;
        });

        revalidatePath("/dashboard/patients");
        revalidatePath(`/dashboard/patients/${id}`);
        return { success: true, patient: updated };
    } catch (error) {
        console.error("Error updating patient:", error);
        return { error: "Failed to update patient" };
    }
}

// Delete patient (soft delete - set user as inactive)
export async function deletePatient(id: string) {
    const session = await checkPermissions();

    // Only admins can delete
    if (session.user.role !== "ADMIN") {
        return { error: "Only administrators can delete patients" };
    }

    try {
        const patient = await prisma.patient.findUnique({
            where: { id },
        });

        if (!patient) {
            return { error: "Patient not found" };
        }

        // Soft delete by marking user as inactive
        await prisma.user.update({
            where: { id: patient.userId },
            data: { isActive: false },
        });

        revalidatePath("/dashboard/patients");
        return { success: true };
    } catch (error) {
        console.error("Error deleting patient:", error);
        return { error: "Failed to delete patient" };
    }
}
