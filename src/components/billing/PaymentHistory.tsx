"use client";

import PaymentMethodBadge from "./PaymentMethodBadge";

export default function PaymentHistory({ payments }: { payments: any[] }) {
    if (payments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No payments recorded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {payments.map((payment, index) => (
                <div
                    key={payment.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        {index < payments.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                        )}
                    </div>

                    {/* Payment details */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <span className="text-lg font-semibold text-gray-900">
                                    ${payment.amount.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                    on {new Date(payment.paymentDate).toLocaleDateString()}
                                </span>
                            </div>
                            <PaymentMethodBadge method={payment.paymentMethod} />
                        </div>

                        {payment.transactionId && (
                            <div className="text-sm text-gray-600 mb-1">
                                Transaction ID: <span className="font-mono">{payment.transactionId}</span>
                            </div>
                        )}

                        {payment.notes && (
                            <div className="text-sm text-gray-600 mt-2 italic">{payment.notes}</div>
                        )}

                        <div className="text-xs text-gray-500 mt-2">
                            Recorded at {new Date(payment.paymentDate).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
