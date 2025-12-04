"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";

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

// Calculate invoice status based on payment
function calculateInvoiceStatus(amount: number, amountPaid: number): string {
    if (amountPaid >= amount) return "PAID";
    if (amountPaid > 0) return "PARTIALLY_PAID";
    return "PENDING";
}

// Record new payment
export async function recordPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    notes?: string;
}) {
    const session = await checkPermissions();

    if (!["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
        return { error: "Only admin or receptionist can record payments" };
    }

    try {
        // Get invoice
        const invoice = await prisma.invoice.findUnique({
            where: { id: data.invoiceId },
        });

        if (!invoice) {
            return { error: "Invoice not found" };
        }

        if (invoice.status === "CANCELLED") {
            return { error: "Cannot record payment for cancelled invoice" };
        }

        // Calculate outstanding balance
        const outstanding = invoice.amount - invoice.amountPaid;

        if (data.amount > outstanding) {
            return { error: `Payment amount cannot exceed outstanding balance (${outstanding.toFixed(2)})` };
        }

        if (data.amount <= 0) {
            return { error: "Payment amount must be greater than zero" };
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                invoiceId: data.invoiceId,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId,
                notes: data.notes,
                paymentDate: new Date(),
            },
        });

        // Update invoice
        const newAmountPaid = invoice.amountPaid + data.amount;
        const newStatus = calculateInvoiceStatus(invoice.amount, newAmountPaid);

        const updatedInvoice = await prisma.invoice.update({
            where: { id: data.invoiceId },
            data: {
                amountPaid: newAmountPaid,
                status: newStatus as any,
                paidDate: newStatus === "PAID" ? new Date() : invoice.paidDate,
            },
        });

        revalidatePath("/dashboard/billing/invoices");
        revalidatePath(`/dashboard/billing/invoices/${data.invoiceId}`);

        return { success: true, payment, invoice: updatedInvoice };
    } catch (error: any) {
        console.error("Error recording payment:", error);
        return { error: "Failed to record payment" };
    }
}

// Get all payments with filters
export async function getPayments(params?: {
    invoiceId?: string;
    patientId?: string;
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

        // Get patient's invoices
        const invoices = await prisma.invoice.findMany({
            where: { patientId: patient.id },
            select: { id: true },
        });
        const invoiceIds = invoices.map((inv) => inv.id);
        where.invoiceId = { in: invoiceIds };
    }

    // Apply filters
    if (params?.invoiceId) where.invoiceId = params.invoiceId;

    // Date range filter
    if (params?.startDate || params?.endDate) {
        where.paymentDate = {};
        if (params.startDate) where.paymentDate.gte = params.startDate;
        if (params.endDate) where.paymentDate.lte = params.endDate;
    }

    const payments = await prisma.payment.findMany({
        where,
        include: {
            invoice: {
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
            },
        },
        orderBy: {
            paymentDate: "desc",
        },
    });

    return payments;
}

// Get payments for specific invoice
export async function getPaymentsByInvoice(invoiceId: string) {
    const session = await checkPermissions(true);

    // Check permission
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            patient: true,
        },
    });

    if (!invoice) {
        throw new Error("Invoice not found");
    }

    // Permission check for patients
    if (session.user.role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });
        if (invoice.patientId !== patient?.id) {
            throw new Error("Unauthorized");
        }
    }

    const payments = await prisma.payment.findMany({
        where: { invoiceId },
        orderBy: {
            paymentDate: "desc",
        },
    });

    return payments;
}

// Get payment statistics
export async function getPaymentStats() {
    const session = await checkPermissions();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This month
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Payments today
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

    // Payments this month
    const paymentsThisMonth = await prisma.payment.aggregate({
        where: {
            paymentDate: {
                gte: thisMonthStart,
                lt: nextMonthStart,
            },
        },
        _sum: { amount: true },
        _count: true,
    });

    // All-time total
    const allTimePayments = await prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
    });

    // By payment method
    const byMethod = await prisma.payment.groupBy({
        by: ["paymentMethod"],
        _sum: { amount: true },
        _count: true,
    });

    return {
        today: {
            amount: paymentsToday._sum.amount || 0,
            count: paymentsToday._count,
        },
        thisMonth: {
            amount: paymentsThisMonth._sum.amount || 0,
            count: paymentsThisMonth._count,
        },
        allTime: {
            amount: allTimePayments._sum.amount || 0,
            count: allTimePayments._count,
        },
        byMethod,
    };
}
