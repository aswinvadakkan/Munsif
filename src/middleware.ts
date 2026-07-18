import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/dashboard/:path*",
  "/admin/:path*",
]);
const isAuthRoute = createRouteMatcher(["/login", "/signup"]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // Run i18n middleware first for locale detection and routing
    const intlResponse = intlMiddleware(request);

    // Auth checks
    const authenticated = await convexAuth.isAuthenticated();

    // Protect /dashboard/* and /admin/* — redirect unauthenticated to /login
    if (isProtectedRoute(request) && !authenticated) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    // Redirect authenticated users away from /login and /signup
    if (isAuthRoute(request) && authenticated) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }

    return intlResponse;
  },
);

export const config = {
  // Match all paths except API routes, _next, and static files
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
