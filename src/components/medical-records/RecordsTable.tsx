"use client";

import { useRouter } from "next/navigation";

type MedicalRecord = {
    id: string;
    visitDate: Date;
    diagnosis: string;
    symptoms: string;
    patient: {
        user: {
            firstName: string;
            lastName: string;
        };
    };
    doctor: {
        user: {
            firstName: string;
            lastName: string;
        };
    };
};

export default function RecordsTable({ records }: { records: MedicalRecord[] }) {
    const router = useRouter();

    const handleRowClick = (recordId: string) => {
        router.push(`/dashboard/medical-records/${recordId}`);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (records.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No medical records found</p>
                <p className="text-gray-400 mt-2">Create your first medical record to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Diagnosis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symptoms
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                        <tr
                            key={record.id}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => handleRowClick(record.id)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {formatDate(record.visitDate)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {record.patient.user.firstName} {record.patient.user.lastName}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    Dr. {record.doctor.user.firstName} {record.doctor.user.lastName}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate font-medium">
                                    {record.diagnosis}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                    {record.symptoms}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a
                                    href={`/dashboard/medical-records/${record.id}`}
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
