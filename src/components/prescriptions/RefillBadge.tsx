export default function RefillBadge({ refillsRemaining }: { refillsRemaining: number }) {
    if (refillsRemaining === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                No refills
            </span>
        );
    }

    if (refillsRemaining <= 2) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                {refillsRemaining} refill{refillsRemaining !== 1 ? "s" : ""} left
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {refillsRemaining} refills
        </span>
    );
}
