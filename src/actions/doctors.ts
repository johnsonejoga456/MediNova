"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Permission check helper
async function checkPermissions(adminOnly = false) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const allowedRoles = adminOnly
        ? ["ADMIN"]
        : ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];

    if (!allowedRoles.includes(session.user.role)) {
        throw new Error("Insufficient permissions");
    }

    return session;
}

// Get all doctors with search and filter
export async function getDoctors(params?: {
    search?: string;
    specialization?: string;
}) {
    await checkPermissions();

    const where: any = {
        user: {
            isActive: true,
        },
    };

    // Search by name or email
    if (params?.search) {
        where.OR = [
            {
                user: {
                    firstName: {
                        contains: params.search,
                        mode: "insensitive",
                    },
                },
            },
            {
                user: {
                    lastName: {
                        contains: params.search,
                        mode: "insensitive",
                    },
                },
            },
            {
                user: {
                    email: {
                        contains: params.search,
                        mode: "insensitive",
                    },
                },
            },
            {
                specialization: {
                    contains: params.search,
                    mode: "insensitive",
                },
            },
        ];
    }

    // Filter by specialization
    if (params?.specialization) {
        where.specialization = {
            equals: params.specialization,
            mode: "insensitive",
        };
    }

    const doctors = await prisma.doctor.findMany({
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
                },
            },
            _count: {
                select: {
                    appointments: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return doctors;
}

// Get single doctor by ID
export async function getDoctorById(id: string) {
    await checkPermissions();

    const doctor = await prisma.doctor.findUnique({
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
            _count: {
                select: {
                    appointments: true,
                    medicalRecords: true,
                    prescriptions: true,
                },
            },
        },
    });

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    return doctor;
}

// Create new doctor
export async function createDoctor(data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    specialization: string;
    licenseNumber: string;
    qualification: string;
    experienceYears?: number;
    bio?: string;
}) {
    await checkPermissions(true); // Admin only

    try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return { error: "Email already exists" };
        }

        // Check if license number already exists
        const existingLicense = await prisma.doctor.findUnique({
            where: { licenseNumber: data.licenseNumber },
        });

        if (existingLicense) {
            return { error: "License number already exists" };
        }

        // Generate temporary password
        const tempPassword = `Doctor${Math.random().toString(36).slice(-8)}!`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create user and doctor in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    role: "DOCTOR",
                },
            });

            // Create doctor profile
            const doctor = await tx.doctor.create({
                data: {
                    userId: user.id,
                    specialization: data.specialization,
                    licenseNumber: data.licenseNumber,
                    qualification: data.qualification,
                    experienceYears: data.experienceYears || 0,
                    bio: data.bio,
                },
            });

            return { user, doctor };
        });

        revalidatePath("/dashboard/doctors");

        return {
            success: true,
            tempPassword, // In production, this would be emailed to the doctor
            doctor: result.doctor
        };
    } catch (error: any) {
        console.error("Error creating doctor:", error);
        return { error: "Failed to create doctor" };
    }
}

// Update doctor
export async function updateDoctor(
    id: string,
    data: {
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        specialization: string;
        licenseNumber: string;
        qualification: string;
        experienceYears?: number;
        bio?: string;
    }
) {
    await checkPermissions(true); // Admin only

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!doctor) {
            return { error: "Doctor not found" };
        }

        // Check if license number is taken by another doctor
        if (data.licenseNumber !== doctor.licenseNumber) {
            const existingLicense = await prisma.doctor.findUnique({
                where: { licenseNumber: data.licenseNumber },
            });

            if (existingLicense && existingLicense.id !== id) {
                return { error: "License number already exists" };
            }
        }

        // Update user and doctor in a transaction
        await prisma.$transaction(async (tx) => {
            // Update user
            await tx.user.update({
                where: { id: doctor.userId },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                },
            });

            // Update doctor
            await tx.doctor.update({
                where: { id },
                data: {
                    specialization: data.specialization,
                    licenseNumber: data.licenseNumber,
                    qualification: data.qualification,
                    experienceYears: data.experienceYears,
                    bio: data.bio,
                },
            });
        });

        revalidatePath("/dashboard/doctors");
        revalidatePath(`/dashboard/doctors/${id}`);

        return { success: true };
    } catch (error: any) {
        console.error("Error updating doctor:", error);
        return { error: "Failed to update doctor" };
    }
}

// Delete doctor (soft delete)
export async function deleteDoctor(id: string) {
    await checkPermissions(true); // Admin only

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!doctor) {
            return { error: "Doctor not found" };
        }

        // Soft delete by setting user as inactive
        await prisma.user.update({
            where: { id: doctor.userId },
            data: { isActive: false },
        });

        revalidatePath("/dashboard/doctors");

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting doctor:", error);
        return { error: "Failed to delete doctor" };
    }
}

// Get all unique specializations (for filter dropdown)
export async function getSpecializations() {
    await checkPermissions();

    const doctors = await prisma.doctor.findMany({
        select: {
            specialization: true,
        },
        distinct: ["specialization"],
        orderBy: {
            specialization: "asc",
        },
    });

    return doctors.map((d) => d.specialization);
}
