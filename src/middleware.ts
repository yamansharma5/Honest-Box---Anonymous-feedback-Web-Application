// middleware.ts is a Next.js middleware that handles authentication and route protection. It checks for a valid JWT token and redirects users based on their authentication status and the requested route. The middleware is applied to specific routes defined in the config object. 
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const isAuthPage = ["/sign-in", "/sign-up"].includes(pathname);
  const isProtectedRoute = ["/dashboard", "/verify"].some((route) =>
    pathname.startsWith(route)
  );

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && isProtectedRoute) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/dashboard/:path*",
    "/verify/:path*",
  ],
};