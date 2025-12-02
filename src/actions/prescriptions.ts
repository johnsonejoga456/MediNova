"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

// Permission check helper
async function checkPermissions(allowPatient = false) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    if (!allowPatient && !["ADMIN", "DOCTOR"].includes(session.user.role)) {
        throw new Error("Insufficient permissions");
    }

    return session;
}

// Get all prescriptions with filters
export async function getPrescriptions(params?: {
    patientId?: string;
    doctorId?: string;
    isActive?: boolean;
}) {
    const session = await checkPermissions(true);

    const where: any = {};

    // Role-based filtering
    if (session.user.role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });
        if (!patient) throw new Error("Patient profile not found");
        where.patientId = patient.id;
    } else if (session.user.role === "DOCTOR") {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });
        if (!doctor) throw new Error("Doctor profile not found");
        where.doctorId = doctor.id;
    }

    // Apply filters
    if (params?.patientId) where.patientId = params.patientId;
    if (params?.doctorId) where.doctorId = params.doctorId;
    if (params?.isActive !== undefined) where.isActive = params.isActive;

    const prescriptions = await prisma.prescription.findMany({
        where,
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            doctor: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            prescribedDate: "desc",
        },
    });

    return prescriptions;
}

// Get single prescription by ID
export async function getPrescriptionById(id: string) {
    const session = await checkPermissions(true);

    const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
                },
            },
            doctor: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    specialization: true,
                },
            },
        },
    });

    if (!prescription) {
        throw new Error("Prescription not found");
    }

    // Permission check: patients can only view their own
    if (session.user.role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });
        if (prescription.patientId !== patient?.id) {
            throw new Error("Unauthorized");
        }
    }

    // Doctors can only view their own
    if (session.user.role === "DOCTOR") {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });
        if (prescription.doctorId !== doctor?.id) {
            throw new Error("Unauthorized");
        }
    }

    return prescription;
}

// Get prescriptions by patient
export async function getPrescriptionsByPatient(patientId: string) {
    const session = await checkPermissions(true);

    // Permission check for patients
    if (session.user.role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });
        if (patient?.id !== patientId) {
            throw new Error("Unauthorized");
        }
    }

    const prescriptions = await prisma.prescription.findMany({
        where: { patientId },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            prescribedDate: "desc",
        },
    });

    return prescriptions;
}

// Create new prescription
export async function createPrescription(data: {
    patientId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
    refills: number;
    startDate: Date;
    endDate?: Date;
}) {
    const session = await checkPermissions();

    try {
        // Get doctor ID
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });

        if (!doctor) {
            return { error: "Doctor profile not found" };
        }

        // Validate dates
        if (data.startDate < new Date()) {
            return { error: "Start date cannot be in the past" };
        }

        // Create prescription
        const prescription = await prisma.prescription.create({
            data: {
                patientId: data.patientId,
                doctorId: doctor.id,
                medicationName: data.medicationName,
                dosage: data.dosage,
                frequency: data.frequency,
                duration: data.duration,
                quantity: data.quantity,
                instructions: data.instructions,
                refills: data.refills,
                refillsRemaining: data.refills,
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: true,
            },
            include: {
                patient: {
                    include: {
                        user: true,
                    },
                },
                doctor: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        revalidatePath("/dashboard/prescriptions");
        revalidatePath(`/dashboard/patients/${data.patientId}/prescriptions`);

        return { success: true, prescription };
    } catch (error: any) {
        console.error("Error creating prescription:", error);
        return { error: "Failed to create prescription" };
    }
}

// Update prescription
export async function updatePrescription(
    id: string,
    data: {
        medicationName?: string;
        dosage?: string;
        frequency?: string;
        duration?: string;
        quantity?: number;
        instructions?: string;
        refills?: number;
        startDate?: Date;
        endDate?: Date;
    }
) {
    const session = await checkPermissions();

    try {
        const existing = await prisma.prescription.findUnique({
            where: { id },
        });

        if (!existing) {
            return { error: "Prescription not found" };
        }

        // Only the creator or admin can update
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });

        if (session.user.role !== "ADMIN" && existing.doctorId !== doctor?.id) {
            return { error: "Unauthorized - only the creator can update this prescription" };
        }

        const updated = await prisma.prescription.update({
            where: { id },
            data,
        });

        revalidatePath("/dashboard/prescriptions");
        revalidatePath(`/dashboard/prescriptions/${id}`);
        revalidatePath(`/dashboard/patients/${existing.patientId}/prescriptions`);

        return { success: true, prescription: updated };
    } catch (error: any) {
        console.error("Error updating prescription:", error);
        return { error: "Failed to update prescription" };
    }
}

// Cancel prescription
export async function cancelPrescription(id: string) {
    const session = await checkPermissions();

    try {
        const existing = await prisma.prescription.findUnique({
            where: { id },
        });

        if (!existing) {
            return { error: "Prescription not found" };
        }

        // Only the creator or admin can cancel
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });

        if (session.user.role !== "ADMIN" && existing.doctorId !== doctor?.id) {
            return { error: "Unauthorized" };
        }

        const updated = await prisma.prescription.update({
            where: { id },
            data: { isActive: false },
        });

        revalidatePath("/dashboard/prescriptions");
        revalidatePath(`/dashboard/prescriptions/${id}`);

        return { success: true, prescription: updated };
    } catch (error: any) {
        console.error("Error cancelling prescription:", error);
        return { error: "Failed to cancel prescription" };
    }
}

// Request refill (patient)
export async function requestRefill(id: string) {
    const session = await checkPermissions(true);

    try {
        const prescription = await prisma.prescription.findUnique({
            where: { id },
        });

        if (!prescription) {
            return { error: "Prescription not found" };
        }

        // Check patient owns this prescription
        if (session.user.role === "PATIENT") {
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
            });
            if (prescription.patientId !== patient?.id) {
                return { error: "Unauthorized" };
            }
        }

        // Check if prescription is active
        if (!prescription.isActive) {
            return { error: "Prescription is not active" };
        }

        // Check if refills are available
        if (prescription.refillsRemaining <= 0) {
            return { error: "No refills remaining. Please contact your doctor." };
        }

        // Decrease refills remaining
        const updated = await prisma.prescription.update({
            where: { id },
            data: {
                refillsRemaining: prescription.refillsRemaining - 1,
            },
        });

        revalidatePath("/dashboard/prescriptions");
        revalidatePath(`/dashboard/prescriptions/${id}`);

        return { success: true, prescription: updated, message: "Refill requested successfully" };
    } catch (error: any) {
        console.error("Error requesting refill:", error);
        return { error: "Failed to request refill" };
    }
}

// Check for expired prescriptions (utility)
export async function checkExpiredPrescriptions() {
    const today = new Date();

    try {
        const expired = await prisma.prescription.updateMany({
            where: {
                isActive: true,
                endDate: {
                    lt: today,
                },
            },
            data: {
                isActive: false,
            },
        });

        return { expired: expired.count };
    } catch (error) {
        console.error("Error checking expired prescriptions:", error);
        return { error: "Failed to check expired prescriptions" };
    }
}
