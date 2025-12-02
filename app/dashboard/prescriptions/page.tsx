import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPrescriptions } from "@/actions/prescriptions";
import Link from "next/link";
import PrescriptionsTable from "@/components/prescriptions/PrescriptionsTable";

export default async function PrescriptionsPage({
    searchParams,
}: {
    searchParams: Promise<{
        isActive?: string;
    }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const params = await searchParams;

    // Parse filters
    const filters: any = {};
    if (params.isActive) filters.isActive = params.isActive === "true";

    const prescriptions = await getPrescriptions(filters);

    // Only doctors and admins can create prescriptions
    const canCreate = ["ADMIN", "DOCTOR"].includes(session.user.role);

    // Count stats
    const activeCount = prescriptions.filter((p) => p.isActive).length;
    const needsRefillCount = prescriptions.filter((p) => p.isActive && p.refillsRemaining <= 2).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {session.user.role === "PATIENT"
                                    ? "Your medication prescriptions"
                                    : "Patient medication prescriptions"}
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href="/dashboard/prescriptions/new"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                + New Prescription
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Prescriptions</p>
                                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💊</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Needs Refill</p>
                                <p className="text-2xl font-bold text-yellow-600">{needsRefillCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard/prescriptions"
                            className={`px-4 py-2 rounded-lg font-medium transition ${!params.isActive
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            All
                        </Link>
                        <Link
                            href="/dashboard/prescriptions?isActive=true"
                            className={`px-4 py-2 rounded-lg font-medium transition ${params.isActive === "true"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Active Only
                        </Link>
                        <Link
                            href="/dashboard/prescriptions?isActive=false"
                            className={`px-4 py-2 rounded-lg font-medium transition ${params.isActive === "false"
                                    ? "bg-gray-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Inactive Only
                        </Link>
                    </div>
                </div>

                {/* Prescriptions Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <PrescriptionsTable prescriptions={prescriptions} />
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
