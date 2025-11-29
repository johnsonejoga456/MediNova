/**
 * 🛠️ Utility Functions
 * 
 * This file contains helpful utility functions used throughout the application.
 * These are small, reusable pieces of code that make your life easier!
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 🎨 cn - Merge Tailwind CSS classes smartly
 * 
 * WHAT IT DOES:
 * - Combines multiple class names
 * - Resolves conflicting Tailwind classes
 * - Removes duplicates
 * 
 * WHY IS THIS USEFUL?
 * In Tailwind, if you have conflicting classes, the last one wins.
 * But when combining classes from different sources, you might get conflicts.
 * This function smartly merges them.
 * 
 * Example:
 * cn('px-4 py-2', 'px-6')
 * // Returns: 'py-2 px-6' (px-6 overrides px-4)
 * 
 * REAL EXAMPLE:
 * <Button className={cn('bg-blue-500', isError && 'bg-red-500')} />
 * // If isError is true, button will be red (overrides blue)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 📅 formatDate - Format dates in a human-readable way
 * 
 * @param date - Date object or ISO string
 * @param format - Output format ('short', 'long', 'time')
 * @returns Formatted date string
 * 
 * Examples:
 * formatDate(new Date(), 'short') // "Jan 15, 2024"
 * formatDate(new Date(), 'long')  // "January 15, 2024"
 * formatDate(new Date(), 'time')  // "2:30 PM"
 */
export function formatDate(
    date: Date | string,
    format: 'short' | 'long' | 'time' = 'short'
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    switch (format) {
        case 'short':
            return dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
        case 'long':
            return dateObj.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            })
        case 'time':
            return dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
        default:
            return dateObj.toLocaleDateString()
    }
}

/**
 * 🎂 calculateAge - Calculate age from date of birth
 * 
 * @param dateOfBirth - Patient's date of birth
 * @returns Age in years
 * 
 * Example:
 * calculateAge(new Date('1990-01-15')) // 34 (if current year is 2024)
 */
export function calculateAge(dateOfBirth: Date | string): number {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
    const today = new Date()

    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()

    // If birthday hasn't occurred this year yet, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--
    }

    return age
}

/**
 * 📱 formatPhoneNumber - Format phone number for display
 * 
 * @param phone - Phone number string
 * @returns Formatted phone number
 * 
 * Example:
 * formatPhoneNumber('1234567890') // "(123) 456-7890"
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D+/g, '') // Remove non-digits

    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }

    return phone // Return original if doesn't match expected format
}

/**
 * 💵 formatCurrency - Format numbers as currency
 * 
 * @param amount - Number to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 * 
 * Example:
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, 'EUR') // "€1,234.56"
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount)
}

/**
 * 🔤 capitalize - Capitalize first letter of each word
 * 
 * @param text - Text to capitalize
 * @returns Capitalized text
 * 
 * Example:
 * capitalize('john doe') // "John Doe"
 */
export function capitalize(text: string): string {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

/**
 * 🎲 generateId - Generate a random ID
 * 
 * @param prefix - Optional prefix for the ID
 * @param length - Length of random part (default: 8)
 * @returns Random ID string
 * 
 * Example:
 * generateId('INV') // "INV-a7b3c9d2"
 * generateId('PAT') // "PAT-x4y7z1m5"
 * 
 * Useful for: Invoice numbers, temporary IDs, etc.
 */
export function generateId(prefix: string = '', length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const id = Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join('')

    return prefix ? `${prefix}-${id}` : id
}

/**
 * ✂️ truncate - Truncate long text with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncating
 * @returns Truncated text
 * 
 * Example:
 * truncate('This is a very long description', 20)
 * // "This is a very lo..."
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

/**
 * 🔍 getInitials - Get initials from name
 * 
 * @param name - Full name
 * @returns Initials (2 letters)
 * 
 * Example:
 * getInitials('John Doe') // "JD"
 * getInitials('Mary Jane Watson') // "MJ" (first and last)
 * 
 * Useful for: Avatar placeholders when no image available
 */
export function getInitials(name: string): string {
    const parts = name.trim().split(' ')

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase()
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * ⏰ sleep - Delay execution (useful for testing, animations)
 * 
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 * 
 * Example:
 * await sleep(2000) // Wait 2 seconds
 * console.log('2 seconds passed!')
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 📊 isEmpty - Check if value is empty
 * 
 * Checks for: null, undefined, empty string, empty array, empty object
 * 
 * Example:
 * isEmpty(null) // true
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('hello') // false
 * isEmpty([1, 2, 3]) // false
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
}

/**
 * 🔐 maskEmail - Partially hide email for privacy
 * 
 * @param email - Email address
 * @returns Masked email
 * 
 * Example:
 * maskEmail('john.doe@hospital.com') // "j***e@hospital.com"
 */
export function maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    if (!username || !domain) return email

    const maskedUsername = username[0] + '***' + username[username.length - 1]
    return `${maskedUsername}@${domain}`
}

/**
 * 📋 copyToClipboard - Copy text to clipboard
 * 
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 * 
 * Example:
 * const success = await copyToClipboard('Patient ID: 12345');
 * if (success) toast.success('Copied to clipboard!');
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        return false
    }
}
