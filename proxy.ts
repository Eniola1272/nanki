import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const path = req.nextUrl.pathname;

  // Public paths that don't require auth
  const publicPaths = ["/", "/auth/signin"];
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/org/:path*",
    "/quiz/create/:path*",
    "/profile/:path*",
  ],
};