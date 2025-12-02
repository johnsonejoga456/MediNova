export default function RefillBadge({ refillsRemaining }: { refillsRemaining: number }) {
    if (refillsRemaining === 0) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                No refills
            </span>
        );
    }

    if (refillsRemaining <= 2) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠️ {refillsRemaining} refill{refillsRemaining !== 1 ? "s" : ""} left
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {refillsRemaining} refills
        </span>
    );
}
