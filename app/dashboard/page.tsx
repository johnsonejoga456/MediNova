"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    UserGroupIcon,
    UserIcon,
    CalendarIcon,
    ClipboardDocumentListIcon,
    BeakerIcon,
    HeartIcon,
    ArrowRightOnRectangleIcon,
    BanknotesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

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
                    <div className="skeleton h-12 w-12 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
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
                            <h1 className="text-2xl font-bold text-gradient-primary">
                                Healthcare System
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Welcome back, {session.user?.email}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white btn-danger rounded-lg transition"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Card */}
                <div className="card p-6 mb-6 gradient-primary">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                            <HeartIcon className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-1">Welcome to Your Dashboard</h2>
                            <p className="text-blue-100">
                                {session.user?.role === "ADMIN" && "Complete system oversight at your fingertips"}
                                {session.user?.role === "DOCTOR" && "Manage your patients and appointments efficiently"}
                                {session.user?.role === "PATIENT" && "Your health information in one place"}
                                {session.user?.role === "NURSE" && "Patient care coordination made easy"}
                                {session.user?.role === "RECEPTIONIST" && "Streamlined appointment management"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Role-Specific Dashboard Cards */}
                {session.user?.role === "ADMIN" && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DashboardCard
                                href="/dashboard/patients"
                                title="Patient Management"
                                description="Manage all patient records and information"
                                Icon={UserIcon}
                                gradient="from-blue-500 to-blue-600"
                            />
                            <DashboardCard
                                href="/dashboard/doctors"
                                title="Doctor Management"
                                description="Manage doctors and specializations"
                                Icon={UserGroupIcon}
                                gradient="from-teal-500 to-teal-600"
                            />
                            <DashboardCard
                                href="/dashboard/staff"
                                title="Staff Management"
                                description="Manage nurses and receptionists"
                                Icon={UserGroupIcon}
                                gradient="from-purple-500 to-purple-600"
                            />
                            <DashboardCard
                                href="/dashboard/appointments"
                                title="Appointments"
                                description="View and manage all appointments"
                                Icon={CalendarIcon}
                                gradient="from-green-500 to-green-600"
                            />
                            <DashboardCard
                                href="/dashboard/lab-tests"
                                title="Laboratory Tests"
                                description="Manage all laboratory tests and results"
                                Icon={BeakerIcon}
                                gradient="from-cyan-500 to-cyan-600"
                            />
                            <DashboardCard
                                href="/dashboard/medical-records"
                                title="Medical Records"
                                description="Access all patient medical records"
                                Icon={ClipboardDocumentListIcon}
                                gradient="from-indigo-500 to-indigo-600"
                            />
                            <DashboardCard
                                href="/dashboard/billing/invoices"
                                title="Billing & Invoices"
                                description="Manage invoices and track payments"
                                Icon={BanknotesIcon}
                                gradient="from-emerald-500 to-emerald-600"
                            />
                            <DashboardCard
                                href="/dashboard/prescriptions"
                                title="Prescriptions"
                                description="View all patient prescriptions"
                                Icon={BeakerIcon}
                                gradient="from-pink-500 to-pink-600"
                            />
                        </div>
                    </div>
                )}

                {session.user?.role === "DOCTOR" && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tools</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DashboardCard
                                href="/dashboard/appointments"
                                title="My Appointments"
                                description="View and manage your appointments"
                                Icon={CalendarIcon}
                                gradient="from-blue-500 to-blue-600"
                            />
                            <DashboardCard
                                href="/dashboard/patients"
                                title="My Patients"
                                description="Access your patient records"
                                Icon={UserIcon}
                                gradient="from-teal-500 to-teal-600"
                            />
                            <DashboardCard
                                href="/dashboard/lab-tests/order"
                                title="Order Lab Tests"
                                description="Request laboratory tests for patients"
                                Icon={BeakerIcon}
                                gradient="from-cyan-500 to-cyan-600"
                            />
                            <DashboardCard
                                href="/dashboard/medical-records"
                                title="Medical Records"
                                description="Create and view medical records"
                                Icon={ClipboardDocumentListIcon}
                                gradient="from-indigo-500 to-indigo-600"
                            />
                            <DashboardCard
                                href="/dashboard/prescriptions"
                                title="Prescriptions"
                                description="Manage patient prescriptions"
                                Icon={BeakerIcon}
                                gradient="from-pink-500 to-pink-600"
                            />
                        </div>
                    </div>
                )}

                {session.user?.role === "PATIENT" && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Health</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardCard
                                href="/dashboard/appointments"
                                title="My Appointments"
                                description="View your upcoming and past appointments"
                                Icon={CalendarIcon}
                                gradient="from-blue-500 to-blue-600"
                            />
                            <DashboardCard
                                href="/dashboard/lab-tests"
                                title="My Lab Tests"
                                description="View your laboratory test results"
                                Icon={BeakerIcon}
                                gradient="from-cyan-500 to-cyan-600"
                            />
                            <DashboardCard
                                href="/dashboard/prescriptions"
                                title="My Prescriptions"
                                description="View and manage your prescriptions"
                                Icon={BeakerIcon}
                                gradient="from-pink-500 to-pink-600"
                            />
                            <DashboardCard
                                href="/dashboard/billing/invoices"
                                title="My Invoices"
                                description="View your billing and payment history"
                                Icon={BanknotesIcon}
                                gradient="from-emerald-500 to-emerald-600"
                            />
                            <DashboardCard
                                href="/dashboard/medical-records"
                                title="Medical History"
                                description="Access your medical records and history"
                                Icon={ClipboardDocumentListIcon}
                                gradient="from-indigo-500 to-indigo-600"
                            />
                        </div>
                    </div>
                )}

                {(session.user?.role === "NURSE" || session.user?.role === "RECEPTIONIST") && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Workspace</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardCard
                                href="/dashboard/appointments"
                                title="Appointments"
                                description="Manage patient appointments"
                                Icon={CalendarIcon}
                                gradient="from-blue-500 to-blue-600"
                            />
                            <DashboardCard
                                href="/dashboard/patients"
                                title="Patients"
                                description="View patient information"
                                Icon={UserIcon}
                                gradient="from-teal-500 to-teal-600"
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Dashboard Card Component
function DashboardCard({
    href,
    title,
    description,
    Icon,
    gradient,
}: {
    href: string;
    title: string;
    description: string;
    Icon: any;
    gradient: string;
}) {
    return (
        <Link href={href} className="group">
            <div className="card p-6 hover:shadow-lg transition-all duration-200 h-full">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {title}
                </h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </Link>
    );
}
