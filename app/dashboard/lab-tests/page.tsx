import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLabTests } from "@/actions/lab-tests";
import LabTestsTable from "@/components/lab-tests/LabTestsTable";
import Link from "next/link";
import { BeakerIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

export default async function LabTestsPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const labTests = await getLabTests();

    // Calculate stats
    const totalTests = labTests.length;
    const pendingTests = labTests.filter((t) => t.status === "PENDING").length;
    const inProgressTests = labTests.filter((t) => t.status === "IN_PROGRESS").length;
    const completedTests = labTests.filter((t) => t.status === "COMPLETED").length;

    const canOrderTests = ["ADMIN", "DOCTOR"].includes(session.user.role);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BeakerIcon className="w-8 h-8 text-teal-600" />
                            Laboratory Tests
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {session.user.role === "PATIENT"
                                ? "View your laboratory test results"
                                : "Manage laboratory tests and results"}
                        </p>
                    </div>
                    {canOrderTests && (
                        <Link
                            href="/dashboard/lab-tests/order"
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            Order New Test
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{totalTests}</p>
                            </div>
                            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                                <BeakerIcon className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{pendingTests}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{inProgressTests}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{completedTests}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tests Table */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {session.user.role === "PATIENT" ? "My Lab Tests" : "All Lab Tests"}
                    </h2>
                    <LabTestsTable labTests={labTests} />
                </div>
            </div>
        </div>
    );
}
