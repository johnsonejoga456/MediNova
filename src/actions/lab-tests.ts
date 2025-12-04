"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { LabTestStatus } from "@prisma/client";

// Permission check helper
async function checkPermissions(allowPatient = false) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    if (!allowPatient && !["ADMIN", "DOCTOR", "NURSE"].includes(session.user.role)) {
        throw new Error("Insufficient permissions");
    }

    return session;
}

// Get all lab tests with filters
export async function getLabTests(params?: {
    patientId?: string;
    doctorId?: string;
    status?: LabTestStatus;
    testType?: string;
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
    if (params?.status) where.status = params.status;
    if (params?.testType) where.testType = params.testType;

    // Date range filter
    if (params?.startDate || params?.endDate) {
        where.orderedDate = {};
        if (params.startDate) where.orderedDate.gte = params.startDate;
        if (params.endDate) where.orderedDate.lte = params.endDate;
    }

    const labTests = await prisma.labTest.findMany({
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
            orderedDate: "desc",
        },
    });

    return labTests;
}

// Get single lab test by ID
export async function getLabTestById(id: string) {
    const session = await checkPermissions(true);

    const labTest = await prisma.labTest.findUnique({
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
                },
            },
        },
    });

    if (!labTest) {
        throw new Error("Lab test not found");
    }

    // Permission check: patients can only view their own tests
    if (session.user.role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });
        if (labTest.patientId !== patient?.id) {
            throw new Error("Unauthorized");
        }
    }

    // Doctors can only view their own patients' tests
    if (session.user.role === "DOCTOR") {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });
        if (labTest.doctorId !== doctor?.id) {
            throw new Error("Unauthorized");
        }
    }

    return labTest;
}

// Order new lab test (Doctor only)
export async function orderLabTest(data: {
    patientId: string;
    testType: string;
    testName: string;
    priority?: "NORMAL" | "URGENT";
    notes?: string;
}) {
    const session = await checkPermissions();

    if (session.user.role !== "DOCTOR" && session.user.role !== "ADMIN") {
        return { error: "Only doctors can order lab tests" };
    }

    try {
        // Get doctor ID
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });

        if (!doctor && session.user.role === "DOCTOR") {
            return { error: "Doctor profile not found" };
        }

        // Create lab test
        const labTest = await prisma.labTest.create({
            data: {
                patientId: data.patientId,
                doctorId: doctor?.id || "", // Admin might not have doctor profile
                testType: data.testType,
                testName: data.testName,
                status: "PENDING",
                notes: data.notes,
                orderedDate: new Date(),
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

        revalidatePath("/dashboard/lab-tests");
        revalidatePath(`/dashboard/patients/${data.patientId}/lab-tests`);

        return { success: true, labTest };
    } catch (error: any) {
        console.error("Error ordering lab test:", error);
        return { error: "Failed to order lab test" };
    }
}

// Update lab test status (Lab staff/Admin)
export async function updateLabTestStatus(
    id: string,
    status: LabTestStatus
) {
    const session = await checkPermissions();

    if (!["ADMIN", "NURSE"].includes(session.user.role)) {
        return { error: "Only lab staff can update test status" };
    }

    try {
        const existing = await prisma.labTest.findUnique({
            where: { id },
        });

        if (!existing) {
            return { error: "Lab test not found" };
        }

        const updated = await prisma.labTest.update({
            where: { id },
            data: {
                status,
                completedDate: status === "COMPLETED" ? new Date() : existing.completedDate,
            },
        });

        revalidatePath("/dashboard/lab-tests");
        revalidatePath(`/dashboard/lab-tests/${id}`);

        return { success: true, labTest: updated };
    } catch (error: any) {
        console.error("Error updating lab test status:", error);
        return { error: "Failed to update test status" };
    }
}

// Add test results (Lab staff/Doctor)
export async function addTestResults(
    id: string,
    data: {
        results: string;
        interpretation?: string;
        referenceRange?: string;
        attachments?: string;
    }
) {
    const session = await checkPermissions();

    if (!["ADMIN", "DOCTOR", "NURSE"].includes(session.user.role)) {
        return { error: "Insufficient permissions" };
    }

    try {
        const existing = await prisma.labTest.findUnique({
            where: { id },
        });

        if (!existing) {
            return { error: "Lab test not found" };
        }

        // Doctor can only update their own tests
        if (session.user.role === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({
                where: { userId: session.user.id },
            });
            if (existing.doctorId !== doctor?.id) {
                return { error: "You can only update results for your own tests" };
            }
        }

        const updated = await prisma.labTest.update({
            where: { id },
            data: {
                results: data.results,
                interpretation: data.interpretation,
                referenceRange: data.referenceRange,
                attachments: data.attachments,
                status: "COMPLETED",
                completedDate: new Date(),
            },
        });

        revalidatePath("/dashboard/lab-tests");
        revalidatePath(`/dashboard/lab-tests/${id}`);

        return { success: true, labTest: updated };
    } catch (error: any) {
        console.error("Error adding test results:", error);
        return { error: "Failed to add test results" };
    }
}

// Cancel lab test (Doctor/Admin)
export async function cancelLabTest(id: string) {
    const session = await checkPermissions();

    if (!["ADMIN", "DOCTOR"].includes(session.user.role)) {
        return { error: "Only doctors or admins can cancel lab tests" };
    }

    try {
        const existing = await prisma.labTest.findUnique({
            where: { id },
        });

        if (!existing) {
            return { error: "Lab test not found" };
        }

        if (existing.status === "COMPLETED") {
            return { error: "Cannot cancel completed test" };
        }

        // Doctor can only cancel their own tests
        if (session.user.role === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({
                where: { userId: session.user.id },
            });
            if (existing.doctorId !== doctor?.id) {
                return { error: "You can only cancel your own tests" };
            }
        }

        const updated = await prisma.labTest.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        revalidatePath("/dashboard/lab-tests");
        revalidatePath(`/dashboard/lab-tests/${id}`);

        return { success: true, labTest: updated };
    } catch (error: any) {
        console.error("Error cancelling lab test:", error);
        return { error: "Failed to cancel lab test" };
    }
}

// Get lab tests by patient
export async function getLabTestsByPatient(patientId: string) {
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

    const labTests = await prisma.labTest.findMany({
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
            orderedDate: "desc",
        },
    });

    return labTests;
}
