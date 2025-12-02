"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPatientById, updatePatient } from "@/actions/patients";
import Link from "next/link";

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [patient, setPatient] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [patientId, setPatientId] = useState("");

    useEffect(() => {
        async function fetchPatient() {
            try {
                const resolvedParams = await params;
                setPatientId(resolvedParams.id);
                const data = await getPatientById(resolvedParams.id);
                setPatient(data);
            } catch (err) {
                setError("Failed to load patient data");
            } finally {
                setLoadingData(false);
            }
        }
        fetchPatient();
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
            dateOfBirth: formData.get("dateOfBirth") as string,
            gender: formData.get("gender") as any,
            bloodType: formData.get("bloodType") as string || undefined,
            address: formData.get("address") as string || undefined,
            city: formData.get("city") as string || undefined,
            state: formData.get("state") as string || undefined,
            zipCode: formData.get("zipCode") as string || undefined,
            country: formData.get("country") as string,
            emergencyContactName: formData.get("emergencyContactName") as string || undefined,
            emergencyContactPhone: formData.get("emergencyContactPhone") as string || undefined,
            emergencyContactRelation: formData.get("emergencyContactRelation") as string || undefined,
            insuranceProvider: formData.get("insuranceProvider") as string || undefined,
            insurancePolicyNumber: formData.get("insurancePolicyNumber") as string || undefined,
            insuranceGroupNumber: formData.get("insuranceGroupNumber") as string || undefined,
            allergies: formData.get("allergies") as string || undefined,
            chronicConditions: formData.get("chronicConditions") as string || undefined,
            currentMedications: formData.get("currentMedications") as string || undefined,
        };

        const result = await updatePatient(patientId, data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push(`/dashboard/patients/${patientId}`);
            router.refresh();
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading patient data...</p>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 text-lg">Patient not found</p>
                    <Link href="/dashboard/patients" className="mt-4 text-blue-600 hover:text-blue-700">
                        ← Back to Patients
                    </Link>
                </div>
            </div>
        );
    }

    const formatDateForInput = (date: Date) => {
        return new Date(date).toISOString().split('T')[0];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Patient</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Update patient information for {patient.user.firstName} {patient.user.lastName}
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
                                    defaultValue={patient.user.firstName}
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
                                    defaultValue={patient.user.lastName}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (Cannot be changed)
                                </label>
                                <input
                                    type="email"
                                    value={patient.user.email}
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
                                    defaultValue={patient.user.phoneNumber || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    required
                                    defaultValue={formatDateForInput(patient.dateOfBirth)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender *
                                </label>
                                <select
                                    name="gender"
                                    required
                                    defaultValue={patient.gender}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Type
                                </label>
                                <select
                                    name="bloodType"
                                    defaultValue={patient.bloodType || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Blood Type</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Address
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    defaultValue={patient.address || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        defaultValue={patient.city || ''}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State/Province
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        defaultValue={patient.state || ''}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Zip Code
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        defaultValue={patient.zipCode || ''}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country *
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    required
                                    defaultValue={patient.country}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Emergency Contact
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="emergencyContactName"
                                    defaultValue={patient.emergencyContactName || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="emergencyContactPhone"
                                    defaultValue={patient.emergencyContactPhone || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Relationship
                                </label>
                                <input
                                    type="text"
                                    name="emergencyContactRelation"
                                    defaultValue={patient.emergencyContactRelation || ''}
                                    placeholder="e.g., Spouse, Parent, Sibling"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Insurance */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Insurance Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Provider
                                </label>
                                <input
                                    type="text"
                                    name="insuranceProvider"
                                    defaultValue={patient.insuranceProvider || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Policy Number
                                </label>
                                <input
                                    type="text"
                                    name="insurancePolicyNumber"
                                    defaultValue={patient.insurancePolicyNumber || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Group Number
                                </label>
                                <input
                                    type="text"
                                    name="insuranceGroupNumber"
                                    defaultValue={patient.insuranceGroupNumber || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical History */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Medical History
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Allergies
                                </label>
                                <textarea
                                    name="allergies"
                                    rows={3}
                                    defaultValue={patient.allergies || ''}
                                    placeholder="List any known allergies (medications, foods, environmental, etc.)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chronic Conditions
                                </label>
                                <textarea
                                    name="chronicConditions"
                                    rows={3}
                                    defaultValue={patient.chronicConditions || ''}
                                    placeholder="List any chronic conditions (diabetes, hypertension, asthma, etc.)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Medications
                                </label>
                                <textarea
                                    name="currentMedications"
                                    rows={3}
                                    defaultValue={patient.currentMedications || ''}
                                    placeholder="List current medications with dosages"
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
                            href={`/dashboard/patients/${patientId}`}
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
