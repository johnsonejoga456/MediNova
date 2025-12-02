import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMedicalRecords } from "@/actions/medical-records";
import Link from "next/link";
import RecordsTable from "@/components/medical-records/RecordsTable";

export default async function MedicalRecordsPage({
    searchParams,
}: {
    searchParams: Promise<{
        patientId?: string;
        doctorId?: string;
        startDate?: string;
        endDate?: string;
    }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const params = await searchParams;

    // Parse filters
    const filters: any = {};
    if (params.patientId) filters.patientId = params.patientId;
    if (params.doctorId) filters.doctorId = params.doctorId;
    if (params.startDate) filters.startDate = new Date(params.startDate);
    if (params.endDate) filters.endDate = new Date(params.endDate);

    const records = await getMedicalRecords(filters);

    // Only doctors and admins can create records
    const canCreate = ["ADMIN", "DOCTOR"].includes(session.user.role);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {session.user.role === "PATIENT"
                                    ? "Your complete medical history"
                                    : "Patient medical records and visit notes"}
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href="/dashboard/medical-records/new"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                + New Record
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            {session.user.role !== "PATIENT" && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <form method="GET" className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    defaultValue={params.startDate}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    defaultValue={params.endDate}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Filter
                                </button>
                            </div>
                            <div className="flex items-end">
                                {(params.startDate || params.endDate) && (
                                    <Link
                                        href="/dashboard/medical-records"
                                        className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-center"
                                    >
                                        Clear
                                    </Link>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Records Count */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <p className="text-gray-600">
                        {records.length} medical record{records.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <RecordsTable records={records} />
                </div>

                {/* Back to Dashboard */}
                <div className="mt-6">
                    <Link
                        href="/dashboard"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
