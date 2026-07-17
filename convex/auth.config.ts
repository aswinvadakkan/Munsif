/**
 * Auth configuration for Convex.
 * 
 * Two auth methods:
 * 1. Email + OTP (magic link / verification code) via Resend or custom SMTP
 * 2. Google OAuth
 *
 * Reference: https://docs.convex.dev/auth
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL || "http://localhost:3000",
      applicationID: "convex",
    },
  ],
};
