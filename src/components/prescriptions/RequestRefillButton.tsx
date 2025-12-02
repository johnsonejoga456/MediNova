"use client";

import { useState } from "react";
import { requestRefill } from "@/actions/prescriptions";
import { useRouter } from "next/navigation";

export default function RequestRefillButton({ prescriptionId }: { prescriptionId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRequestRefill = async () => {
        if (!confirm("Do you want to request a refill for this prescription?")) {
            return;
        }

        setLoading(true);
        const result = await requestRefill(prescriptionId);

        if (result.error) {
            alert(result.error);
        } else {
            alert(result.message || "Refill requested successfully!");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleRequestRefill}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400"
        >
            {loading ? "Requesting..." : "Request Refill"}
        </button>
    );
}
