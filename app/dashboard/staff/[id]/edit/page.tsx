"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStaffById, updateStaff } from "@/actions/staff";
import Link from "next/link";

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [staff, setStaff] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [staffId, setStaffId] = useState("");

    useEffect(() => {
        async function fetchStaff() {
            try {
                const resolvedParams = await params;
                setStaffId(resolvedParams.id);
                const data = await getStaffById(resolvedParams.id);
                setStaff(data);
            } catch (err) {
                setError("Failed to load staff data");
            } finally {
                setLoadingData(false);
            }
        }
        fetchStaff();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            phoneNumber: formData.get("phoneNumber") as string || undefined,
            role: formData.get("role") as "NURSE" | "RECEPTIONIST",
            department: formData.get("department") as string,
            position: formData.get("position") as string,
        };

        const result = await updateStaff(staffId, data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push(`/dashboard/staff/${staffId}`);
            router.refresh();
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading staff data...</p>
                </div>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 text-lg">Staff member not found</p>
                    <Link href="/dashboard/staff" className="mt-4 text-blue-600 hover:text-blue-700">
                        ← Back to Staff
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Staff</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Update information for {staff.user.firstName} {staff.user.lastName}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    defaultValue={staff.user.firstName}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    defaultValue={staff.user.lastName}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (Cannot be changed)
                                </label>
                                <input
                                    type="email"
                                    value={staff.user.email}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    defaultValue={staff.user.phoneNumber || ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Work Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Work Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role *
                                </label>
                                <select
                                    name="role"
                                    required
                                    defaultValue={staff.user.role}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Role</option>
                                    <option value="NURSE">Nurse</option>
                                    <option value="RECEPTIONIST">Receptionist</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department *
                                </label>
                                <select
                                    name="department"
                                    required
                                    defaultValue={staff.department}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="ICU">ICU (Intensive Care Unit)</option>
                                    <option value="Laboratory">Laboratory</option>
                                    <option value="Nursing">Nursing</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                    <option value="Radiology">Radiology</option>
                                    <option value="Reception">Reception</option>
                                    <option value="Surgery">Surgery</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Position *
                                </label>
                                <input
                                    type="text"
                                    name="position"
                                    required
                                    defaultValue={staff.position}
                                    placeholder="e.g., Head Nurse, Front Desk Receptionist"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <Link
                            href={`/dashboard/staff/${staffId}`}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
