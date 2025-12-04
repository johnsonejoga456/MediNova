"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

// Helper to check permissions
async function checkAdminAccess() {
    const session = await auth();
    if (!session || !["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

// Get overall statistics
export async function getOverallStats() {
    await checkAdminAccess();

    const [totalPatients, totalDoctors, totalAppointments, invoiceStats] = await Promise.all([
        prisma.patient.count(),
        prisma.doctor.count(),
        prisma.appointment.count({
            where: { appointmentDate: { gte: new Date(new Date().setDate(1)) } }, // This month
        }),
        prisma.invoice.aggregate({
            _sum: { amount: true, amountPaid: true },
            where: { createdAt: { gte: new Date(new Date().setDate(1)) } }, // This month
        }),
    ]);

    const revenueThisMonth = invoiceStats._sum.amount || 0;
    const paidThisMonth = invoiceStats._sum.amountPaid || 0;
    const outstandingBalance = await prisma.invoice.aggregate({
        _sum: { amount: true, amountPaid: true },
        where: { status: { in: ["PENDING", "PARTIALLY_PAID"] } },
    });
    const outstanding = (outstandingBalance._sum.amount || 0) - (outstandingBalance._sum.amountPaid || 0);

    return {
        totalPatients,
        totalDoctors,
        appointmentsThisMonth: totalAppointments,
        revenueThisMonth,
        paidThisMonth,
        outstanding,
    };
}

// Get appointment trends (last 30 days)
export async function getAppointmentTrends() {
    await checkAdminAccess();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appointments = await prisma.appointment.findMany({
        where: { appointmentDate: { gte: thirtyDaysAgo } },
        select: { appointmentDate: true, status: true },
    });

    // Group by date
    const dailyStats: Record<string, any> = {};
    appointments.forEach((apt) => {
        const date = new Date(apt.appointmentDate).toISOString().split("T")[0];
        if (!dailyStats[date]) {
            dailyStats[date] = { date, scheduled: 0, completed: 0, cancelled: 0 };
        }
        if (apt.status === "SCHEDULED") dailyStats[date].scheduled++;
        else if (apt.status === "COMPLETED") dailyStats[date].completed++;
        else if (apt.status === "CANCELLED") dailyStats[date].cancelled++;
    });

    return Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date));
}

// Get revenue trends (last 12 months)
export async function getRevenueTrends() {
    await checkAdminAccess();

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const invoices = await prisma.invoice.findMany({
        where: { issueDate: { gte: twelveMonthsAgo } },
        select: { issueDate: true, amount: true, amountPaid: true },
    });

    // Group by month
    const monthlyStats: Record<string, any> = {};
    invoices.forEach((inv) => {
        const month = new Date(inv.issueDate).toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyStats[month]) {
            monthlyStats[month] = { month, invoiced: 0, collected: 0 };
        }
        monthlyStats[month].invoiced += inv.amount;
        monthlyStats[month].collected += inv.amountPaid;
    });

    return Object.values(monthlyStats).sort((a: any, b: any) => a.month.localeCompare(b.month));
}

// Get patient growth (last 6 months)
export async function getPatientGrowth() {
    await checkAdminAccess();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const patients = await prisma.patient.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
    });

    // Group by month
    const monthlyStats: Record<string, any> = {};
    patients.forEach((patient) => {
        const month = new Date(patient.createdAt).toISOString().slice(0, 7);
        if (!monthlyStats[month]) {
            monthlyStats[month] = { month, count: 0 };
        }
        monthlyStats[month].count++;
    });

    return Object.values(monthlyStats).sort((a: any, b: any) => a.month.localeCompare(b.month));
}

// Get department distribution
export async function getDepartmentDistribution() {
    await checkAdminAccess();

    const appointments = await prisma.appointment.findMany({
        include: { doctor: { select: { specialization: true } } },
    });

    const distribution: Record<string, number> = {};
    appointments.forEach((apt) => {
        const spec = apt.doctor.specialization;
        distribution[spec] = (distribution[spec] || 0) + 1;
    });

    return Object.entries(distribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5
}

// Get lab test statistics
export async function getLabTestStats() {
    await checkAdminAccess();

    const [total, pending, inProgress, completed] = await Promise.all([
        prisma.labTest.count(),
        prisma.labTest.count({ where: { status: "PENDING" } }),
        prisma.labTest.count({ where: { status: "IN_PROGRESS" } }),
        prisma.labTest.count({ where: { status: "COMPLETED" } }),
    ]);

    return { total, pending, inProgress, completed };
}
