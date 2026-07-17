/**
 * Convex client provider.
 * 
 * This module provides the Convex client for server-side mutations/queries.
 * The client-side ConvexProvider is set up in the root layout.
 *
 * When swapping to another data layer (e.g., Supabase), the application
 * code only needs to change this file — all mutations/queries go through
 * these exported functions.
 */

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "";

export function getConvexClient(): ConvexHttpClient {
  if (!CONVEX_URL) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. Set it in your .env.local file."
    );
  }
  return new ConvexHttpClient(CONVEX_URL);
}

export { CONVEX_URL };
