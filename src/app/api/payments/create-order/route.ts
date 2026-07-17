import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/cashfree";
import { getTemplateById } from "@/lib/document-templates";

// --- Request Schema ---

const createOrderRequestSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().optional(),
  returnUrl: z.string().url("Valid return URL is required"),
});

// --- In-memory order store (stub until Convex/DB is connected) ---
const orderStore = new Map<
  string,
  {
    documentType: string;
    amount: number;
    status: "pending" | "paid" | "failed";
    createdAt: string;
  }
>();

export function getOrderStore() {
  return orderStore;
}

/**
 * POST /api/payments/create-order
 *
 * Creates a Cashfree payment order for a document purchase.
 * Returns { checkoutUrl, orderId } so the frontend can redirect
 * the user to Cashfree's payment page.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { documentType, customerEmail, customerName, customerPhone, returnUrl } =
      parsed.data;

    // Validate document type exists
    const template = getTemplateById(documentType);
    if (!template) {
      return NextResponse.json(
        { error: `Unknown document type: "${documentType}"` },
        { status: 400 }
      );
    }

    const amount = template.price;

    // Generate a unique order ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const orderId = `munsif_${documentType}_${timestamp}_${random}`;

    // Create the Cashfree order
    const result = await createOrder({
      orderId,
      orderAmount: amount,
      customerEmail,
      customerName,
      customerPhone,
      returnUrl,
    });

    // Store pending order in memory
    orderStore.set(orderId, {
      documentType,
      amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      orderId: result.orderId,
      paymentSessionId: result.paymentSessionId,
      amount,
      documentType,
    });
  } catch (error: any) {
    console.error("[Payments] Order creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment order",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/create-order?orderId=xxx
 *
 * Check the status of a previously created order.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json(
      { error: "Missing orderId parameter" },
      { status: 400 }
    );
  }

  const order = orderStore.get(orderId);
  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    orderId,
    ...order,
  });
}
