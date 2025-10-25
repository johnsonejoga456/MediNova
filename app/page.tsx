"use client";
import { useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function HomePage() {
  useEffect(() => {
    const testFirestore = async () => {
      const snapshot = await getDocs(collection(db, "test"));
      console.log("Firestore connected:", snapshot.size);
    };
    testFirestore();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Healthcare System</h1>
      <p className="mt-2 text-gray-600">Firebase setup successful</p>
    </main>
  );
}