//why do we need this file? This file is responsible for handling authentication and authorization for our Next.js application. 
// It uses the NextAuth library to manage user sessions and protect certain routes from unauthorized access. 
// The proxy function checks if a user is authenticated and redirects them to the appropriate page based on their authentication status and the route they are trying to access. 
// This ensures that only authenticated users can access protected routes like the dashboard and verify pages, while unauthenticated users are redirected to the sign-in page.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
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
  matcher: ["/", "/sign-in", "/sign-up", "/dashboard/:path*", "/verify/:path*"],
};
