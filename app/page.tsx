"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            🏥 Healthcare System
          </h1>
          <p className="text-xl md:text-2xl mb-2 text-blue-100">
            Modern. Secure. Efficient.
          </p>
          <p className="text-lg text-blue-200">
            Built with Next.js 16, NextAuth, Prisma & Supabase
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Authentication</h3>
            <p className="text-blue-100">
              Role-based access control with NextAuth.js
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Patient Management</h3>
            <p className="text-blue-100">
              Comprehensive patient records and history
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-white mb-2">Appointment System</h3>
            <p className="text-blue-100">
              Easy scheduling and management
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition shadow-lg w-full sm:w-auto text-center"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-400 transition border-2 border-white/30 w-full sm:w-auto text-center"
          >
            Create Account
          </Link>
        </div>

        {/* Status Indicators */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 border border-green-400/30 text-center">
            <div className="text-2xl mb-1">✅</div>
            <p className="text-green-100 font-semibold">Authentication Active</p>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30 text-center">
            <div className="text-2xl mb-1">🗄️</div>
            <p className="text-blue-100 font-semibold">Database Connected</p>
          </div>
          <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30 text-center">
            <div className="text-2xl mb-1">🚀</div>
            <p className="text-purple-100 font-semibold">Next.js 16 + Turbopack</p>
          </div>
        </div>
      </div>
    </main>
  );
}