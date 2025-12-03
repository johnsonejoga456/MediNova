import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // If not logged in, redirect to login
  if (!session) {
    redirect("/auth/login");
  }

  // If logged in, redirect to dashboard
  redirect("/dashboard");
}