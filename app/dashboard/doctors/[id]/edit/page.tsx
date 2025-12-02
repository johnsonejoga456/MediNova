"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDoctorById, updateDoctor } from "@/actions/doctors";
import Link from "next/link";

export default function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [doctor, setDoctor] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [doctorId, setDoctorId] = useState("");

    useEffect(() => {
        async function fetchDoctor() {
            try {
                const resolvedParams = await params;
                setDoctorId(resolvedParams.id);
                const data = await getDoctorById(resolvedParams.id);
                setDoctor(data);
            } catch (err) {
                setError("Failed to load doctor data");
            } finally {
                setLoadingData(false);
            }
        }
        fetchDoctor();
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
            specialization: formData.get("specialization") as string,
            licenseNumber: formData.get("licenseNumber") as string,
            qualification: formData.get("qualification") as string,
            experienceYears: formData.get("experienceYears")
                ? parseInt(formData.get("experienceYears") as string)
                : undefined,
            bio: formData.get("bio") as string || undefined,
        };

        const result = await updateDoctor(doctorId, data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push(`/dashboard/doctors/${doctorId}`);
            router.refresh();
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading doctor data...</p>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 text-lg">Doctor not found</p>
                    <Link href="/dashboard/doctors" className="mt-4 text-blue-600 hover:text-blue-700">
                        ← Back to Doctors
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Doctor</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Update information for Dr. {doctor.user.firstName} {doctor.user.lastName}
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
                                    defaultValue={doctor.user.firstName}
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
                                    defaultValue={doctor.user.lastName}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (Cannot be changed)
                                </label>
                                <input
                                    type="email"
                                    value={doctor.user.email}
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
                                    defaultValue={doctor.user.phoneNumber || ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Professional Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specialization *
                                </label>
                                <select
                                    name="specialization"
                                    required
                                    defaultValue={doctor.specialization}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Specialization</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Emergency Medicine">Emergency Medicine</option>
                                    <option value="Family Medicine">Family Medicine</option>
                                    <option value="Internal Medicine">Internal Medicine</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Obstetrics and Gynecology">Obstetrics and Gynecology</option>
                                    <option value="Oncology">Oncology</option>
                                    <option value="Ophthalmology">Ophthalmology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                    <option value="Radiology">Radiology</option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Urology">Urology</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    License Number *
                                </label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    required
                                    defaultValue={doctor.licenseNumber}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Qualification *
                                </label>
                                <input
                                    type="text"
                                    name="qualification"
                                    required
                                    defaultValue={doctor.qualification}
                                    placeholder="e.g., MD, MBBS, DO"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    name="experienceYears"
                                    min="0"
                                    max="60"
                                    defaultValue={doctor.experienceYears || ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    rows={4}
                                    defaultValue={doctor.bio || ""}
                                    placeholder="Brief professional biography..."
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
                            href={`/dashboard/doctors/${doctorId}`}
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
