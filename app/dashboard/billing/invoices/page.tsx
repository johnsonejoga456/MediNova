import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInvoices, getFinancialStats } from "@/actions/invoices";
import InvoicesTable from "@/components/billing/InvoicesTable";
import Link from "next/link";
import { BanknotesIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

export default async function InvoicesPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const invoices = await getInvoices();
    const stats = await getFinancialStats();

    const canCreateInvoice = ["ADMIN", "RECEPTIONIST"].includes(session.user.role);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BanknotesIcon className="w-8 h-8 text-emerald-600" />
                            Billing & Invoices
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {session.user.role === "PATIENT"
                                ? "View your invoices and payment history"
                                : "Manage invoices and track payments"}
                        </p>
                    </div>
                    {canCreateInvoice && (
                        <Link
                            href="/dashboard/billing/invoices/new"
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            Create Invoice
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">
                                    ${stats.totalRevenue.toFixed(2)}
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
                                    ${stats.outstandingBalance.toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Payments Today</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    ${stats.paymentsToday.toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">{stats.paymentsCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Overdue</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.overdueCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {session.user.role === "PATIENT" ? "My Invoices" : "All Invoices"}
                    </h2>
                    <InvoicesTable invoices={invoices} />
                </div>
            </div>
        </div>
    );
}
