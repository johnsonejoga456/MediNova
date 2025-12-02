// Helper: Check if prescription is expiring soon (within 7 days)
export function isExpiringSoon(endDate: Date | null): boolean {
    if (!endDate) return false;

    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return endDate > today && endDate <= sevenDaysFromNow;
}
