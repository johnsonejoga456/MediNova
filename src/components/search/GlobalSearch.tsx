"use client";

import { useState, useEffect, useRef } from "react";
import { globalSearch } from "@/actions/search";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults(null);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const data = await globalSearch(query);
                setResults(data);
                setIsOpen(true);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hasResults =
        results &&
        (results.patients.length > 0 ||
            results.doctors.length > 0 ||
            results.appointments.length > 0 ||
            results.invoices.length > 0 ||
            results.labTests.length > 0);

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            {/* Search Input */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search patients, doctors, appointments..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults(null);
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-2 text-sm">Searching...</p>
                        </div>
                    ) : hasResults ? (
                        <div className="p-2">
                            {/* Patients */}
                            {results.patients.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Patients</h3>
                                    {results.patients.map((patient: any) => (
                                        <Link
                                            key={patient.id}
                                            href={`/dashboard/patients/${patient.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <p className="font-medium text-gray-900">
                                                {patient.user.firstName} {patient.user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{patient.user.email}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Doctors */}
                            {results.doctors.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Doctors</h3>
                                    {results.doctors.map((doctor: any) => (
                                        <Link
                                            key={doctor.id}
                                            href={`/dashboard/doctors/${doctor.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <p className="font-medium text-gray-900">
                                                Dr. {doctor.user.firstName} {doctor.user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{doctor.specialization}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Appointments */}
                            {results.appointments.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Appointments</h3>
                                    {results.appointments.map((apt: any) => (
                                        <Link
                                            key={apt.id}
                                            href={`/dashboard/appointments/${apt.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <p className="font-medium text-gray-900">
                                                {apt.patient.user.firstName} {apt.patient.user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(apt.appointmentDate).toLocaleDateString()} - Dr. {apt.doctor.user.lastName}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Invoices */}
                            {results.invoices.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Invoices</h3>
                                    {results.invoices.map((invoice: any) => (
                                        <Link
                                            key={invoice.id}
                                            href={`/dashboard/billing/invoices/${invoice.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                            <p className="text-sm text-gray-500">
                                                {invoice.patient.user.firstName} {invoice.patient.user.lastName} - ${invoice.amount.toFixed(2)}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Lab Tests */}
                            {results.labTests.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Lab Tests</h3>
                                    {results.labTests.map((test: any) => (
                                        <Link
                                            key={test.id}
                                            href={`/dashboard/lab-tests/${test.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <p className="font-medium text-gray-900">{test.testName}</p>
                                            <p className="text-sm text-gray-500">
                                                {test.patient.user.firstName} {test.patient.user.lastName}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No results found for "{query}"</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
