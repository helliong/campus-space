import { NextResponse, type NextRequest } from "next/server";

const REFRESH_COOKIE_NAME = "campus_space_refresh_token";

export function middleware(request: NextRequest) {
  if (request.cookies.has(REFRESH_COOKIE_NAME)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
