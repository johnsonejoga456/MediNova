"use client";

import { SessionProvider } from "next-auth/react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export const useAuth = () => {
  throw new Error("useAuth is deprecated. Use useSession from next-auth/react instead.");
};
