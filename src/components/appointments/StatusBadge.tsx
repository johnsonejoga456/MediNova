import type { AppointmentStatus } from "@prisma/client";

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
    const getStatusConfig = (status: AppointmentStatus) => {
        switch (status) {
            case "SCHEDULED":
                return {
                    bg: "bg-blue-100",
                    text: "text-blue-800",
                    label: "Scheduled",
                };
            case "CONFIRMED":
                return {
                    bg: "bg-green-100",
                    text: "text-green-800",
                    label: "Confirmed",
                };
            case "IN_PROGRESS":
                return {
                    bg: "bg-yellow-100",
                    text: "text-yellow-800",
                    label: "In Progress",
                };
            case "COMPLETED":
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    label: "Completed",
                };
            case "CANCELLED":
                return {
                    bg: "bg-red-100",
                    text: "text-red-800",
                    label: "Cancelled",
                };
            case "NO_SHOW":
                return {
                    bg: "bg-orange-100",
                    text: "text-orange-800",
                    label: "No Show",
                };
            default:
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    label: status,
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
}
