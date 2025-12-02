"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/auth/login" });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Healthcare System
                            </h1>
                            <p className="text-sm text-gray-500">
                                Welcome back, {session.user?.email}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        🎉 Welcome to Your Dashboard!
                    </h2>
                    <p className="text-gray-600">
                        Your authentication is working perfectly. This is your personalized dashboard.
                    </p>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Your Profile Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-gray-600 font-medium">Email:</span>
                            <span className="text-gray-900">{session.user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-gray-600 font-medium">Role:</span>
                            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                {session.user?.role}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-gray-600 font-medium">User ID:</span>
                            <span className="text-gray-900 text-sm font-mono">
                                {session.user?.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Role-Specific Content */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {session.user?.role === "ADMIN" && "Admin Dashboard"}
                        {session.user?.role === "DOCTOR" && "Doctor Dashboard"}
                        {session.user?.role === "PATIENT" && "Patient Dashboard"}
                        {session.user?.role === "NURSE" && "Nurse Dashboard"}
                        {session.user?.role === "RECEPTIONIST" && "Receptionist Dashboard"}
                    </h3>

                    {session.user?.role === "ADMIN" && (
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                As an admin, you have full access to the system.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <a href="/dashboard/patients" className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-blue-900">Patient Management</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Manage patient records
                                    </p>
                                </a>
                                <a href="/dashboard/doctors" className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-green-900">Doctor Management</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Manage doctors and specializations
                                    </p>
                                </a>
                                <a href="/dashboard/staff" className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-purple-900">Staff Management</h4>
                                    <p className="text-sm text-purple-700 mt-1">
                                        Manage nurses and receptionists
                                    </p>
                                </a>
                                <a href="/dashboard/appointments" className="p-4 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-teal-900">Appointments</h4>
                                    <p className="text-sm text-teal-700 mt-1">
                                        Manage all appointments
                                    </p>
                                </a>
                                <a href="/dashboard/medical-records" className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-purple-900">Medical Records</h4>
                                    <p className="text-sm text-purple-700 mt-1">
                                        View all patient medical records
                                    </p>
                                </a>
                                <a href="/dashboard/prescriptions" className="p-4 bg-pink-50 rounded-lg border border-pink-200 hover:bg-pink-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-pink-900">Prescriptions</h4>
                                    <p className="text-sm text-pink-700 mt-1">
                                        View all patient prescriptions
                                    </p>
                                </a>
                            </div>
                        </div>
                    )}

                    {session.user?.role === "DOCTOR" && (
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Welcome, Doctor! Manage your patients and appointments here.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <a href="/dashboard/patients" className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-blue-900">My Patients</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        View and manage your patients
                                    </p>
                                </a>
                                <a href="/dashboard/appointments" className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-green-900">My Schedule</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Today's appointments and upcoming schedule
                                    </p>
                                </a>
                                <a href="/dashboard/medical-records" className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition cursor-pointer">
                                    <h4 className="font-semibold text-purple-900">Medical Records</h4>
                                    <p className="text-sm text-purple-700 mt-1">
                                        Create and view patient records
                                    </p>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-2xl font-bold text-green-600">Active</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Authentication</p>
                                <p className="text-2xl font-bold text-blue-600">Secured</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🔒</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Database</p>
                                <p className="text-2xl font-bold text-purple-600">Connected</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🗄️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
