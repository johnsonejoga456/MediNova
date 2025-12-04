"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordPayment } from "@/actions/payments";
import { getInvoiceById } from "@/actions/invoices";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { PaymentMethod } from "@prisma/client";

export default function RecordPaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [invoiceId, setInvoiceId] = useState("");
    const [invoice, setInvoice] = useState<any>(null);
    const [formData, setFormData] = useState({
        amount: "",
        paymentMethod: "CASH" as PaymentMethod,
        transactionId: "",
        notes: "",
    });

    useEffect(() => {
        const fetchInvoice = async () => {
            const { id } = await params;
            setInvoiceId(id);
            try {
                const inv = await getInvoiceById(id);
                setInvoice(inv);
                // Set default amount to outstanding balance
                const outstanding = inv.amount - inv.amountPaid;
                setFormData((prev) => ({ ...prev, amount: outstanding.toFixed(2) }));
            } catch (err) {
                console.error("Error loading invoice:", err);
            }
        };
        fetchInvoice();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid payment amount");
            return;
        }

        const outstanding = invoice.amount - invoice.amountPaid;
        if (amount > outstanding) {
            setError(`Payment cannot exceed outstanding balance ($${outstanding.toFixed(2)})`);
            return;
        }

        startTransition(async () => {
            const result = await recordPayment({
                invoiceId,
                amount,
                paymentMethod: formData.paymentMethod,
                transactionId: formData.transactionId || undefined,
                notes: formData.notes || undefined,
            });

            if (result.error) {
                setError(result.error);
            } else {
                router.push(`/dashboard/billing/invoices/${invoiceId}`);
                router.refresh();
            }
        });
    };

    if (!invoice) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="skeleton h-12 w-12 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const outstanding = invoice.amount - invoice.amountPaid;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <CreditCardIcon className="w-8 h-8 text-emerald-600" />
                        Record Payment
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Invoice: {invoice.invoiceNumber} - {invoice.patient.user.firstName}{" "}
                        {invoice.patient.user.lastName}
                    </p>
                </div>

                {/* Outstanding Balance Banner */}
                <div className="card p-6 mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
                        <p className="text-4xl font-bold text-emerald-600">${outstanding.toFixed(2)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Payment Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Payment Amount *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-600">$</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="input pl-8"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                max={outstanding}
                                required
                                disabled={isPending}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Maximum: ${outstanding.toFixed(2)}
                        </p>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Payment Method *
                        </label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) =>
                                setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                            }
                            className="input"
                            required
                            disabled={isPending}
                        >
                            <option value="CASH">Cash</option>
                            <option value="CREDIT_CARD">Credit Card</option>
                            <option value="DEBIT_CARD">Debit Card</option>
                            <option value="INSURANCE">Insurance</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="MOBILE_PAYMENT">Mobile Payment</option>
                        </select>
                    </div>

                    {/* Transaction ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Transaction ID (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.transactionId}
                            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                            className="input font-mono"
                            placeholder="e.g., TXN123456789"
                            disabled={isPending}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            For card or bank transfer payments
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="input"
                            placeholder="Additional payment notes..."
                            disabled={isPending}
                        />
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Recording this payment will automatically update the invoice
                            status.
                            {parseFloat(formData.amount) >= outstanding &&
                                " This payment will mark the invoice as PAID."}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Recording Payment...
                                </span>
                            ) : (
                                "Record Payment"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-secondary"
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
