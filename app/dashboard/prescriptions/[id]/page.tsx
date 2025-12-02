import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPrescriptionById } from "@/actions/prescriptions";
import { isExpiringSoon } from "@/lib/prescription-utils";
import Link from "next/link";
import PrescriptionStatusBadge from "@/components/prescriptions/PrescriptionStatusBadge";
import RefillBadge from "@/components/prescriptions/RefillBadge";
import RequestRefillButton from "@/components/prescriptions/RequestRefillButton";

export default async function PrescriptionDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const prescription = await getPrescriptionById(id);

    const formatDate = (date: Date | null) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const isPatient = session.user.role === "PATIENT";
    const canEdit = session.user.role === "ADMIN" ||
        (session.user.role === "DOCTOR" && prescription.doctor.userId === session.user.id);

    const expiringSoon = prescription.endDate ? isExpiringSoon(prescription.endDate) : false;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Prescription Details</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {prescription.medicationName}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <PrescriptionStatusBadge isActive={prescription.isActive} />
                            {prescription.isActive && isPatient && prescription.refillsRemaining > 0 && (
                                <RequestRefillButton prescriptionId={id} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Warnings */}
                        {prescription.isActive && expiringSoon && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-600 text-lg">⚠️</span>
                                    <div>
                                        <p className="font-semibold text-yellow-900">Expiring Soon</p>
                                        <p className="text-sm text-yellow-800">
                                            This prescription will expire on {formatDate(prescription.endDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Medication Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Medication Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Medication Name</p>
                                    <p className="font-medium text-lg">{prescription.medicationName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Dosage</p>
                                    <p className="font-medium">{prescription.dosage}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Frequency</p>
                                    <p className="font-medium">{prescription.frequency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Duration</p>
                                    <p className="font-medium">{prescription.duration}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Quantity</p>
                                    <p className="font-medium">{prescription.quantity} units</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Refills</p>
                                    <RefillBadge refillsRemaining={prescription.refillsRemaining} />
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        {prescription.instructions && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Instructions
                                </h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{prescription.instructions}</p>
                            </div>
                        )}

                        {/* Treatment Period */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Treatment Period
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Prescribed Date</p>
                                    <p className="font-medium">{formatDate(prescription.prescribedDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Start Date</p>
                                    <p className="font-medium">{formatDate(prescription.startDate)}</p>
                                </div>
                                {prescription.endDate && (
                                    <div>
                                        <p className="text-sm text-gray-600">End Date</p>
                                        <p className="font-medium">{formatDate(prescription.endDate)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Patient Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Patient Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">
                                        {prescription.patient.user.firstName} {prescription.patient.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-sm">{prescription.patient.user.email}</p>
                                </div>
                                {prescription.patient.user.phoneNumber && (
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{prescription.patient.user.phoneNumber}</p>
                                    </div>
                                )}
                                <div className="pt-3">
                                    <Link
                                        href={`/dashboard/patients/${prescription.patientId}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                    >
                                        View Patient Profile →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Prescribed By
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Doctor</p>
                                    <p className="font-medium">
                                        Dr. {prescription.doctor.user.firstName} {prescription.doctor.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Specialization</p>
                                    <p className="font-medium">{prescription.doctor.specialization}</p>
                                </div>
                            </div>
                        </div>

                        {/* Prescription Metadata */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Metadata
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Prescription ID</p>
                                    <p className="font-medium font-mono text-xs">{id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="font-medium">
                                        {new Date(prescription.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="font-medium">
                                        {new Date(prescription.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6">
                    <Link
                        href="/dashboard/prescriptions"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Prescriptions
                    </Link>
                </div>
            </div>
        </div>
    );
}
