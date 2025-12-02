"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPrescription } from "@/actions/prescriptions";
import Link from "next/link";

export default function NewPrescriptionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        async function fetchPatients() {
            try {
                const res = await fetch("/api/patients");
                const data = await res.json();
                setPatients(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching patients:", err);
                setPatients([]);
            }
        }
        fetchPatients();
    }, []);

    // Auto-calculate end date based on start date and duration
    const handleDurationChange = (startDate: string, duration: string) => {
        if (!startDate || !duration) return;

        const start = new Date(startDate);
        const durationNumber = parseInt(duration);

        if (isNaN(durationNumber)) return;

        const end = new Date(start);
        end.setDate(end.getDate() + durationNumber);
        setEndDate(end.toISOString().split("T")[0]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        const data = {
            patientId: formData.get("patientId") as string,
            medicationName: formData.get("medicationName") as string,
            dosage: formData.get("dosage") as string,
            frequency: formData.get("frequency") as string,
            duration: formData.get("duration") as string,
            quantity: parseInt(formData.get("quantity") as string),
            instructions: formData.get("instructions") as string || undefined,
            refills: parseInt(formData.get("refills") as string),
            startDate: new Date(formData.get("startDate") as string),
            endDate: endDate ? new Date(endDate) : undefined,
        };

        const result = await createPrescription(data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Prescription Created!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            The prescription has been successfully created.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/prescriptions")}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            View Prescriptions
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
                    <h1 className="text-3xl font-bold text-gray-900">New Prescription</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Create a new medication prescription for a patient
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Patient Selection */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Patient Information
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Patient *
                            </label>
                            <select
                                name="patientId"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select a patient</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.user.firstName} {patient.user.lastName} - {patient.user.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Medication Details */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Medication Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Medication Name *
                                </label>
                                <input
                                    type="text"
                                    name="medicationName"
                                    required
                                    placeholder="e.g., Amoxicillin, Ibuprofen"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dosage *
                                </label>
                                <input
                                    type="text"
                                    name="dosage"
                                    required
                                    placeholder="e.g., 500mg, 10ml"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    required
                                    min="1"
                                    placeholder="e.g., 30"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Number of units (tablets, capsules, etc.)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frequency *
                                </label>
                                <select
                                    name="frequency"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select frequency</option>
                                    <option value="Once daily">Once daily</option>
                                    <option value="Twice daily">Twice daily</option>
                                    <option value="Three times daily">Three times daily</option>
                                    <option value="Four times daily">Four times daily</option>
                                    <option value="Every 4 hours">Every 4 hours</option>
                                    <option value="Every 6 hours">Every 6 hours</option>
                                    <option value="Every 8 hours">Every 8 hours</option>
                                    <option value="Every 12 hours">Every 12 hours</option>
                                    <option value="As needed">As needed</option>
                                    <option value="Before meals">Before meals</option>
                                    <option value="After meals">After meals</option>
                                    <option value="At bedtime">At bedtime</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration *
                                </label>
                                <input
                                    type="text"
                                    name="duration"
                                    required
                                    placeholder="e.g., 7 days, 2 weeks"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Treatment Duration */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Treatment Period
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => {
                                        const duration = (document.getElementsByName("duration")[0] as HTMLInputElement).value;
                                        const match = duration.match(/(\d+)/);
                                        if (match) {
                                            handleDurationChange(e.target.value, match[1]);
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date (Auto-calculated)
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                                <p className="text-xs text-gray-500 mt-1">Based on start date and duration</p>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Instructions & Notes
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instructions
                                </label>
                                <textarea
                                    name="instructions"
                                    rows={3}
                                    placeholder="e.g., Take with food, Avoid alcohol, etc."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Refills */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Refills
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Refills Allowed *
                            </label>
                            <input
                                type="number"
                                name="refills"
                                required
                                min="0"
                                max="12"
                                defaultValue="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">0-12 refills (0 for one-time prescriptions)</p>
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
                            {loading ? "Creating..." : "Create Prescription"}
                        </button>
                        <Link
                            href="/dashboard/prescriptions"
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
