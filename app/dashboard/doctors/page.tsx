import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDoctors } from "@/actions/doctors";
import Link from "next/link";
import DoctorsTable from "@/components/doctors/DoctorsTable";

export default async function DoctorsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; specialization?: string }>;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const params = await searchParams;

    // Fetch doctors with search/filter
    const doctors = await getDoctors({
        search: params.search,
        specialization: params.specialization,
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Doctor Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                View and manage doctors in the system
                            </p>
                        </div>
                        {session.user.role === "ADMIN" && (
                            <Link
                                href="/dashboard/doctors/new"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                + Add New Doctor
                            </Link>
                        )}
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
                                placeholder="Search by name, email, or specialization..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            name="specialization"
                            defaultValue={params.specialization}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Specializations</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Emergency Medicine">Emergency Medicine</option>
                            <option value="Family Medicine">Family Medicine</option>
                            <option value="Internal Medicine">Internal Medicine</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Obstetrics and Gynecology">Obstetrics and Gynecology</option>
                            <option value="Oncology">Oncology</option>
                            <option value="Ophthalmology">Ophthalmology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Psychiatry">Psychiatry</option>
                            <option value="Radiology">Radiology</option>
                            <option value="Surgery">Surgery</option>
                            <option value="Urology">Urology</option>
                        </select>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Search
                        </button>
                        {(params.search || params.specialization) && (
                            <Link
                                href="/dashboard/doctors"
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </div>

                {/* Doctors Count */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Doctors Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <DoctorsTable doctors={doctors} />
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
