import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPatients } from "@/actions/patients";
import Link from "next/link";
import PatientsTable from "@/components/patients/PatientsTable";

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: { search?: string; gender?: string; bloodType?: string };
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    // Fetch patients with search/filter
    const patients = await getPatients({
        search: searchParams.search,
        gender: searchParams.gender as any,
        bloodType: searchParams.bloodType,
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Patient Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                View and manage patient records
                            </p>
                        </div>
                        <Link
                            href="/dashboard/patients/new"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            + Add New Patient
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <form method="GET" className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                name="search"
                                defaultValue={searchParams.search}
                                placeholder="Search by name or email..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            name="gender"
                            defaultValue={searchParams.gender}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Genders</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <select
                            name="bloodType"
                            defaultValue={searchParams.bloodType}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Blood Types</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Search
                        </button>
                        {(searchParams.search || searchParams.gender || searchParams.bloodType) && (
                            <Link
                                href="/dashboard/patients"
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </div>

                {/* Patients Count */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        {patients.length} patient{patients.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Patients Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <PatientsTable patients={patients} />
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
