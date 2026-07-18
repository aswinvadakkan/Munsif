import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRazorpayOrder } from "@/lib/razorpay";
import { getTemplateById } from "@/lib/document-templates";

// --- Request Schema ---

const createRazorpayOrderRequestSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  customerEmail: z.string().email("Valid email is required").optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

// --- Shared in-memory order store (same store used by Cashfree) ---
// Import the shared store from the Cashfree route
import { getOrderStore } from "@/app/api/payments/create-order/route";

/**
 * POST /api/payments/create-razorpay-order
 *
 * Creates a Razorpay payment order for a document purchase.
 * Returns { orderId, amount, keyId } so the frontend can open
 * the Razorpay checkout modal.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createRazorpayOrderRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { documentType, customerEmail, customerName } = parsed.data;

    // Validate document type exists
    const template = getTemplateById(documentType);
    if (!template) {
      return NextResponse.json(
        { error: `Unknown document type: "${documentType}"` },
        { status: 400 }
      );
    }

    const amount = template.price;

    // Generate a unique receipt/order ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const receipt = `munsif_rzp_${documentType}_${timestamp}_${random}`;

    // Create the Razorpay order
    const result = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt,
      notes: {
        documentType,
        customerEmail: customerEmail || "",
        customerName: customerName || "",
        source: "munsif-ai",
      },
    });

    // Store pending order in the shared in-memory store
    const orderStore = getOrderStore();
    orderStore.set(receipt, {
      documentType,
      amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      orderId: result.orderId,
      amount: result.amountInr,
      amountPaise: result.amount,
      currency: result.currency,
      receipt: result.receipt,
      keyId: process.env.RAZORPAY_KEY_ID || "",
    });
  } catch (error: any) {
    console.error("[Payments] Razorpay order creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create Razorpay payment order",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
