"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/actions/invoices";
import { BanknotesIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

type LineItem = {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
};

export default function CreateInvoicePage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [patients, setPatients] = useState<any[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);

    const [formData, setFormData] = useState({
        patientId: "",
        dueDate: "",
        description: "",
        notes: "",
    });

    const [lineItems, setLineItems] = useState<LineItem[]>([
        {
            id: crypto.randomUUID(),
            description: "",
            quantity: 1,
            unitPrice: 0,
        },
    ]);

    // Fetch patients
    useEffect(() => {
        const fetchPatients = async () => {
            setLoadingPatients(true);
            try {
                const response = await fetch("/api/patients");
                const data = await response.json();
                setPatients(data);
            } catch (err) {
                console.error("Error loading patients:", err);
            } finally {
                setLoadingPatients(false);
            }
        };
        fetchPatients();
    }, []);

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            {
                id: crypto.randomUUID(),
                description: "",
                quantity: 1,
                unitPrice: 0,
            },
        ]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((item) => item.id !== id));
        }
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(
            lineItems.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const calculateTotal = () => {
        return lineItems.reduce(
            (total, item) => total + item.quantity * item.unitPrice,
            0
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.patientId || !formData.dueDate || !formData.description) {
            setError("Please fill in all required fields");
            return;
        }

        const hasEmptyLineItems = lineItems.some(
            (item) => !item.description || item.unitPrice <= 0
        );
        if (hasEmptyLineItems) {
            setError("Please complete all line items");
            return;
        }

        const total = calculateTotal();
        if (total <= 0) {
            setError("Invoice total must be greater than zero");
            return;
        }

        startTransition(async () => {
            const result = await createInvoice({
                patientId: formData.patientId,
                amount: total,
                dueDate: new Date(formData.dueDate),
                description: formData.description,
                items: JSON.stringify(lineItems),
                notes: formData.notes,
            });

            if (result.error) {
                setError(result.error);
            } else {
                router.push("/dashboard/billing/invoices");
                router.refresh();
            }
        });
    };

    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BanknotesIcon className="w-8 h-8 text-emerald-600" />
                        Create Invoice
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">Generate a new invoice for a patient</p>
                </div>

                <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient *</label>
                        <select
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            className="input"
                            required
                            disabled={isPending || loadingPatients}
                        >
                            <option value="">
                                {loadingPatients ? "Loading patients..." : "Select a patient"}
                            </option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.user.firstName} {patient.user.lastName} ({patient.user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description *
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input"
                            placeholder="e.g., Medical consultation and tests"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date *</label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="input"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Line Items */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">Line Items *</label>
                            <button
                                type="button"
                                onClick={addLineItem}
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                disabled={isPending}
                            >
                                <PlusCircleIcon className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {lineItems.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) =>
                                                updateLineItem(item.id, "description", e.target.value)
                                            }
                                            className="input"
                                            placeholder="Service description"
                                            disabled={isPending}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateLineItem(item.id, "quantity", Number(e.target.value))
                                            }
                                            className="input"
                                            placeholder="Qty"
                                            min="1"
                                            disabled={isPending}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={(e) =>
                                                updateLineItem(item.id, "unitPrice", Number(e.target.value))
                                            }
                                            className="input"
                                            placeholder="Price"
                                            step="0.01"
                                            min="0"
                                            disabled={isPending}
                                        />
                                    </div>
                                    <div className="w-28 text-right pt-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            ${(item.quantity * item.unitPrice).toFixed(2)}
                                        </span>
                                    </div>
                                    {lineItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLineItem(item.id)}
                                            className="p-2 text-red-600 hover:text-red-700"
                                            disabled={isPending}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-end">
                                <div className="text-right">
                                    <span className="text-sm text-gray-600">Total Amount:</span>
                                    <span className="ml-4 text-2xl font-bold text-emerald-600">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
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
                            placeholder="Additional notes or payment terms..."
                            disabled={isPending}
                        />
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
                                    Creating Invoice...
                                </span>
                            ) : (
                                "Create Invoice"
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
