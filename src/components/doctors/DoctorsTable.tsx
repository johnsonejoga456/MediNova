"use client";

import { useRouter } from "next/navigation";

type Doctor = {
    id: string;
    specialization: string;
    licenseNumber: string;
    experienceYears: number | null;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        isActive: boolean;
    };
    _count: {
        appointments: number;
    };
};

export default function DoctorsTable({ doctors }: { doctors: Doctor[] }) {
    const router = useRouter();

    const handleRowClick = (doctorId: string) => {
        router.push(`/dashboard/doctors/${doctorId}`);
    };

    if (doctors.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No doctors found</p>
                <p className="text-gray-400 mt-2">Add your first doctor to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Specialization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            License Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Experience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Appointments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {doctors.map((doctor) => (
                        <tr
                            key={doctor.id}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => handleRowClick(doctor.id)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 font-semibold">
                                            {doctor.user.firstName[0]}
                                            {doctor.user.lastName[0]}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                                        </div>
                                        {!doctor.user.isActive && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{doctor.user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{doctor.specialization}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-mono">{doctor.licenseNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {doctor.experienceYears ? `${doctor.experienceYears} years` : "N/A"}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{doctor._count.appointments}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a
                                    href={`/dashboard/doctors/${doctor.id}`}
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
