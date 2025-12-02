"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStaff } from "@/actions/staff";
import Link from "next/link";

export default function NewStaffPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tempPassword, setTempPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            email: formData.get("email") as string,
            phoneNumber: formData.get("phoneNumber") as string || undefined,
            role: formData.get("role") as "NURSE" | "RECEPTIONIST",
            department: formData.get("department") as string,
            position: formData.get("position") as string,
        };

        const result = await createStaff(data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else if (result.tempPassword) {
            setTempPassword(result.tempPassword);
        }
    };

    if (tempPassword) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Staff Created Successfully!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            A temporary password has been generated:
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600 mb-2">Temporary Password:</p>
                            <p className="text-xl font-mono font-bold text-gray-900">
                                {tempPassword}
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Please save this password and share it with the staff member securely.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/staff")}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            Go to Staff List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Add New Staff</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Create a new staff member account
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
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
                            {loading ? "Creating..." : "Create Staff"}
                        </button>
                        <Link
                            href="/dashboard/staff"
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
