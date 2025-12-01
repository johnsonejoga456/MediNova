"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/auth/login?registered=true");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">Create Account</h2>
        <p className="text-center text-gray-600 mb-6">Join Healthcare System</p>

        <input
          name="name"
          placeholder="Full Name"
          className="input border border-gray-300 p-3 w-full rounded-lg mb-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          name="email"
          placeholder="Email"
          className="input border border-gray-300 p-3 w-full rounded-lg mb-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          type="email"
          required
        />
        <input
          name="password"
          placeholder="Password"
          className="input border border-gray-300 p-3 w-full rounded-lg mb-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          type="password"
          required
        />
        <select
          name="role"
          className="input border border-gray-300 p-3 w-full rounded-lg mb-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
          defaultValue=""
        >
          <option value="" disabled>Select Role</option>
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
          <option value="NURSE">Nurse</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="ADMIN">Admin</option>
        </select>

        {error && <p className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="btn mt-5 w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/auth/login" className="text-green-600 hover:text-green-700 font-semibold">
              Login here
            </a>
          </p>
        </div>
      </form>
    </main>
  );
}
