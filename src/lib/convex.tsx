"use client";

import { ReactNode } from "react";

// TODO: Replace with real ConvexClientProvider once Convex deployment is connected.
// The real provider is on the feat/auth branch.

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Placeholder: render children without Convex provider until configured
  return <>{children}</>;
}
