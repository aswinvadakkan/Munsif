"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isPlaceholder =
  !convexUrl ||
  convexUrl === "https://your-project.convex.cloud" ||
  convexUrl.includes("placeholder");

const convex = isPlaceholder
  ? undefined
  : new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  if (!convex) {
    // Placeholder: render children without Convex provider until configured
    return <>{children}</>;
  }

  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}

export { convex };
