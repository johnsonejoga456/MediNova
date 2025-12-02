"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAppointment, getDoctorAvailability } from "@/actions/appointments";
import Link from "next/link";
import type { AppointmentType } from "@prisma/client";

export default function NewAppointmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        // Fetch patients and doctors
        async function fetchData() {
            try {
                const [patientsRes, doctorsRes] = await Promise.all([
                    fetch("/api/patients").then((r) => r.json()),
                    fetch("/api/doctors").then((r) => r.json()),
                ]);
                setPatients(Array.isArray(patientsRes) ? patientsRes : []);
                setDoctors(Array.isArray(doctorsRes) ? doctorsRes : []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setPatients([]);
                setDoctors([]);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            setLoadingSlots(true);
            getDoctorAvailability(selectedDoctor, new Date(selectedDate))
                .then((slots) => {
                    setAvailableSlots(slots);
                    setLoadingSlots(false);
                })
                .catch(() => setLoadingSlots(false));
        }
    }, [selectedDoctor, selectedDate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const selectedSlotIndex = parseInt(formData.get("timeSlot") as string);
        const slot = availableSlots[selectedSlotIndex];

        const data = {
            patientId: formData.get("patientId") as string,
            doctorId: formData.get("doctorId") as string,
            appointmentDate: slot.date,
            duration: parseInt(formData.get("duration") as string),
            type: formData.get("type") as AppointmentType,
            reason: formData.get("reason") as string || undefined,
            notes: formData.get("notes") as string || undefined,
        };

        const result = await createAppointment(data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Appointment Booked!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            The appointment has been successfully scheduled.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/appointments")}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            View Appointments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Schedule a new appointment for a patient
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Patient Selection */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Patient Information
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Patient *
                            </label>
                            <select
                                name="patientId"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select a patient</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.user.firstName} {patient.user.lastName} - {patient.user.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Doctor & Date Selection */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Doctor & Schedule
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Doctor *
                                </label>
                                <select
                                    name="doctorId"
                                    required
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Appointment Date *
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Time Slots */}
                        {selectedDoctor && selectedDate && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Time Slots *
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
                                                        required
                                                        className="sr-only"
                                                    />
                                                    <span className="text-sm">{slot.time}</span>
                                                </label>
                                            ))}
                                    </div>
                                )}
                                {availableSlots.length > 0 &&
                                    !availableSlots.some((s) => s.available) && (
                                        <p className="text-red-600">No available slots for this date</p>
                                    )}
                            </div>
                        )}
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select type</option>
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
                                    defaultValue="30"
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
                                    placeholder="e.g., Annual checkup, Flu symptoms"
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
                                    placeholder="Additional notes or instructions..."
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
                            {loading ? "Booking..." : "Book Appointment"}
                        </button>
                        <Link
                            href="/dashboard/appointments"
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
