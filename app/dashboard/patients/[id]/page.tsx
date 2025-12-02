import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPatientById } from "@/actions/patients";
import Link from "next/link";
import DeletePatientButton from "@/components/patients/DeletePatientButton";

export default async function PatientDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const patient = await getPatientById(id);

    const calculateAge = (dob: Date) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {patient.user.firstName} {patient.user.lastName}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">Patient Details</p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={`/dashboard/patients/${id}/edit`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Edit Patient
                            </Link>
                            {session.user.role === "ADMIN" && (
                                <DeletePatientButton patientId={id} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Full Name</p>
                                    <p className="font-medium">
                                        {patient.user.firstName} {patient.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{patient.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">
                                        {patient.user.phoneNumber || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date of Birth</p>
                                    <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="font-medium">
                                        {calculateAge(patient.dateOfBirth)} years
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Gender</p>
                                    <p className="font-medium">{patient.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Blood Type</p>
                                    <p className="font-medium">{patient.bloodType || "Not recorded"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.user.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {patient.user.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        {(patient.address ||
                            patient.city ||
                            patient.state ||
                            patient.zipCode) && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Address
                                    </h2>
                                    <p className="text-gray-700">
                                        {patient.address && <span>{patient.address}<br /></span>}
                                        {patient.city && patient.state && (
                                            <span>
                                                {patient.city}, {patient.state} {patient.zipCode}
                                                <br />
                                            </span>
                                        )}
                                        {patient.country}
                                    </p>
                                </div>
                            )}

                        {/* Emergency Contact */}
                        {(patient.emergencyContactName || patient.emergencyContactPhone) && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Emergency Contact
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {patient.emergencyContactName && (
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-medium">{patient.emergencyContactName}</p>
                                        </div>
                                    )}
                                    {patient.emergencyContactPhone && (
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-medium">{patient.emergencyContactPhone}</p>
                                        </div>
                                    )}
                                    {patient.emergencyContactRelation && (
                                        <div>
                                            <p className="text-sm text-gray-600">Relationship</p>
                                            <p className="font-medium">
                                                {patient.emergencyContactRelation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Medical History */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Medical History
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        Allergies
                                    </p>
                                    <p className="text-gray-700">
                                        {patient.allergies || "No known allergies"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        Chronic Conditions
                                    </p>
                                    <p className="text-gray-700">
                                        {patient.chronicConditions || "None recorded"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        Current Medications
                                    </p>
                                    <p className="text-gray-700">
                                        {patient.currentMedications || "None recorded"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Insurance Information */}
                        {(patient.insuranceProvider ||
                            patient.insurancePolicyNumber ||
                            patient.insuranceGroupNumber) && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Insurance
                                    </h2>
                                    <div className="space-y-3">
                                        {patient.insuranceProvider && (
                                            <div>
                                                <p className="text-sm text-gray-600">Provider</p>
                                                <p className="font-medium">{patient.insuranceProvider}</p>
                                            </div>
                                        )}
                                        {patient.insurancePolicyNumber && (
                                            <div>
                                                <p className="text-sm text-gray-600">Policy Number</p>
                                                <p className="font-medium font-mono text-sm">
                                                    {patient.insurancePolicyNumber}
                                                </p>
                                            </div>
                                        )}
                                        {patient.insuranceGroupNumber && (
                                            <div>
                                                <p className="text-sm text-gray-600">Group Number</p>
                                                <p className="font-medium font-mono text-sm">
                                                    {patient.insuranceGroupNumber}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Account Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Account Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Patient ID</p>
                                    <p className="font-medium font-mono text-sm">{id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="font-medium">{formatDate(patient.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="font-medium">{formatDate(patient.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6">
                    <Link
                        href="/dashboard/patients"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Patients List
                    </Link>
                </div>
            </div>
        </div>
    );
}
