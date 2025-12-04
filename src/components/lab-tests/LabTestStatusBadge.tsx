import { LabTestStatus } from "@prisma/client";

export default function LabTestStatusBadge({ status }: { status: LabTestStatus }) {
    const getStatusConfig = (status: LabTestStatus) => {
        switch (status) {
            case "PENDING":
                return {
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                    border: "border-blue-200",
                    dot: "bg-blue-500",
                    label: "Pending",
                };
            case "IN_PROGRESS":
                return {
                    bg: "bg-yellow-50",
                    text: "text-yellow-700",
                    border: "border-yellow-200",
                    dot: "bg-yellow-500",
                    label: "In Progress",
                };
            case "COMPLETED":
                return {
                    bg: "bg-green-50",
                    text: "text-green-700",
                    border: "border-green-200",
                    dot: "bg-green-500",
                    label: "Completed",
                };
            case "CANCELLED":
                return {
                    bg: "bg-red-50",
                    text: "text-red-700",
                    border: "border-red-200",
                    dot: "bg-red-500",
                    label: "Cancelled",
                };
            default:
                return {
                    bg: "bg-gray-50",
                    text: "text-gray-700",
                    border: "border-gray-200",
                    dot: "bg-gray-500",
                    label: status,
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
        >
            <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
}
