"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

export async function globalSearch(query: string) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    if (!query || query.trim().length < 2) {
        return { patients: [], doctors: [], appointments: [], invoices: [], labTests: [] };
    }

    const searchTerm = query.trim();
    const isPatient = session.user.role === "PATIENT";

    // Get user's patient ID if they're a patient
    let patientId: string | undefined;
    if (isPatient) {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });
        patientId = patient?.id;
    }

    const [patients, doctors, appointments, invoices, labTests] = await Promise.all([
        // Patients (not visible to patients)
        isPatient
            ? []
            : prisma.patient.findMany({
                where: {
                    OR: [
                        { user: { firstName: { contains: searchTerm, mode: "insensitive" } } },
                        { user: { lastName: { contains: searchTerm, mode: "insensitive" } } },
                        { user: { email: { contains: searchTerm, mode: "insensitive" } } },
                    ],
                },
                include: { user: { select: { firstName: true, lastName: true, email: true } } },
                take: 5,
            }),

        // Doctors
        prisma.doctor.findMany({
            where: {
                OR: [
                    { user: { firstName: { contains: searchTerm, mode: "insensitive" } } },
                    { user: { lastName: { contains: searchTerm, mode: "insensitive" } } },
                    { specialization: { contains: searchTerm, mode: "insensitive" } },
                ],
            },
            include: { user: { select: { firstName: true, lastName: true, email: true } } },
            take: 5,
        }),

        // Appointments
        prisma.appointment.findMany({
            where: isPatient
                ? { patientId } // Patients see only their appointments
                : {
                    patient: {
                        OR: [
                            { user: { firstName: { contains: searchTerm, mode: "insensitive" } } },
                            { user: { lastName: { contains: searchTerm, mode: "insensitive" } } },
                        ],
                    },
                },
            include: {
                patient: { include: { user: { select: { firstName: true, lastName: true } } } },
                doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
            orderBy: { appointmentDate: "desc" },
            take: 5,
        }),

        // Invoices
        prisma.invoice.findMany({
            where: isPatient
                ? { patientId }
                : {
                    OR: [
                        { invoiceNumber: { contains: searchTerm, mode: "insensitive" } },
                        {
                            patient: {
                                OR: [
                                    { user: { firstName: { contains: searchTerm, mode: "insensitive" } } },
                                    { user: { lastName: { contains: searchTerm, mode: "insensitive" } } },
                                ],
                            },
                        },
                    ],
                },
            include: { patient: { include: { user: { select: { firstName: true, lastName: true } } } } },
            orderBy: { issueDate: "desc" },
            take: 5,
        }),

        // Lab Tests
        prisma.labTest.findMany({
            where: isPatient
                ? { patientId }
                : {
                    OR: [
                        { testName: { contains: searchTerm, mode: "insensitive" } },
                        {
                            patient: {
                                OR: [
                                    { user: { firstName: { contains: searchTerm, mode: "insensitive" } } },
                                    { user: { lastName: { contains: searchTerm, mode: "insensitive" } } },
                                ],
                            },
                        },
                    ],
                },
            include: { patient: { include: { user: { select: { firstName: true, lastName: true } } } } },
            orderBy: { orderedDate: "desc" },
            take: 5,
        }),
    ]);

    return { patients, doctors, appointments, invoices, labTests };
}
