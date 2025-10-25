"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { auth, db } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCred.user, { displayName: data.name });
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: serverTimestamp(),
      });
      reset();
      router.push("/(auth)/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
        <input {...register("name")} placeholder="Full Name" className="input" required />
        <input {...register("email")} placeholder="Email" className="input mt-3" type="email" required />
        <input {...register("password")} placeholder="Password" className="input mt-3" type="password" required />
        <select {...register("role")} className="input mt-3" required>
          <option value="">Select Role</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button disabled={loading} type="submit" className="btn mt-5 w-full">
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </main>
  );
}
