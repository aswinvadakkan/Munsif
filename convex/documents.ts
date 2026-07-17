import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new document record (draft status).
 */
export const createDraft = mutation({
  args: {
    type: v.string(),
    formData: v.any(),
    metadata: v.optional(v.any()),
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
    const docId = await ctx.db.insert("documents", {
      userId: user._id,
      type: args.type,
      status: "draft",
      formData: args.formData,
      metadata: args.metadata || {},
      createdAt: now,
      updatedAt: now,
    });

    return docId;
  },
});

/**
 * Get all documents for the current user.
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

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return docs;
  },
});

/**
 * Get a single document by ID.
 */
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || doc.userId !== user._id) {
      throw new Error("Access denied");
    }

    return doc;
  },
});

/**
 * Update document status and PDF URL after generation + payment.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("documents"),
    status: v.union(
      v.literal("generated"),
      v.literal("paid"),
      v.literal("expired")
    ),
    pdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || doc.userId !== user._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      pdfUrl: args.pdfUrl,
      updatedAt: Date.now(),
    });
  },
});
