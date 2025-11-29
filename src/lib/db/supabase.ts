/**
 * 🌐 Supabase Client Configuration
 * 
 * This file creates two types of Supabase clients:
 * 1. Browser client - For use in React components (client-side)
 * 2. Server client - For use in API routes and server components
 * 
 * WHY TWO CLIENTS?
 * - Browser client uses cookies to maintain user session
 * - Server client has different security context
 * - Choosing the right one ensures proper authentication flow
 */

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get Supabase environment variables
 * The ! operator tells TypeScript we're sure these exist
 * If they don't, the app will crash with a clear error message
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 🖥️ Browser Client
 * 
 * Use this in:
 * - React components (client components)
 * - Custom hooks
 * - Client-side event handlers
 * 
 * Example:
 * 'use client';
 * import { createClient } from '@/lib/db/supabase';
 * 
 * const supabase = createClient();
 * const { data } = await supabase.from('patients').select('*');
 */
export function createClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * 🗄️ Server Client
 * 
 * Use this in:
 * - Server components (default in App Router)
 * - Server actions
 * - API routes
 * 
 * This client manages cookies for authentication properly in server context.
 * 
 * Example in Server Component:
 * import { createServerComponentClient } from '@/lib/db/supabase';
 * 
 * const supabase = await createServerComponentClient();
 * const { data } = await supabase.from('patients').select('*');
 */
export async function createServerComponentClient() {
    const cookieStore = await cookies()

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Handle read-only cookie store (in Server Components)
                        // This is expected and safe to ignore
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Handle read-only cookie store
                    }
                },
            },
        }
    )
}

/**
 * 📖 USAGE GUIDE:
 * 
 * CLIENT COMPONENT EXAMPLE:
 * ========================
 * 'use client';
 * 
 * import { createClient } from '@/lib/db/supabase';
 * import { useEffect, useState } from 'react';
 * 
 * export function PatientList() {
 *   const [patients, setPatients] = useState([]);
 *   const supabase = createClient();
 * 
 *   useEffect(() => {
 *     async function loadPatients() {
 *       const { data } = await supabase.from('patients').select('*');
 *       setPatients(data || []);
 *     }
 *     loadPatients();
 *   }, []);
 * 
 *   return <div>{patients.map(p => <div key={p.id}>{p.name}</div>)}</div>;
 * }
 * 
 * 
 * SERVER COMPONENT EXAMPLE:
 * =========================
 * import { createServerComponentClient } from '@/lib/db/supabase';
 * 
 * export default async function PatientsPage() {
 *   const supabase = await createServerComponentClient();
 *   const { data: patients } = await supabase.from('patients').select('*');
 * 
 *   return (
 *     <div>
 *       {patients.map(p => <div key={p.id}>{p.name}</div>)}
 *     </div>
 *   );
 * }
 * 
 * 
 * 🎯 WHEN TO USE WHICH:
 * - Need real-time updates? → Browser client with subscriptions
 * - Fetching data on initial page load? → Server client (faster, better SEO)
 * - User interactions (buttons, forms)? → Browser client
 * - API routes? → Server client
 */
