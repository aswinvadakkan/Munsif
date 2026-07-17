import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isDashboardRoute = createRouteMatcher("/dashboard/:path*");
const isAuthRoute = createRouteMatcher(["/login", "/signup"]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const authenticated = await convexAuth.isAuthenticated();

    // Protect /dashboard/* — redirect unauthenticated to /login
    if (isDashboardRoute(request) && !authenticated) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    // Redirect authenticated users away from /login and /signup
    if (isAuthRoute(request) && authenticated) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }
  },
);
