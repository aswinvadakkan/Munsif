import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO: Replace with Convex auth middleware once Convex deployment is connected.
// The real middleware is on the feat/auth branch at:
// https://github.com/aswinvadakkan/Munsif/blob/feat/auth/src/middleware.ts

export default function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
