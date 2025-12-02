"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMedicalRecord } from "@/actions/medical-records";
import Link from "next/link";

export default function NewMedicalRecordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        // Build vital signs JSON
        const vitalSigns: any = {};
        if (formData.get("bloodPressure")) vitalSigns.bloodPressure = formData.get("bloodPressure");
        if (formData.get("heartRate")) vitalSigns.heartRate = parseInt(formData.get("heartRate") as string);
        if (formData.get("temperature")) vitalSigns.temperature = parseFloat(formData.get("temperature") as string);
        if (formData.get("weight")) vitalSigns.weight = parseFloat(formData.get("weight") as string);
        if (formData.get("height")) vitalSigns.height = parseFloat(formData.get("height") as string);
        if (formData.get("oxygenSaturation")) vitalSigns.oxygenSaturation = parseInt(formData.get("oxygenSaturation") as string);

        const data = {
            patientId: formData.get("patientId") as string,
            visitDate: new Date(formData.get("visitDate") as string),
            diagnosis: formData.get("diagnosis") as string,
            symptoms: formData.get("symptoms") as string,
            subjective: formData.get("subjective") as string || undefined,
            objective: formData.get("objective") as string || undefined,
            assessment: formData.get("assessment") as string || undefined,
            plan: formData.get("plan") as string || undefined,
            vitalSigns: Object.keys(vitalSigns).length > 0 ? JSON.stringify(vitalSigns) : undefined,
            followUpDate: formData.get("followUpDate") ? new Date(formData.get("followUpDate") as string) : undefined,
            followUpNotes: formData.get("followUpNotes") as string || undefined,
        };

        const result = await createMedicalRecord(data);

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
                            Record Created!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            The medical record has been successfully created.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/medical-records")}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            View Medical Records
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
                    <h1 className="text-3xl font-bold text-gray-900">New Medical Record</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Create a new medical record for a patient visit
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Patient & Visit Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Patient & Visit Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visit Date *
                                </label>
                                <input
                                    type="date"
                                    name="visitDate"
                                    required
                                    defaultValue={new Date().toISOString().split("T")[0]}
                                    max={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Chief Complaint */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Chief Complaint
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Primary Diagnosis *
                                </label>
                                <input
                                    type="text"
                                    name="diagnosis"
                                    required
                                    placeholder="e.g., Hypertension, Type 2 Diabetes"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Symptoms *
                                </label>
                                <textarea
                                    name="symptoms"
                                    required
                                    rows={3}
                                    placeholder="List the patient's symptoms..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SOAP Notes */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            SOAP Notes
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="inline-block w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center mr-2">
                                        S
                                    </span>
                                    Subjective (Patient's Complaints)
                                </label>
                                <textarea
                                    name="subjective"
                                    rows={3}
                                    placeholder="What the patient reports..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="inline-block w-6 h-6 bg-green-500 rounded-full text-white text-xs flex items-center justify-center mr-2">
                                        O
                                    </span>
                                    Objective (Doctor's Observations)
                                </label>
                                <textarea
                                    name="objective"
                                    rows={3}
                                    placeholder="Physical examination findings..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="inline-block w-6 h-6 bg-yellow-500 rounded-full text-white text-xs flex items-center justify-center mr-2">
                                        A
                                    </span>
                                    Assessment (Diagnosis)
                                </label>
                                <textarea
                                    name="assessment"
                                    rows={3}
                                    placeholder="Medical assessment and diagnosis..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="inline-block w-6 h-6 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center mr-2">
                                        P
                                    </span>
                                    Plan (Treatment Plan)
                                </label>
                                <textarea
                                    name="plan"
                                    rows={3}
                                    placeholder="Treatment plan, medications, follow-up..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vital Signs */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Vital Signs
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Pressure
                                </label>
                                <input
                                    type="text"
                                    name="bloodPressure"
                                    placeholder="120/80"
                                    pattern="\d+/\d+"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">mmHg</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Heart Rate
                                </label>
                                <input
                                    type="number"
                                    name="heartRate"
                                    placeholder="72"
                                    min="30"
                                    max="200"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">bpm</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Temperature
                                </label>
                                <input
                                    type="number"
                                    name="temperature"
                                    placeholder="36.6"
                                    step="0.1"
                                    min="35"
                                    max="42"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">°C</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Weight
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    placeholder="70"
                                    step="0.1"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">kg</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Height
                                </label>
                                <input
                                    type="number"
                                    name="height"
                                    placeholder="170"
                                    step="0.1"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">cm</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    O₂ Saturation
                                </label>
                                <input
                                    type="number"
                                    name="oxygenSaturation"
                                    placeholder="98"
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">%</p>
                            </div>
                        </div>
                    </div>

                    {/* Follow-up */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Follow-up
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Follow-up Date
                                </label>
                                <input
                                    type="date"
                                    name="followUpDate"
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Follow-up Notes
                                </label>
                                <textarea
                                    name="followUpNotes"
                                    rows={2}
                                    placeholder="Instructions for follow-up visit..."
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
                            {loading ? "Creating..." : "Create Medical Record"}
                        </button>
                        <Link
                            href="/dashboard/medical-records"
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
