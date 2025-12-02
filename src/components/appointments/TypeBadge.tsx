import type { AppointmentType } from "@prisma/client";

export default function TypeBadge({ type }: { type: AppointmentType }) {
    const getTypeConfig = (type: AppointmentType) => {
        switch (type) {
            case "CONSULTATION":
                return {
                    bg: "bg-purple-100",
                    text: "text-purple-800",
                    label: "Consultation",
                };
            case "FOLLOW_UP":
                return {
                    bg: "bg-blue-100",
                    text: "text-blue-800",
                    label: "Follow-up",
                };
            case "EMERGENCY":
                return {
                    bg: "bg-red-100",
                    text: "text-red-800",
                    label: "Emergency",
                };
            case "SURGERY":
                return {
                    bg: "bg-orange-100",
                    text: "text-orange-800",
                    label: "Surgery",
                };
            case "LAB_TEST":
                return {
                    bg: "bg-teal-100",
                    text: "text-teal-800",
                    label: "Lab Test",
                };
            case "VACCINATION":
                return {
                    bg: "bg-green-100",
                    text: "text-green-800",
                    label: "Vaccination",
                };
            case "THERAPY":
                return {
                    bg: "bg-indigo-100",
                    text: "text-indigo-800",
                    label: "Therapy",
                };
            case "OTHER":
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    label: "Other",
                };
            default:
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    label: type,
                };
        }
    };

    const config = getTypeConfig(type);

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
}
