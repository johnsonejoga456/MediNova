"use client";

import { useRouter } from "next/navigation";
import PrescriptionStatusBadge from "./PrescriptionStatusBadge";
import RefillBadge from "./RefillBadge";

type Prescription = {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    refillsRemaining: number;
    isActive: boolean;
    prescribedDate: Date;
    startDate: Date;
    endDate: Date | null;
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

export default function PrescriptionsTable({ prescriptions }: { prescriptions: Prescription[] }) {
    const router = useRouter();

    const handleRowClick = (prescriptionId: string) => {
        router.push(`/dashboard/prescriptions/${prescriptionId}`);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (prescriptions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No prescriptions found</p>
                <p className="text-gray-400 mt-2">Create your first prescription to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prescribed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Medication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dosage & Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Refills
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {prescriptions.map((prescription) => (
                        <tr
                            key={prescription.id}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => handleRowClick(prescription.id)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {formatDate(prescription.prescribedDate)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {prescription.patient.user.firstName} {prescription.patient.user.lastName}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    Dr. {prescription.doctor.user.firstName} {prescription.doctor.user.lastName}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{prescription.medicationName}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-600">
                                    {prescription.dosage} - {prescription.frequency}
                                </div>
                                <div className="text-xs text-gray-500">{prescription.duration}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <RefillBadge refillsRemaining={prescription.refillsRemaining} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <PrescriptionStatusBadge isActive={prescription.isActive} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a
                                    href={`/dashboard/prescriptions/${prescription.id}`}
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
