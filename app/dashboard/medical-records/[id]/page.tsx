import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMedicalRecordById } from "@/actions/medical-records";
import Link from "next/link";
import VitalSignsDisplay from "@/components/medical-records/VitalSignsDisplay";
import SOAPNotesDisplay from "@/components/medical-records/SOAPNotesDisplay";

export default async function MedicalRecordDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const record = await getMedicalRecordById(id);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const canEdit = session.user.role === "ADMIN" ||
        (session.user.role === "DOCTOR" && record.doctor.userId === session.user.id);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Medical Record</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {formatDate(record.visitDate)}
                            </p>
                        </div>
                        {canEdit && (
                            <Link
                                href={`/dashboard/medical-records/${id}/edit`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Edit Record
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Record Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Record Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Visit Date</p>
                                    <p className="font-medium">{formatDate(record.visitDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Primary Diagnosis</p>
                                    <p className="font-medium text-blue-600">{record.diagnosis}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Symptoms</p>
                                    <p className="font-medium">{record.symptoms}</p>
                                </div>
                            </div>
                        </div>

                        {/* SOAP Notes */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                SOAP Notes
                            </h2>
                            <SOAPNotesDisplay
                                subjective={record.subjective}
                                objective={record.objective}
                                assessment={record.assessment}
                                plan={record.plan}
                            />
                        </div>

                        {/* Vital Signs */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Vital Signs
                            </h2>
                            <VitalSignsDisplay vitalSignsJson={record.vitalSigns} />
                        </div>

                        {/* Follow-up */}
                        {(record.followUpDate || record.followUpNotes) && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Follow-up
                                </h2>
                                <div className="space-y-3">
                                    {record.followUpDate && (
                                        <div>
                                            <p className="text-sm text-gray-600">Follow-up Date</p>
                                            <p className="font-medium">{formatDate(record.followUpDate)}</p>
                                        </div>
                                    )}
                                    {record.followUpNotes && (
                                        <div>
                                            <p className="text-sm text-gray-600">Follow-up Notes</p>
                                            <p className="font-medium">{record.followUpNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
                                        {record.patient.user.firstName} {record.patient.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-sm">{record.patient.user.email}</p>
                                </div>
                                {record.patient.user.phoneNumber && (
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{record.patient.user.phoneNumber}</p>
                                    </div>
                                )}
                                <div className="pt-3">
                                    <Link
                                        href={`/dashboard/patients/${record.patientId}`}
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
                                Doctor Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">
                                        Dr. {record.doctor.user.firstName} {record.doctor.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Specialization</p>
                                    <p className="font-medium">{record.doctor.specialization}</p>
                                </div>
                            </div>
                        </div>

                        {/* Record Metadata */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Metadata
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Record ID</p>
                                    <p className="font-medium font-mono text-xs">{id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="font-medium">
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="font-medium">
                                        {new Date(record.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6">
                    <Link
                        href="/dashboard/medical-records"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Medical Records
                    </Link>
                </div>
            </div>
        </div>
    );
}
