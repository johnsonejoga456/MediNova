"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteStaff } from "@/actions/staff";

export default function DeleteStaffButton({ staffId }: { staffId: string }) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        const result = await deleteStaff(staffId);

        if (result.error) {
            alert(result.error);
            setLoading(false);
        } else {
            router.push("/dashboard/staff");
            router.refresh();
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
                Delete Staff
            </button>

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this staff member? This will mark their account as inactive.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400"
                            >
                                {loading ? "Deleting..." : "Confirm Delete"}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
