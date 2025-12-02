"use client";

import { useState } from "react";
import { deletePatient } from "@/actions/patients";
import { useRouter } from "next/navigation";

export default function DeletePatientButton({ patientId }: { patientId: string }) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        const result = await deletePatient(patientId);

        if (result.error) {
            alert(result.error);
            setLoading(false);
        } else {
            router.push("/dashboard/patients");
            router.refresh();
        }
    };

    if (!showConfirm) {
        return (
            <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
                Delete Patient
            </button>
        );
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400"
            >
                {loading ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
                Cancel
            </button>
        </div>
    );
}
