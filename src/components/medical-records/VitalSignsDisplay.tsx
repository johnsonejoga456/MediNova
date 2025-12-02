import { parseVitalSigns, checkVitalSignsStatus } from "@/lib/vital-signs-utils";

export default function VitalSignsDisplay({ vitalSignsJson }: { vitalSignsJson?: string | null }) {
    const vitalSigns = parseVitalSigns(vitalSignsJson);
    const warnings = checkVitalSignsStatus(vitalSigns);

    if (!vitalSigns) {
        return (
            <div className="text-gray-500 italic">No vital signs recorded</div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Warnings */}
            {warnings && warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-600 text-lg">⚠️</span>
                        <div>
                            <p className="font-semibold text-yellow-900">Abnormal Readings</p>
                            <ul className="text-sm text-yellow-800 mt-1">
                                {warnings.map((warning, i) => (
                                    <li key={i}>• {warning}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Blood Pressure */}
                {vitalSigns.bloodPressure && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-500 text-xl">❤️</span>
                            <span className="text-sm font-medium text-gray-600">Blood Pressure</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitalSigns.bloodPressure}</p>
                        <p className="text-xs text-gray-500">mmHg</p>
                    </div>
                )}

                {/* Heart Rate */}
                {vitalSigns.heartRate && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-pink-500 text-xl">💓</span>
                            <span className="text-sm font-medium text-gray-600">Heart Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitalSigns.heartRate}</p>
                        <p className="text-xs text-gray-500">bpm</p>
                    </div>
                )}

                {/* Temperature */}
                {vitalSigns.temperature && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-orange-500 text-xl">🌡️</span>
                            <span className="text-sm font-medium text-gray-600">Temperature</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitalSigns.temperature}</p>
                        <p className="text-xs text-gray-500">°C</p>
                    </div>
                )}

                {/* Weight */}
                {vitalSigns.weight && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-500 text-xl">⚖️</span>
                            <span className="text-sm font-medium text-gray-600">Weight</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitalSigns.weight}</p>
                        <p className="text-xs text-gray-500">kg</p>
                    </div>
                )}

                {/* Height */}
                {vitalSigns.height && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-500 text-xl">📏</span>
                            <span className="text-sm font-medium text-gray-600">Height</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitalSigns.height}</p>
                        <p className="text-xs text-gray-500">cm</p>
                    </div>
                )}

                {/* Oxygen Saturation */}
                {vitalSigns.oxygenSaturation && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-cyan-500 text-xl">🫁</span>
                            <span className="text-sm font-medium text-gray-600">O₂ Saturation</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitalSigns.oxygenSaturation}</p>
                        <p className="text-xs text-gray-500">%</p>
                    </div>
                )}
            </div>
        </div>
    );
}
