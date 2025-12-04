"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { BillingStatus } from "@prisma/client";

// Permission check helper
async function checkPermissions(allowPatient = false) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    if (!allowPatient && !["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
        throw new Error("Insufficient permissions");
    }

    return session;
}

// Generate unique invoice number
function generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `INV-${year}${month}-${random}`;
}

// Calculate invoice status based on payment
function calculateInvoiceStatus(amount: number, amountPaid: number): BillingStatus {
    if (amountPaid >= amount) return "PAID";
    if (amountPaid > 0) return "PARTIALLY_PAID";
    return "PENDING";
}

// Get all invoices with filters
export async function getInvoices(params?: {
    patientId?: string;
    status?: BillingStatus;
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
    }

    // Apply filters
    if (params?.patientId) where.patientId = params.patientId;
    if (params?.status) where.status = params.status;

    // Date range filter
    if (params?.startDate || params?.endDate) {
        where.issueDate = {};
        if (params.startDate) where.issueDate.gte = params.startDate;
        if (params.endDate) where.issueDate.lte = params.endDate;
    }

    const invoices = await prisma.invoice.findMany({
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
            payments: true,
        },
        orderBy: {
            issueDate: "desc",
        },
    });

    return invoices;
}

// Get single invoice by ID
export async function getInvoiceById(id: string) {
    const session = await checkPermissions(true);

    const invoice = await prisma.invoice.findUnique({
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
            payments: {
                orderBy: {
                    paymentDate: "desc",
                },
            },
        },
    });

    if (!invoice) {
        throw new Error("Invoice not found");
    }

    // Permission check: patients can only view their own invoices
    if (session.user.role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });
        if (invoice.patientId !== patient?.id) {
            throw new Error("Unauthorized");
        }
    }

    return invoice;
}

// Create new invoice (Admin/Receptionist only)
export async function createInvoice(data: {
    patientId: string;
    amount: number;
    dueDate: Date;
    description: string;
    items: string; // JSON string of line items
    notes?: string;
}) {
    const session = await checkPermissions();

    if (!["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
        return { error: "Only admin or receptionist can create invoices" };
    }

    try {
        const invoiceNumber = generateInvoiceNumber();

        const invoice = await prisma.invoice.create({
            data: {
                patientId: data.patientId,
                invoiceNumber,
                amount: data.amount,
                amountPaid: 0,
                status: "PENDING",
                issueDate: new Date(),
                dueDate: data.dueDate,
                description: data.description,
                items: data.items,
                notes: data.notes,
            },
            include: {
                patient: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        revalidatePath("/dashboard/billing/invoices");
        revalidatePath(`/dashboard/patients/${data.patientId}`);

        return { success: true, invoice };
    } catch (error: any) {
        console.error("Error creating invoice:", error);
        return { error: "Failed to create invoice" };
    }
}

// Update invoice
export async function updateInvoice(
    id: string,
    data: {
        amount?: number;
        dueDate?: Date;
        description?: string;
        items?: string;
        notes?: string;
    }
) {
    const session = await checkPermissions();

    if (!["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
        return { error: "Only admin or receptionist can update invoices" };
    }

    try {
        const existing = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!existing) {
            return { error: "Invoice not found" };
        }

        if (existing.status === "PAID") {
            return { error: "Cannot update paid invoice" };
        }

        // Recalculate status if amount changed
        const newAmount = data.amount ?? existing.amount;
        const newStatus = calculateInvoiceStatus(newAmount, existing.amountPaid);

        const updated = await prisma.invoice.update({
            where: { id },
            data: {
                ...data,
                status: newStatus,
            },
        });

        revalidatePath("/dashboard/billing/invoices");
        revalidatePath(`/dashboard/billing/invoices/${id}`);

        return { success: true, invoice: updated };
    } catch (error: any) {
        console.error("Error updating invoice:", error);
        return { error: "Failed to update invoice" };
    }
}

// Cancel invoice
export async function cancelInvoice(id: string) {
    const session = await checkPermissions();

    if (!["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
        return { error: "Only admin or receptionist can cancel invoices" };
    }

    try {
        const existing = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!existing) {
            return { error: "Invoice not found" };
        }

        if (existing.status === "PAID") {
            return { error: "Cannot cancel paid invoice" };
        }

        if (existing.amountPaid > 0) {
            return { error: "Cannot cancel invoice with partial payments" };
        }

        const updated = await prisma.invoice.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        revalidatePath("/dashboard/billing/invoices");
        revalidatePath(`/dashboard/billing/invoices/${id}`);

        return { success: true, invoice: updated };
    } catch (error: any) {
        console.error("Error cancelling invoice:", error);
        return { error: "Failed to cancel invoice" };
    }
}

// Get invoices by patient
export async function getInvoicesByPatient(patientId: string) {
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

    const invoices = await prisma.invoice.findMany({
        where: { patientId },
        include: {
            payments: true,
        },
        orderBy: {
            issueDate: "desc",
        },
    });

    return invoices;
}

// Get overdue invoices
export async function getOverdueInvoices() {
    const session = await checkPermissions();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueInvoices = await prisma.invoice.findMany({
        where: {
            dueDate: {
                lt: today,
            },
            status: {
                in: ["PENDING", "PARTIALLY_PAID"],
            },
        },
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
        },
        orderBy: {
            dueDate: "asc",
        },
    });

    return overdueInvoices;
}

// Get financial stats
export async function getFinancialStats() {
    const session = await checkPermissions();

    // Total revenue (all paid invoices)
    const totalRevenue = await prisma.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
    });

    // Outstanding balance (pending + partially paid)
    const outstanding = await prisma.invoice.aggregate({
        where: {
            status: {
                in: ["PENDING", "PARTIALLY_PAID"],
            },
        },
        _sum: { amount: true, amountPaid: true },
    });

    const outstandingBalance =
        (outstanding._sum.amount || 0) - (outstanding._sum.amountPaid || 0);

    // Payments today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentsToday = await prisma.payment.aggregate({
        where: {
            paymentDate: {
                gte: today,
                lt: tomorrow,
            },
        },
        _sum: { amount: true },
        _count: true,
    });

    // Overdue count
    const overdueCount = await prisma.invoice.count({
        where: {
            dueDate: { lt: today },
            status: { in: ["PENDING", "PARTIALLY_PAID"] },
        },
    });

    return {
        totalRevenue: totalRevenue._sum.amount || 0,
        outstandingBalance,
        paymentsToday: paymentsToday._sum.amount || 0,
        paymentsCount: paymentsToday._count,
        overdueCount,
    };
}
