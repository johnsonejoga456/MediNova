"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTestResults, getLabTestById } from "@/actions/lab-tests";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default function AddResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [testId, setTestId] = useState("");
    const [labTest, setLabTest] = useState<any>(null);
    const [formData, setFormData] = useState({
        results: "",
        interpretation: "",
        referenceRange: "",
        attachments: "",
    });

    useEffect(() => {
        const fetchTest = async () => {
            const { id } = await params;
            setTestId(id);
            try {
                const test = await getLabTestById(id);
                setLabTest(test);
                // Pre-fill if results exist
                if (test.results) {
                    setFormData({
                        results: test.results || "",
                        interpretation: test.interpretation || "",
                        referenceRange: test.referenceRange || "",
                        attachments: test.attachments || "",
                    });
                }
            } catch (err) {
                console.error("Error loading test:", err);
            }
        };
        fetchTest();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.results.trim()) {
            setError("Please enter test results");
            return;
        }

        startTransition(async () => {
            const result = await addTestResults(testId, formData);

            if (result.error) {
                setError(result.error);
            } else {
                router.push(`/dashboard/lab-tests/${testId}`);
                router.refresh();
            }
        });
    };

    if (!labTest) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="skeleton h-12 w-12 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <DocumentTextIcon className="w-8 h-8 text-teal-600" />
                        Add/Update Test Results
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Test: {labTest.testName} for {labTest.patient.user.firstName}{" "}
                        {labTest.patient.user.lastName}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Test Results */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Test Results *
                        </label>
                        <textarea
                            value={formData.results}
                            onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                            rows={8}
                            className="input font-mono"
                            placeholder="Enter test results here..."
                            required
                            disabled={isPending}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Enter results in a clear, structured format
                        </p>
                    </div>

                    {/* Reference Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Reference Range
                        </label>
                        <input
                            type="text"
                            value={formData.referenceRange}
                            onChange={(e) =>
                                setFormData({ ...formData, referenceRange: e.target.value })
                            }
                            className="input"
                            placeholder="e.g., Normal: 4.5-11.0 x10^9/L"
                            disabled={isPending}
                        />
                    </div>

                    {/* Interpretation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Doctor's Interpretation
                        </label>
                        <textarea
                            value={formData.interpretation}
                            onChange={(e) =>
                                setFormData({ ...formData, interpretation: e.target.value })
                            }
                            rows={4}
                            className="input"
                            placeholder="Clinical interpretation and recommendations..."
                            disabled={isPending}
                        />
                    </div>

                    {/* Attachments (Future: File Upload) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Attachments (JSON)
                        </label>
                        <textarea
                            value={formData.attachments}
                            onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                            rows={2}
                            className="input font-mono text-sm"
                            placeholder='{"files": []}'
                            disabled={isPending}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            JSON format for file URLs (file upload feature coming soon)
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Submitting results will automatically mark the test as
                            COMPLETED.
                        </p>
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
                                    Saving Results...
                                </span>
                            ) : (
                                "Save Results & Mark Complete"
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
