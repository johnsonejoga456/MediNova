"use client";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
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
      const userCred = await signInWithEmailAndPassword(auth, data.email, data.password);
      const snap = await getDoc(doc(db, "users", userCred.user.uid));
      const role = snap.exists() ? snap.data()?.role : "patient";
      router.push(`/dashboard/${role}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        <input {...register("email")} placeholder="Email" className="input" type="email" required />
        <input {...register("password")} placeholder="Password" className="input mt-3" type="password" required />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button disabled={loading} type="submit" className="btn mt-5 w-full">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
