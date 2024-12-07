/* eslint-disable turbo/no-undeclared-env-vars */
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req: req as any,
    secret: process.env.JWT_SECRET,
  });

  // Redirect unverified users to the /verify page
  // if (
  //   token &&
  //   token.verification === false &&
  //   req.nextUrl.pathname !== "/verify"
  // ) {
  //   return NextResponse.redirect(new URL("/verify", req.url));
  // }

  const restrictedRoutes = ["/signin", "/signup"];
  if (token && restrictedRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  const protectedRoutes = ["/home", "/transfer", "/transactions", "/verify"];
  if (!token && protectedRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/transfer",
    "/transactions",
    "/signin",
    "/signup",
    "/verify",
  ],
};
