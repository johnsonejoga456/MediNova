"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAppointmentById, updateAppointment, getDoctorAvailability } from "@/actions/appointments";
import Link from "next/link";
import type { AppointmentType } from "@prisma/client";

export default function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");
    const [appointment, setAppointment] = useState<any>(null);
    const [appointmentId, setAppointmentId] = useState("");
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        async function fetchAppointment() {
            try {
                const resolvedParams = await params;
                setAppointmentId(resolvedParams.id);
                const data = await getAppointmentById(resolvedParams.id);
                setAppointment(data);

                // Set initial date
                const aptDate = new Date(data.appointmentDate);
                setSelectedDate(aptDate.toISOString().split("T")[0]);

                setLoadingData(false);
            } catch (err) {
                setError("Failed to load appointment");
                setLoadingData(false);
            }
        }
        fetchAppointment();
    }, [params]);

    useEffect(() => {
        if (appointment && selectedDate) {
            setLoadingSlots(true);
            getDoctorAvailability(appointment.doctorId, new Date(selectedDate))
                .then((slots) => {
                    setAvailableSlots(slots);
                    setLoadingSlots(false);
                })
                .catch(() => setLoadingSlots(false));
        }
    }, [selectedDate, appointment]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const selectedSlotIndex = formData.get("timeSlot");

        let appointmentDate = appointment.appointmentDate;
        if (selectedSlotIndex !== null) {
            const slot = availableSlots[parseInt(selectedSlotIndex as string)];
            appointmentDate = slot.date;
        }

        const data = {
            appointmentDate,
            duration: parseInt(formData.get("duration") as string),
            type: formData.get("type") as AppointmentType,
            reason: formData.get("reason") as string || undefined,
            notes: formData.get("notes") as string || undefined,
        };

        const result = await updateAppointment(appointmentId, data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push(`/dashboard/appointments/${appointmentId}`);
            router.refresh();
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading appointment...</p>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 text-lg">Appointment not found</p>
                    <Link href="/dashboard/appointments" className="mt-4 text-blue-600 hover:text-blue-700">
                        ← Back to Appointments
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Appointment</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Update appointment details for {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Date & Time */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Date & Time
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Appointment Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Available Time Slots
                                    </label>
                                    {loadingSlots ? (
                                        <p className="text-gray-500">Loading available slots...</p>
                                    ) : (
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                            {availableSlots
                                                .filter((slot) => slot.available)
                                                .map((slot, index) => (
                                                    <label
                                                        key={index}
                                                        className="flex items-center justify-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-500"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="timeSlot"
                                                            value={availableSlots.indexOf(slot)}
                                                            className="sr-only"
                                                        />
                                                        <span className="text-sm">{slot.time}</span>
                                                    </label>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Appointment Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type *
                                </label>
                                <select
                                    name="type"
                                    required
                                    defaultValue={appointment.type}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="CONSULTATION">Consultation</option>
                                    <option value="FOLLOW_UP">Follow-up</option>
                                    <option value="EMERGENCY">Emergency</option>
                                    <option value="SURGERY">Surgery</option>
                                    <option value="LAB_TEST">Lab Test</option>
                                    <option value="VACCINATION">Vaccination</option>
                                    <option value="THERAPY">Therapy</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (minutes) *
                                </label>
                                <select
                                    name="duration"
                                    required
                                    defaultValue={appointment.duration}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Visit
                                </label>
                                <input
                                    type="text"
                                    name="reason"
                                    defaultValue={appointment.reason || ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    rows={3}
                                    defaultValue={appointment.notes || ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <Link
                            href={`/dashboard/appointments/${appointmentId}`}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
