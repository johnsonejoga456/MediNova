"use client";

import { useEffect, useState } from "react";
import {
    getOverallStats,
    getAppointmentTrends,
    getRevenueTrends,
    getPatientGrowth,
    getDepartmentDistribution,
} from "@/actions/analytics";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon, BanknotesIcon } from "@heroicons/react/24/outline";

const COLORS = {
    primary: "#006BA6",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
};

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [appointmentData, setAppointmentData] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [patientData, setPatientData] = useState<any[]>([]);
    const [departmentData, setDepartmentData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsData, appointments, revenue, patients, departments] = await Promise.all([
                    getOverallStats(),
                    getAppointmentTrends(),
                    getRevenueTrends(),
                    getPatientGrowth(),
                    getDepartmentDistribution(),
                ]);
                setStats(statsData);
                setAppointmentData(appointments);
                setRevenueData(revenue);
                setPatientData(patients);
                setDepartmentData(departments);
            } catch (error) {
                console.error("Analytics error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="skeleton h-12 w-12 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ChartBarIcon className="w-8 h-8 text-blue-600" />
                        Analytics & Reports
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Comprehensive insights and data visualization
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalPatients || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <UsersIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Appointments (Month)</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.appointmentsThisMonth || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Revenue (Month)</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">
                                    ${(stats?.revenueThisMonth || 0).toFixed(0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <BanknotesIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">
                                    ${(stats?.outstanding || 0).toFixed(0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Appointment Trends */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends (30 Days)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={appointmentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="scheduled" stroke={COLORS.warning} strokeWidth={2} />
                                <Line type="monotone" dataKey="completed" stroke={COLORS.success} strokeWidth={2} />
                                <Line type="monotone" dataKey="cancelled" stroke={COLORS.danger} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Patient Growth */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Growth (6 Months)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={patientData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trends */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview (12 Months)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="invoiced" fill={COLORS.primary} />
                                <Bar dataKey="collected" fill={COLORS.success} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Department Distribution */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Specializations</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={departmentData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
