import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAppointments } from "@/actions/appointments";
import Link from "next/link";
import StatusBadge from "@/components/appointments/StatusBadge";

export default async function CalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const params = await searchParams;
    const now = new Date();
    const selectedMonth = params.month ? parseInt(params.month) : now.getMonth();
    const selectedYear = params.year ? parseInt(params.year) : now.getFullYear();

    // Get first day and last day of the month
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    const appointments = await getAppointments({
        startDate: firstDay,
        endDate: lastDay,
    });

    // Group appointments by date
    const appointmentsByDate = new Map<string, typeof appointments>();
    appointments.forEach((apt) => {
        const dateKey = new Date(apt.appointmentDate).toISOString().split("T")[0];
        if (!appointmentsByDate.has(dateKey)) {
            appointmentsByDate.set(dateKey, []);
        }
        appointmentsByDate.get(dateKey)!.push(apt);
    });

    // Calendar grid generation
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());

    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

    const calendarDays = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        calendarDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Appointments Calendar</h1>
                        <Link
                            href="/dashboard/appointments"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                            List View
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Month Navigation */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <Link
                            href={`/dashboard/appointments/calendar?month=${prevMonth}&year=${prevYear}`}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            ← Previous
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {monthNames[selectedMonth]} {selectedYear}
                        </h2>
                        <Link
                            href={`/dashboard/appointments/calendar?month=${nextMonth}&year=${nextYear}`}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Next →
                        </Link>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200">
                        {calendarDays.map((day) => {
                            const dateKey = day.toISOString().split("T")[0];
                            const dayAppointments = appointmentsByDate.get(dateKey) || [];
                            const isCurrentMonth = day.getMonth() === selectedMonth;
                            const isToday = day.toDateString() === now.toDateString();

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`bg-white p-2 min-h-[120px] ${!isCurrentMonth ? "bg-gray-50" : ""
                                        } ${isToday ? "bg-blue-50" : ""}`}
                                >
                                    <div className="text-right mb-1">
                                        <span
                                            className={`inline-block text-sm ${isToday
                                                    ? "bg-blue-600 text-white rounded-full w-6 h-6 leading-6"
                                                    : isCurrentMonth
                                                        ? "text-gray-900 font-semibold"
                                                        : "text-gray-400"
                                                }`}
                                        >
                                            {day.getDate()}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {dayAppointments.slice(0, 3).map((apt) => (
                                            <Link
                                                key={apt.id}
                                                href={`/dashboard/appointments/${apt.id}`}
                                                className="block text-xs p-1 rounded bg-blue-100 hover:bg-blue-200 transition truncate"
                                            >
                                                <div className="font-medium truncate">
                                                    {new Date(apt.appointmentDate).toLocaleTimeString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                                <div className="text-gray-600 truncate">
                                                    {apt.patient.user.firstName} {apt.patient.user.lastName}
                                                </div>
                                            </Link>
                                        ))}
                                        {dayAppointments.length > 3 && (
                                            <div className="text-xs text-gray-500 pl-1">
                                                +{dayAppointments.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-600 rounded"></div>
                            <span className="text-sm text-gray-700">Today</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 rounded"></div>
                            <span className="text-sm text-gray-700">Appointment</span>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6">
                    <Link
                        href="/dashboard/appointments"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Appointments
                    </Link>
                </div>
            </div>
        </div>
    );
}
