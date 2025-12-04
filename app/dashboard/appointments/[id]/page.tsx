import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAppointmentById } from "@/actions/appointments";
import Link from "next/link";
import StatusBadge from "@/components/appointments/StatusBadge";
import TypeBadge from "@/components/appointments/TypeBadge";
import StatusUpdateForm from "@/components/appointments/StatusUpdateForm";

export default async function AppointmentDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const appointment = await getAppointmentById(id);

    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

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

    const canEdit = ["ADMIN", "RECEPTIONIST"].includes(session.user.role);
    const canUpdateStatus = ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"].includes(session.user.role);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {formatDateTime(appointment.appointmentDate)}
                            </p>
                        </div>
                        {canEdit && appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED" && (
                            <Link
                                href={`/dashboard/appointments/${id}/edit`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Edit Appointment
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Appointment Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Appointment Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Date & Time</p>
                                    <p className="font-medium">{formatDateTime(appointment.appointmentDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Duration</p>
                                    <p className="font-medium">{appointment.duration} minutes</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Type</p>
                                    <TypeBadge type={appointment.type} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <StatusBadge status={appointment.status} />
                                </div>
                                {appointment.reason && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Reason for Visit</p>
                                        <p className="font-medium">{appointment.reason}</p>
                                    </div>
                                )}
                                {appointment.notes && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Notes</p>
                                        <p className="font-medium">{appointment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Patient Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Patient Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">
                                        {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="font-medium">
                                        {calculateAge(appointment.patient.dateOfBirth)} years
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{appointment.patient.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">
                                        {appointment.patient.user.phoneNumber || "Not provided"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link
                                    href={`/dashboard/patients/${appointment.patientId}`}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    View Patient Profile →
                                </Link>
                            </div>
                        </div>

                        {/* Doctor Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Doctor Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">
                                        Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Specialization</p>
                                    <p className="font-medium">{appointment.doctor.specialization}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{appointment.doctor.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">
                                        {appointment.doctor.user.phoneNumber || "Not provided"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link
                                    href={`/dashboard/doctors/${appointment.doctorId}`}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    View Doctor Profile →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Update */}
                        {canUpdateStatus && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Update Status
                                </h2>
                                <StatusUpdateForm appointmentId={id} currentStatus={appointment.status} />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                            <div className="space-y-3">
                                {canEdit && appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED" && (
                                    <>
                                        <Link
                                            href={`/dashboard/appointments/${id}/edit`}
                                            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                                        >
                                            Edit Appointment
                                        </Link>
                                        <form action={`/dashboard/appointments/${id}/cancel`} method="POST">
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                                            >
                                                Cancel Appointment
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Metadata
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Appointment ID</p>
                                    <p className="font-medium font-mono text-sm">{id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="font-medium">
                                        {new Date(appointment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="font-medium">
                                        {new Date(appointment.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6">
                    <Link
                        href="/dashboard/appointments"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Appointments
                    </Link>
                </div>
            </div>
        </div>
    );
}
