import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDoctorById } from "@/actions/doctors";
import Link from "next/link";
import DeleteDoctorButton from "@/components/doctors/DeleteDoctorButton";

export default async function DoctorDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const doctor = await getDoctorById(id);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dr. {doctor.user.firstName} {doctor.user.lastName}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">Doctor Details</p>
                        </div>
                        <div className="flex gap-3">
                            {session.user.role === "ADMIN" && (
                                <>
                                    <Link
                                        href={`/dashboard/doctors/${id}/edit`}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Edit Doctor
                                    </Link>
                                    <DeleteDoctorButton doctorId={id} />
                                </>
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
                                        Dr. {doctor.user.firstName} {doctor.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{doctor.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">
                                        {doctor.user.phoneNumber || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doctor.user.isActive
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {doctor.user.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Professional Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Specialization</p>
                                    <p className="font-medium">{doctor.specialization}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">License Number</p>
                                    <p className="font-medium font-mono">{doctor.licenseNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Qualification</p>
                                    <p className="font-medium">{doctor.qualification}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Years of Experience</p>
                                    <p className="font-medium">
                                        {doctor.experienceYears
                                            ? `${doctor.experienceYears} years`
                                            : "Not specified"}
                                    </p>
                                </div>
                            </div>
                            {doctor.bio && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-1">Bio</p>
                                    <p className="text-gray-700">{doctor.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statistics */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Statistics
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Total Appointments</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {doctor._count.appointments}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Medical Records</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {doctor._count.medicalRecords}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Prescriptions</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {doctor._count.prescriptions}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Account Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Doctor ID</p>
                                    <p className="font-medium font-mono text-sm">{id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="font-medium">
                                        {new Date(doctor.user.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="font-medium">
                                        {new Date(doctor.user.updatedAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6">
                    <Link
                        href="/dashboard/doctors"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Doctors List
                    </Link>
                </div>
            </div>
        </div>
    );
}
