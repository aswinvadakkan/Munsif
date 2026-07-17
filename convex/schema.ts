import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table — auth identity linked to Convex
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]),

  // Documents table — one row per generated document
  documents: defineTable({
    userId: v.id("users"),
    type: v.string(), // e.g. "rental-agreement", "nda", "employment-contract"
    status: v.union(
      v.literal("draft"),
      v.literal("generated"),
      v.literal("paid"),
      v.literal("expired")
    ),
    formData: v.any(), // The full questionnaire answers object
    pdfUrl: v.optional(v.string()), // URL to generated PDF
    metadata: v.optional(v.any()), // Extra metadata (language, version, etc.)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "type"]),

  // Payments table — Cashfree payment records
  payments: defineTable({
    userId: v.id("users"),
    documentId: v.optional(v.id("documents")),
    amount: v.number(), // in INR paise (e.g., 49900 = ₹499)
    currency: v.string(), // "INR"
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

  // Subscriptions table — recurring plans
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
    documentQuota: v.number(), // Monthly doc limit
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
