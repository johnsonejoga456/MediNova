import { PaymentMethod } from "@prisma/client";
import {
    BanknotesIcon,
    CreditCardIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

export default function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
    const getMethodConfig = (method: PaymentMethod) => {
        switch (method) {
            case "CASH":
                return {
                    bg: "bg-green-50",
                    text: "text-green-700",
                    border: "border-green-200",
                    Icon: BanknotesIcon,
                    label: "Cash",
                };
            case "CREDIT_CARD":
                return {
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                    border: "border-blue-200",
                    Icon: CreditCardIcon,
                    label: "Credit Card",
                };
            case "DEBIT_CARD":
                return {
                    bg: "bg-indigo-50",
                    text: "text-indigo-700",
                    border: "border-indigo-200",
                    Icon: CreditCardIcon,
                    label: "Debit Card",
                };
            case "INSURANCE":
                return {
                    bg: "bg-purple-50",
                    text: "text-purple-700",
                    border: "border-purple-200",
                    Icon: BuildingLibraryIcon,
                    label: "Insurance",
                };
            case "BANK_TRANSFER":
                return {
                    bg: "bg-teal-50",
                    text: "text-teal-700",
                    border: "border-teal-200",
                    Icon: BuildingLibraryIcon,
                    label: "Bank Transfer",
                };
            case "MOBILE_PAYMENT":
                return {
                    bg: "bg-pink-50",
                    text: "text-pink-700",
                    border: "border-pink-200",
                    Icon: DevicePhoneMobileIcon,
                    label: "Mobile Payment",
                };
            default:
                return {
                    bg: "bg-gray-50",
                    text: "text-gray-700",
                    border: "border-gray-200",
                    Icon: BanknotesIcon,
                    label: method,
                };
        }
    };

    const config = getMethodConfig(method);
    const Icon = config.Icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
        >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
}
