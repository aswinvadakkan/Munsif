import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// i18n middleware handles locale detection and routing.
// Existing placeholder passthrough behavior (no auth) is preserved —
// the middleware only handles locale prefixing, it does not gate auth.
export default createMiddleware(routing);

export const config = {
  // Match all paths except API routes, _next, and static files
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
