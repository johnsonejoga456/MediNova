"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";
import type { AppointmentStatus, AppointmentType } from "@prisma/client";

type Appointment = {
    id: string;
    appointmentDate: Date;
    duration: number;
    type: AppointmentType;
    status: AppointmentStatus;
    reason: string | null;
    patient: {
        user: {
            firstName: string;
            lastName: string;
        };
    };
    doctor: {
        user: {
            firstName: string;
            lastName: string;
        };
        specialization: string;
    };
};

export default function AppointmentsTable({ appointments }: { appointments: Appointment[] }) {
    const router = useRouter();

    const handleRowClick = (appointmentId: string) => {
        router.push(`/dashboard/appointments/${appointmentId}`);
    };

    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (appointments.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No appointments found</p>
                <p className="text-gray-400 mt-2">Schedule your first appointment to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                        <tr
                            key={appointment.id}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => handleRowClick(appointment.id)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {formatDateTime(appointment.appointmentDate)}
                                </div>
                                <div className="text-sm text-gray-500">{appointment.duration} min</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{appointment.doctor.specialization}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <TypeBadge type={appointment.type} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                    {appointment.reason || "—"}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={appointment.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a
                                    href={`/dashboard/appointments/${appointment.id}`}
                                    className="text-blue-600 hover:text-blue-900"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
