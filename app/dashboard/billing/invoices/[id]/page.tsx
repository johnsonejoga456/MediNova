import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInvoiceById } from "@/actions/invoices";
import InvoiceStatusBadge from "@/components/billing/InvoiceStatusBadge";
import PaymentHistory from "@/components/billing/PaymentHistory";
import Link from "next/link";
import {
    BanknotesIcon,
    UserIcon,
    DocumentTextIcon,
    PlusCircleIcon,
} from "@heroicons/react/24/outline";

export default async function InvoiceDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const invoice = await getInvoiceById(id);

    // Parse line items
    const lineItems = JSON.parse(invoice.items);
    const balance = invoice.amount - invoice.amountPaid;
    const canRecordPayment = ["ADMIN", "RECEPTIONIST"].includes(session.user.role);
    const isOverdue =
        new Date(invoice.dueDate) < new Date() &&
        invoice.status !== "PAID" &&
        invoice.status !== "CANCELLED";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BanknotesIcon className="w-8 h-8 text-emerald-600" />
                            Invoice Details
                        </h1>
                        <Link href="/dashboard/billing/invoices" className="btn btn-secondary">
                            Back to List
                        </Link>
                    </div>
                </div>

                {/* Invoice Header Card */}
                <div className="card p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h2>
                            <p className="text-gray-600 mt-1">{invoice.description}</p>
                        </div>
                        <InvoiceStatusBadge status={isOverdue ? "OVERDUE" : (invoice.status as any)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Issue Date</label>
                            <p className="text-gray-900 mt-1">
                                {new Date(invoice.issueDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Due Date</label>
                            <p className={`mt-1 ${isOverdue ? "text-red-600 font-semibold" : "text-gray-900"}`}>
                                {new Date(invoice.dueDate).toLocaleDateString()}
                                {isOverdue && " (Overdue)"}
                            </p>
                        </div>
                        {invoice.paidDate && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Paid Date</label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(invoice.paidDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Patient Details */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                        Patient Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Name</label>
                            <p className="text-gray-900 mt-1">
                                {invoice.patient.user.firstName} {invoice.patient.user.lastName}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="text-gray-900 mt-1">{invoice.patient.user.email}</p>
                        </div>
                        {invoice.patient.user.phoneNumber && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Phone</label>
                                <p className="text-gray-900 mt-1">{invoice.patient.user.phoneNumber}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Line Items */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                        Line Items
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                                        Description
                                    </th>
                                    <th className="text-right py-3 text-sm font-medium text-gray-600">Quantity</th>
                                    <th className="text-right py-3 text-sm font-medium text-gray-600">
                                        Unit Price
                                    </th>
                                    <th className="text-right py-3 text-sm font-medium text-gray-600">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((item: any, index: number) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">{item.description}</td>
                                        <td className="py-3 text-right text-gray-900">{item.quantity}</td>
                                        <td className="py-3 text-right text-gray-900">${item.unitPrice.toFixed(2)}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">
                                            ${(item.quantity * item.unitPrice).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan={3} className="py-3 text-right font-semibold text-gray-900">
                                        Total Amount:
                                    </td>
                                    <td className="py-3 text-right text-xl font-bold text-emerald-600">
                                        ${invoice.amount.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {invoice.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Notes:</span> {invoice.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Payment Summary */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="text-gray-900 font-medium">${invoice.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Amount Paid:</span>
                            <span className="text-green-600 font-medium">
                                ${invoice.amountPaid.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-200">
                            <span className="text-gray-900 font-semibold">Outstanding Balance:</span>
                            <span
                                className={`font-bold text-xl ${balance > 0 ? "text-red-600" : "text-green-600"
                                    }`}
                            >
                                ${balance.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                {invoice.payments.length > 0 && (
                    <div className="card p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
                        <PaymentHistory payments={invoice.payments} />
                    </div>
                )}

                {/* Action Buttons */}
                {canRecordPayment && balance > 0 && invoice.status !== "CANCELLED" && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                        <Link
                            href={`/dashboard/billing/invoices/${invoice.id}/payment`}
                            className="btn btn-primary flex items-center gap-2 justify-center"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            Record Payment
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
