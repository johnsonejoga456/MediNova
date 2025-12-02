import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAppointments } from "@/actions/appointments";
import Link from "next/link";
import AppointmentsTable from "@/components/appointments/AppointmentsTable";
import type { AppointmentStatus } from "@prisma/client";

export default async function AppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
        doctorId?: string;
        status?: AppointmentStatus;
        startDate?: string;
        endDate?: string;
    }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const params = await searchParams;

    // Parse dates if provided
    const filters: any = {};
    if (params.doctorId) filters.doctorId = params.doctorId;
    if (params.status) filters.status = params.status;
    if (params.startDate) filters.startDate = new Date(params.startDate);
    if (params.endDate) filters.endDate = new Date(params.endDate);

    const appointments = await getAppointments(filters);

    // Only admin and receptionist can book appointments
    const canBookAppointments = ["ADMIN", "RECEPTIONIST"].includes(session.user.role);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage all appointments in the system
                            </p>
                        </div>
                        {canBookAppointments && (
                            <Link
                                href="/dashboard/appointments/new"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                + Book Appointment
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <form method="GET" className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                defaultValue={params.startDate}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                defaultValue={params.endDate}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={params.status}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="NO_SHOW">No Show</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Filter
                            </button>
                        </div>
                        <div className="flex items-end">
                            {(params.status || params.startDate || params.endDate) && (
                                <Link
                                    href="/dashboard/appointments"
                                    className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-center"
                                >
                                    Clear
                                </Link>
                            )}
                        </div>
                    </form>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-3 mb-6">
                    <Link
                        href={`/dashboard/appointments?startDate=${new Date().toISOString().split("T")[0]}&endDate=${new Date().toISOString().split("T")[0]}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                        📅 Today
                    </Link>
                    <Link
                        href="/dashboard/appointments?status=SCHEDULED"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                        🕐 Upcoming
                    </Link>
                    <Link
                        href="/dashboard/appointments?status=COMPLETED"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                        ✅ Completed
                    </Link>
                    <Link
                        href="/dashboard/appointments/calendar"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                        📆 Calendar View
                    </Link>
                </div>

                {/*  Appointments Count */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Appointments Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <AppointmentsTable appointments={appointments} />
                </div>

                {/* Back to Dashboard */}
                <div className="mt-6">
                    <Link
                        href="/dashboard"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
