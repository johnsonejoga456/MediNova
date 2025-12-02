import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStaff } from "@/actions/staff";
import Link from "next/link";
import StaffTable from "@/components/staff/StaffTable";

export default async function StaffPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; department?: string; role?: string }>;
}) {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const params = await searchParams;

    // Fetch staff with search/filter
    const staff = await getStaff({
        search: params.search,
        department: params.department,
        role: params.role,
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Staff Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage nurses and receptionists
                            </p>
                        </div>
                        <Link
                            href="/dashboard/staff/new"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            + Add New Staff
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
                                defaultValue={params.search}
                                placeholder="Search by name, email, or department..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            name="department"
                            defaultValue={params.department}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Departments</option>
                            <option value="Administration">Administration</option>
                            <option value="Emergency">Emergency</option>
                            <option value="ICU">ICU (Intensive Care Unit)</option>
                            <option value="Laboratory">Laboratory</option>
                            <option value="Nursing">Nursing</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Radiology">Radiology</option>
                            <option value="Reception">Reception</option>
                            <option value="Surgery">Surgery</option>
                        </select>
                        <select
                            name="role"
                            defaultValue={params.role}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Roles</option>
                            <option value="NURSE">Nurse</option>
                            <option value="RECEPTIONIST">Receptionist</option>
                        </select>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Search
                        </button>
                        {(params.search || params.department || params.role) && (
                            <Link
                                href="/dashboard/staff"
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </div>

                {/* Staff Count */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        {staff.length} staff member{staff.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Staff Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <StaffTable staff={staff} />
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
