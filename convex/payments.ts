import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a payment record when a Cashfree order is initiated.
 */
export const createPayment = mutation({
  args: {
    documentId: v.optional(v.id("documents")),
    amount: v.number(),
    currency: v.string(),
    cashfreeOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    const paymentId = await ctx.db.insert("payments", {
      userId: user._id,
      documentId: args.documentId,
      amount: args.amount,
      currency: args.currency,
      status: "created",
      cashfreeOrderId: args.cashfreeOrderId,
      createdAt: now,
      updatedAt: now,
    });

    return paymentId;
  },
});

/**
 * Update payment status from Cashfree webhook.
 */
export const updatePaymentStatus = mutation({
  args: {
    cashfreeOrderId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    cashfreePaymentId: v.optional(v.string()),
    cashfreeSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_cashfreeOrderId", (q) =>
        q.eq("cashfreeOrderId", args.cashfreeOrderId)
      )
      .first();

    if (!payment) throw new Error("Payment not found");

    await ctx.db.patch(payment._id, {
      status: args.status,
      cashfreePaymentId: args.cashfreePaymentId,
      cashfreeSessionId: args.cashfreeSessionId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * List payments for the current user.
 */
export const listByUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return [];

    return ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
