// Helper: Parse vital signs JSON
export function parseVitalSigns(vitalSignsJson?: string | null) {
    if (!vitalSignsJson) return null;

    try {
        return JSON.parse(vitalSignsJson);
    } catch {
        return null;
    }
}

// Helper: Check if vital signs are normal
export function checkVitalSignsStatus(vitalSigns: any) {
    if (!vitalSigns) return null;

    const warnings: string[] = [];

    // Blood Pressure (systolic/diastolic)
    if (vitalSigns.bloodPressure) {
        const [systolic, diastolic] = vitalSigns.bloodPressure.split("/").map(Number);
        if (systolic > 120 || systolic < 90 || diastolic > 80 || diastolic < 60) {
            warnings.push("Blood pressure abnormal");
        }
    }

    // Heart Rate (60-100 bpm)
    if (vitalSigns.heartRate) {
        if (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60) {
            warnings.push("Heart rate abnormal");
        }
    }

    // Temperature (36.1-37.2°C)
    if (vitalSigns.temperature) {
        if (vitalSigns.temperature > 37.2 || vitalSigns.temperature < 36.1) {
            warnings.push("Temperature abnormal");
        }
    }

    return warnings.length > 0 ? warnings : null;
}
