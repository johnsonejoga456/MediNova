import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStaffById } from "@/actions/staff";
import Link from "next/link";
import DeleteStaffButton from "@/components/staff/DeleteStaffButton";

export default async function StaffDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const { id } = await params;
    const staff = await getStaffById(id);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {staff.user.firstName} {staff.user.lastName}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">Staff Details</p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={`/dashboard/staff/${id}/edit`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Edit Staff
                            </Link>
                            <DeleteStaffButton staffId={id} />
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
                                        {staff.user.firstName} {staff.user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{staff.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">
                                        {staff.user.phoneNumber || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.user.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {staff.user.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Work Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Work Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Role</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.user.role === "NURSE"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-green-100 text-green-800"
                                        }`}>
                                        {staff.user.role}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Department</p>
                                    <p className="font-medium">{staff.department}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Position</p>
                                    <p className="font-medium">{staff.position}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Account Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Staff ID</p>
                                    <p className="font-medium font-mono text-sm">{id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="font-medium">
                                        {new Date(staff.user.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="font-medium">
                                        {new Date(staff.user.updatedAt).toLocaleDateString("en-US", {
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
                        href="/dashboard/staff"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Staff List
                    </Link>
                </div>
            </div>
        </div>
    );
}
