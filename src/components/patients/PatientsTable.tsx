"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type Patient = {
    id: string;
    dateOfBirth: Date;
    gender: string;
    bloodType: string | null;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        isActive: boolean;
    };
};

export default function PatientsTable({ patients }: { patients: Patient[] }) {
    const router = useRouter();

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

    const handleRowClick = (patientId: string) => {
        router.push(`/dashboard/patients/${patientId}`);
    };

    if (patients.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No patients found</p>
                <p className="text-gray-400 mt-2">Add your first patient to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Blood Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                        <tr
                            key={patient.id}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => handleRowClick(patient.id)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">
                                            {patient.user.firstName[0]}
                                            {patient.user.lastName[0]}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {patient.user.firstName} {patient.user.lastName}
                                        </div>
                                        {!patient.user.isActive && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{patient.user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {calculateAge(patient.dateOfBirth)} years
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{patient.gender}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {patient.bloodType || "N/A"}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {patient.user.phoneNumber || "N/A"}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                    href={`/dashboard/patients/${patient.id}`}
                                    className="text-blue-600 hover:text-blue-900"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View Details
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
