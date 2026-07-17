import { NextRequest, NextResponse } from "next/server";
import { verifyCashfreeWebhook } from "@/lib/cashfree";

/**
 * Cashfree webhook handler.
 * 
 * Receives payment status updates from Cashfree's servers.
 * Verifies the webhook signature before processing.
 * 
 * Reference: https://docs.cashfree.com/docs/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    // Verify webhook signature
    if (!verifyCashfreeWebhook(payload, signature, timestamp)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const { order_id, order_status, cf_payment_id } = event.data || {};

    if (!order_id) {
      return NextResponse.json(
        { error: "Missing order_id" },
        { status: 400 }
      );
    }

    // Map Cashfree status to our payment status
    let status: "pending" | "completed" | "failed" | "refunded" = "pending";
    switch (order_status) {
      case "PAID":
        status = "completed";
        break;
      case "ACTIVE":
        status = "pending";
        break;
      case "EXPIRED":
      case "FAILED":
        status = "failed";
        break;
      default:
        status = "pending";
    }

    // TODO: Update payment in Convex
    // await updatePaymentStatus({
    //   cashfreeOrderId: order_id,
    //   status,
    //   cashfreePaymentId: cf_payment_id,
    // });

    console.log(
      `[Cashfree Webhook] Order ${order_id}: ${order_status} → ${status}`
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Cashfree Webhook Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
