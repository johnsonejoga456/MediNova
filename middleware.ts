import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/auth/login", "/auth/register"];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If user is logged in and tries to access login/register, redirect to dashboard
    if (session && (pathname === "/auth/login" || pathname === "/auth/register")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user is not logged in and tries to access protected route, redirect to login
    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth endpoints)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
    ],
};
