"use client";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Redirect based on role is handled in middleware or we can fetch session here
        // For now, redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">Sign In</h2>
        <p className="text-center text-gray-600 mb-6">Welcome back to Healthcare System</p>

        <input
          {...register("email")}
          placeholder="Email"
          className="input border border-gray-300 p-3 w-full rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="email"
          required
        />
        <input
          {...register("password")}
          placeholder="Password"
          className="input border border-gray-300 p-3 w-full rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="password"
          required
        />

        {error && <p className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="btn mt-5 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Register here
            </a>
          </p>
        </div>
      </form>
    </main>
  );
}
