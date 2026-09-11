import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const publicRoutes = ["/login"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPortalRoute = path.startsWith("/portal");
  const isStaffRoute = path.startsWith("/staff");
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if ((isPortalRoute || isStaffRoute) && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Optimistic role separation; the DAL re-checks on every protected page.
  if (isStaffRoute && session?.role === "CLIENT") {
    return NextResponse.redirect(new URL("/portal", req.nextUrl));
  }
  if (isPortalRoute && session && session.role !== "CLIENT") {
    return NextResponse.redirect(new URL("/staff", req.nextUrl));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(
      new URL(session.role === "CLIENT" ? "/portal" : "/staff", req.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
