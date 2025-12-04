import type { AppointmentType } from "@prisma/client";

export default function TypeBadge({ type }: { type: AppointmentType }) {
    const getTypeConfig = (type: AppointmentType) => {
        switch (type) {
            case "CONSULTATION":
                return {
                    bg: "bg-purple-50",
                    text: "text-purple-700",
                    border: "border-purple-200",
                    dot: "bg-purple-500",
                    label: "Consultation",
                };
            case "FOLLOW_UP":
                return {
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                    border: "border-blue-200",
                    dot: "bg-blue-500",
                    label: "Follow-up",
                };
            case "EMERGENCY":
                return {
                    bg: "bg-red-50",
                    text: "text-red-700",
                    border: "border-red-200",
                    dot: "bg-red-500",
                    label: "Emergency",
                };
            case "SURGERY":
                return {
                    bg: "bg-orange-50",
                    text: "text-orange-700",
                    border: "border-orange-200",
                    dot: "bg-orange-500",
                    label: "Surgery",
                };
            case "LAB_TEST":
                return {
                    bg: "bg-teal-50",
                    text: "text-teal-700",
                    border: "border-teal-200",
                    dot: "bg-teal-500",
                    label: "Lab Test",
                };
            case "VACCINATION":
                return {
                    bg: "bg-green-50",
                    text: "text-green-700",
                    border: "border-green-200",
                    dot: "bg-green-500",
                    label: "Vaccination",
                };
            case "THERAPY":
                return {
                    bg: "bg-indigo-50",
                    text: "text-indigo-700",
                    border: "border-indigo-200",
                    dot: "bg-indigo-500",
                    label: "Therapy",
                };
            case "CONSULTATION":
                return {
                    bg: "bg-cyan-50",
                    text: "text-cyan-700",
                    border: "border-cyan-200",
                    dot: "bg-cyan-500",
                    label: "Consultation",
                };
            case "VACCINATION":
                return {
                    bg: "bg-green-50",
                    text: "text-green-700",
                    border: "border-green-200",
                    dot: "bg-green-500",
                    label: "Vaccination",
                };
            case "OTHER":
                return {
                    bg: "bg-gray-50",
                    text: "text-gray-700",
                    border: "border-gray-200",
                    dot: "bg-gray-500",
                    label: "Other",
                };
            default:
                return {
                    bg: "bg-gray-50",
                    text: "text-gray-700",
                    border: "border-gray-200",
                    dot: "bg-gray-500",
                    label: type,
                };
        }
    };

    const config = getTypeConfig(type);

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
        >
            <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
}
