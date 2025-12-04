import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLabTestById } from "@/actions/lab-tests";
import LabTestStatusBadge from "@/components/lab-tests/LabTestStatusBadge";
import TestTypeBadge from "@/components/lab-tests/TestTypeBadge";
import Link from "next/link";
import {
    BeakerIcon,
    UserIcon,
    CalendarIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default async function LabTestDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const labTest = await getLabTestById(id);

    const canUpdateStatus = ["ADMIN", "NURSE"].includes(session.user.role);
    const canAddResults = ["ADMIN", "DOCTOR", "NURSE"].includes(session.user.role);
    const canCancel = ["ADMIN", "DOCTOR"].includes(session.user.role);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BeakerIcon className="w-8 h-8 text-teal-600" />
                            Lab Test Details
                        </h1>
                        <Link href="/dashboard/lab-tests" className="btn btn-secondary">
                            Back to List
                        </Link>
                    </div>
                </div>

                {/* Test Information Card */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Test Name</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{labTest.testName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Test Type</label>
                            <div className="mt-1">
                                <TestTypeBadge testType={labTest.testType} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <div className="mt-1">
                                <LabTestStatusBadge status={labTest.status} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Ordered Date</label>
                            <p className="text-gray-900 mt-1">
                                {new Date(labTest.orderedDate).toLocaleDateString()} at{" "}
                                {new Date(labTest.orderedDate).toLocaleTimeString()}
                            </p>
                        </div>
                        {labTest.completedDate && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Completed Date</label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(labTest.completedDate).toLocaleDateString()} at{" "}
                                    {new Date(labTest.completedDate).toLocaleTimeString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {labTest.notes && (
                        <div className="mt-6">
                            <label className="text-sm font-medium text-gray-600">Notes / Instructions</label>
                            <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{labTest.notes}</p>
                        </div>
                    )}
                </div>

                {/* Patient Details Card */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                        Patient Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Name</label>
                            <p className="text-gray-900 mt-1">
                                {labTest.patient.user.firstName} {labTest.patient.user.lastName}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="text-gray-900 mt-1">{labTest.patient.user.email}</p>
                        </div>
                        {labTest.patient.user.phoneNumber && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Phone</label>
                                <p className="text-gray-900 mt-1">{labTest.patient.user.phoneNumber}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ordering Doctor Card */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Ordered By</h2>
                    <p className="text-gray-900">
                        Dr. {labTest.doctor.user.firstName} {labTest.doctor.user.lastName}
                    </p>
                </div>

                {/* Results Section */}
                {labTest.status === "COMPLETED" && labTest.results && (
                    <div className="card p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                            Test Results
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Results</label>
                                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {labTest.results}
                                    </pre>
                                </div>
                            </div>

                            {labTest.referenceRange && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Reference Range</label>
                                    <p className="text-gray-900 mt-1 p-3 bg-blue-50 rounded-lg">
                                        {labTest.referenceRange}
                                    </p>
                                </div>
                            )}

                            {labTest.interpretation && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Doctor's Interpretation
                                    </label>
                                    <p className="text-gray-900 mt-1 p-3 bg-green-50 rounded-lg">
                                        {labTest.interpretation}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {labTest.status !== "COMPLETED" && labTest.status !== "CANCELLED" && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                        <div className="flex flex-wrap gap-4">
                            {canAddResults && (
                                <Link
                                    href={`/dashboard/lab-tests/${labTest.id}/results`}
                                    className="btn btn-primary"
                                >
                                    Add/Update Results
                                </Link>
                            )}
                            {canCancel && labTest.status === "PENDING" && (
                                <Link
                                    href={`/dashboard/lab-tests/${labTest.id}/cancel`}
                                    className="btn btn-danger"
                                >
                                    Cancel Test
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
