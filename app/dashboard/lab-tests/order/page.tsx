"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { orderLabTest } from "@/actions/lab-tests";
import { BeakerIcon } from "@heroicons/react/24/outline";

// Pre-defined test catalog
const TEST_CATALOG = {
    BLOOD: [
        "Complete Blood Count (CBC)",
        "Blood Glucose",
        "Lipid Panel",
        "Liver Function Test",
        "Kidney Function Test",
        "Thyroid Panel (TSH, T3, T4)",
        "Iron Studies",
        "Vitamin D",
        "HbA1c",
    ],
    URINE: [
        "Urinalysis",
        "Urine Culture",
        "24-Hour Urine Collection",
        "Drug Screen",
        "Microalbumin Test",
    ],
    IMAGING: [
        "Chest X-Ray",
        "Abdominal Ultrasound",
        "CT Scan",
        "MRI",
        "Mammogram",
        "DEXA Scan (Bone Density)",
    ],
    CARDIOLOGY: [
        "ECG/EKG",
        "Echocardiogram",
        "Stress Test",
        "Holter Monitor",
    ],
    BIOPSY: [
        "Tissue Biopsy",
        "Bone Marrow Biopsy",
        "Skin Biopsy",
    ],
    OTHER: [
        "Allergy Test",
        "Sleep Study",
        "Pulmonary Function Test",
    ],
};

export default function OrderLabTestPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        patientId: "",
        testType: "",
        testName: "",
        priority: "NORMAL" as "NORMAL" | "URGENT",
        notes: "",
    });

    const [patients, setPatients] = useState<any[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);

    // Fetch patients on component mount
    useState(() => {
        const fetchPatients = async () => {
            setLoadingPatients(true);
            try {
                const response = await fetch("/api/patients");
                const data = await response.json();
                setPatients(data);
            } catch (err) {
                console.error("Error loading patients:", err);
            } finally {
                setLoadingPatients(false);
            }
        };
        fetchPatients();
    });

    const availableTests = formData.testType
        ? TEST_CATALOG[formData.testType as keyof typeof TEST_CATALOG] || []
        : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.patientId || !formData.testType || !formData.testName) {
            setError("Please fill in all required fields");
            return;
        }

        startTransition(async () => {
            const result = await orderLabTest(formData);

            if (result.error) {
                setError(result.error);
            } else {
                router.push("/dashboard/lab-tests");
                router.refresh();
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BeakerIcon className="w-8 h-8 text-teal-600" />
                        Order Lab Test
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Request laboratory tests for your patients
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Patient *
                        </label>
                        <select
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            className="input"
                            required
                            disabled={isPending || loadingPatients}
                        >
                            <option value="">
                                {loadingPatients ? "Loading patients..." : "Select a patient"}
                            </option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.user.firstName} {patient.user.lastName} ({patient.user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Test Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Test Type *
                        </label>
                        <select
                            value={formData.testType}
                            onChange={(e) =>
                                setFormData({ ...formData, testType: e.target.value, testName: "" })
                            }
                            className="input"
                            required
                            disabled={isPending}
                        >
                            <option value="">Select test type</option>
                            <option value="BLOOD">Blood Test</option>
                            <option value="URINE">Urine Test</option>
                            <option value="IMAGING">Imaging</option>
                            <option value="CARDIOLOGY">Cardiology</option>
                            <option value="BIOPSY">Biopsy</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Test Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Specific Test *
                        </label>
                        <select
                            value={formData.testName}
                            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                            className="input"
                            required
                            disabled={isPending || !formData.testType}
                        >
                            <option value="">
                                {formData.testType ? "Select specific test" : "First select test type"}
                            </option>
                            {availableTests.map((test) => (
                                <option key={test} value={test}>
                                    {test}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    priority: e.target.value as "NORMAL" | "URGENT",
                                })
                            }
                            className="input"
                            disabled={isPending}
                        >
                            <option value="NORMAL">Normal</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Notes / Instructions
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={4}
                            className="input"
                            placeholder="Any special instructions or clinical notes..."
                            disabled={isPending}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Ordering Test...
                                </span>
                            ) : (
                                "Order Test"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-secondary"
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
