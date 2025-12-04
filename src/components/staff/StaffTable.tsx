"use client";

import { useRouter } from "next/navigation";

type Staff = {
    id: string;
    department: string | null;
    position: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        role: string;
        isActive: boolean;
    };
};

export default function StaffTable({ staff }: { staff: Staff[] }) {
    const router = useRouter();

    const handleRowClick = (staffId: string) => {
        router.push(`/dashboard/staff/${staffId}`);
    };

    if (staff.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No staff members found</p>
                <p className="text-gray-400 mt-2">Add your first staff member to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Staff Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {staff.map((member) => (
                        <tr
                            key={member.id}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => handleRowClick(member.id)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 font-semibold">
                                            {member.user.firstName[0]}
                                            {member.user.lastName[0]}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {member.user.firstName} {member.user.lastName}
                                        </div>
                                        {!member.user.isActive && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{member.user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.user.role === "NURSE"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}>
                                    {member.user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{member.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{member.position}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a
                                    href={`/dashboard/staff/${member.id}`}
                                    className="text-blue-600 hover:text-blue-900"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View Details
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
