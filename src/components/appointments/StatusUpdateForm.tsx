"use client";

import { useState } from "react";
import { updateAppointmentStatus } from "@/actions/appointments";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";

export default function StatusUpdateForm({
    appointmentId,
    currentStatus,
}: {
    appointmentId: string;
    currentStatus: AppointmentStatus;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleStatusChange = async (newStatus: AppointmentStatus) => {
        if (newStatus === currentStatus) return;

        setLoading(true);
        setError("");

        const result = await updateAppointmentStatus(appointmentId, newStatus);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.refresh();
            setLoading(false);
        }
    };

    return (
        <div>
            <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as AppointmentStatus)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
            </select>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            {loading && <p className="text-gray-500 text-sm mt-2">Updating...</p>}
        </div>
    );
}
