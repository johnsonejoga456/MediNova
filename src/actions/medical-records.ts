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

// Get all medical records with filters
export async function getMedicalRecords(params?: {
    patientId?: string;
    doctorId?: string;
    startDate?: Date;
    endDate?: Date;
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

    // Date range filter
    if (params?.startDate || params?.endDate) {
        where.visitDate = {};
        if (params.startDate) where.visitDate.gte = params.startDate;
        if (params.endDate) where.visitDate.lte = params.endDate;
    }
    visitDate: "desc",
        },
    });

return records;
}

// Get single medical record by ID
export async function getMedicalRecordById(id: string) {
    const session = await checkPermissions(true);

    const record = await prisma.medicalRecord.findUnique({
        where: { id },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            dateOfBirth: true,
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

    if (!record) {
        throw new Error("Medical record not found");
    }

    // Permission check: patients can only view their own
    if (session.user.role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });
        if (record.patientId !== patient?.id) {
            throw new Error("Unauthorized");
        }
    }

    // Doctors can only view their own
    if (session.user.role === "DOCTOR") {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });
        if (record.doctorId !== doctor?.id) {
            throw new Error("Unauthorized");
        }
    }

    return record;
}

// Get medical records by patient (medical history)
export async function getRecordsByPatient(patientId: string) {
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

    const records = await prisma.medicalRecord.findMany({
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
            visitDate: "desc",
        },
    });

    return records;
}

// Create new medical record
export async function createMedicalRecord(data: {
    patientId: string;
    visitDate: Date;
    diagnosis: string;
    symptoms: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    vitalSigns?: string; // JSON
    attachments?: string; // JSON
    followUpDate?: Date;
    followUpNotes?: string;
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

        // Create medical record
        const record = await prisma.medicalRecord.create({
            data: {
                patientId: data.patientId,
                doctorId: doctor.id,
                visitDate: data.visitDate,
                diagnosis: data.diagnosis,
                symptoms: data.symptoms,
                subjective: data.subjective,
                objective: data.objective,
                assessment: data.assessment,
                plan: data.plan,
                vitalSigns: data.vitalSigns,
                attachments: data.attachments,
                followUpDate: data.followUpDate,
                followUpNotes: data.followUpNotes,
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

        revalidatePath("/dashboard/medical-records");
        revalidatePath(`/dashboard/patients/${data.patientId}/medical-history`);

        return { success: true, record };
    } catch (error: any) {
        console.error("Error creating medical record:", error);
        return { error: "Failed to create medical record" };
    }
}

// Update medical record
export async function updateMedicalRecord(
    id: string,
    data: {
        diagnosis?: string;
        symptoms?: string;
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
        vitalSigns?: string;
        attachments?: string;
        followUpDate?: Date;
        followUpNotes?: string;
    }
) {
    const session = await checkPermissions();

    try {
        const existing = await prisma.medicalRecord.findUnique({
            where: { id },
        });

        if (!existing) {
            return { error: "Medical record not found" };
        }

        // Only the creator or admin can update
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });

        if (session.user.role !== "ADMIN" && existing.doctorId !== doctor?.id) {
            return { error: "Unauthorized - only the creator can update this record" };
        }

        const updated = await prisma.medicalRecord.update({
            where: { id },
            data,
        });

        revalidatePath("/dashboard/medical-records");
        revalidatePath(`/dashboard/medical-records/${id}`);
        revalidatePath(`/dashboard/patients/${existing.patientId}/medical-history`);

        return { success: true, record: updated };
    } catch (error: any) {
        console.error("Error updating medical record:", error);
        return { error: "Failed to update medical record" };
    }
}

// Delete medical record (admin only)
export async function deleteMedicalRecord(id: string) {
    const session = await checkPermissions();

    if (session.user.role !== "ADMIN") {
        return { error: "Only administrators can delete medical records" };
    }

    try {
        const record = await prisma.medicalRecord.findUnique({
            where: { id },
        });

        if (!record) {
            return { error: "Medical record not found" };
        }

        await prisma.medicalRecord.delete({
            where: { id },
        });

        revalidatePath("/dashboard/medical-records");
        revalidatePath(`/dashboard/patients/${record.patientId}/medical-history`);

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting medical record:", error);
        return { error: "Failed to delete medical record" };
    }
}
