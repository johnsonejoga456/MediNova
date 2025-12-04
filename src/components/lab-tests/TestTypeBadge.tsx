export default function TestTypeBadge({ testType }: { testType: string }) {
    const getTypeConfig = (type: string) => {
        const upperType = type.toUpperCase();

        switch (upperType) {
            case "BLOOD":
                return {
                    bg: "bg-red-50",
                    text: "text-red-700",
                    border: "border-red-200",
                    dot: "bg-red-500",
                    label: "Blood Test",
                };
            case "URINE":
                return {
                    bg: "bg-yellow-50",
                    text: "text-yellow-700",
                    border: "border-yellow-200",
                    dot: "bg-yellow-500",
                    label: "Urine Test",
                };
            case "IMAGING":
                return {
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                    border: "border-blue-200",
                    dot: "bg-blue-500",
                    label: "Imaging",
                };
            case "BIOPSY":
                return {
                    bg: "bg-purple-50",
                    text: "text-purple-700",
                    border: "border-purple-200",
                    dot: "bg-purple-500",
                    label: "Biopsy",
                };
            case "CARDIOLOGY":
                return {
                    bg: "bg-pink-50",
                    text: "text-pink-700",
                    border: "border-pink-200",
                    dot: "bg-pink-500",
                    label: "Cardiology",
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
                    bg: "bg-teal-50",
                    text: "text-teal-700",
                    border: "border-teal-200",
                    dot: "bg-teal-500",
                    label: type,
                };
        }
    };

    const config = getTypeConfig(testType);

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
        >
            <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
}
