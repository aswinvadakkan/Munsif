import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Auth: Users (extends authTables.users with our custom fields) ──
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Munsif AI custom fields
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("email", ["email", "_creationTime"]),

  // ── Auth: Sessions ──
  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
  }).index("userId", ["userId", "_creationTime"]),

  // ── Auth: Accounts ──
  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    secret: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("userIdAndProvider", ["userId", "provider", "_creationTime"])
    .index("providerAndAccountId", ["provider", "providerAccountId", "_creationTime"]),

  // ── Auth: Refresh Tokens ──
  authRefreshTokens: defineTable({
    sessionId: v.id("authSessions"),
    expirationTime: v.number(),
    firstUsedTime: v.optional(v.number()),
    parentRefreshTokenId: v.optional(v.id("authRefreshTokens")),
  })
    .index("sessionId", ["sessionId", "_creationTime"])
    .index("sessionIdAndParentRefreshTokenId", ["sessionId", "parentRefreshTokenId", "_creationTime"]),

  // ── Auth: Verification Codes (OTP, magic links, OAuth codes) ──
  authVerificationCodes: defineTable({
    accountId: v.id("authAccounts"),
    provider: v.string(),
    code: v.string(),
    expirationTime: v.number(),
    verifier: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("accountId", ["accountId", "_creationTime"])
    .index("code", ["code", "_creationTime"]),

  // ── Auth: PKCE Verifiers ──
  authVerifiers: defineTable({
    sessionId: v.optional(v.id("authSessions")),
    signature: v.optional(v.string()),
  }).index("signature", ["signature", "_creationTime"]),

  // ── Auth: Rate Limits ──
  authRateLimits: defineTable({
    identifier: v.string(),
    lastAttemptTime: v.number(),
    attemptsLeft: v.number(),
  }).index("identifier", ["identifier", "_creationTime"]),

  // ── Documents table ──
  documents: defineTable({
    userId: v.id("users"),
    type: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("generated"),
      v.literal("paid"),
      v.literal("expired")
    ),
    formData: v.any(),
    pdfUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "type"]),

  // ── Payments table ──
  payments: defineTable({
    userId: v.id("users"),
    documentId: v.optional(v.id("documents")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("created"),
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    cashfreeOrderId: v.optional(v.string()),
    cashfreePaymentId: v.optional(v.string()),
    cashfreeSessionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_cashfreeOrderId", ["cashfreeOrderId"]),

  // ── Subscriptions table ──
  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.union(
      v.literal("starter"),
      v.literal("professional"),
      v.literal("business")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("paused")
    ),
    documentQuota: v.number(),
    documentsUsed: v.number(),
    cashfreeSubId: v.optional(v.string()),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_cashfreeSubId", ["cashfreeSubId"]),
});
