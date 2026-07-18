import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { getOrderStore } from "@/app/api/payments/create-order/route";

/**
 * Razorpay webhook handler.
 *
 * Receives payment status updates from Razorpay's servers.
 * Verifies the webhook signature before processing.
 *
 * Reference: https://razorpay.com/docs/webhooks/
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // Verify webhook signature
    if (!webhookSecret) {
      console.warn("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const verified = verifyRazorpayWebhookSignature(
      payload,
      signature,
      webhookSecret
    );

    if (!verified) {
      console.warn("[Razorpay Webhook] Invalid signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    let event: any;
    try {
      event = JSON.parse(payload);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const eventType = event.event;
    const paymentData = event.payload?.payment?.entity || {};

    const paymentId = paymentData.id || "";
    const orderId = paymentData.order_id || "";
    const paymentStatus = paymentData.status || "";
    const amount = paymentData.amount || 0;
    const notes = paymentData.notes || {};

    // Try to find the order by receipt (our internal ID stored in notes)
    const receipt = notes?.receipt || "";

    console.log(
      `[Razorpay Webhook] Event: ${eventType}, Payment: ${paymentId}, ` +
        `Status: ${paymentStatus}, Order: ${orderId}, Receipt: ${receipt}`
    );

    // Map Razorpay payment status to our status
    let status: "pending" | "paid" | "failed" = "pending";
    switch (paymentStatus) {
      case "captured":
      case "authorized":
        status = "paid";
        break;
      case "failed":
        status = "failed";
        break;
      default:
        status = "pending";
    }

    // Update in-memory order store using the receipt (our internal ID)
    const orderStore = getOrderStore();

    if (receipt) {
      const existing = orderStore.get(receipt);
      if (existing) {
        orderStore.set(receipt, {
          ...existing,
          status,
        });
        console.log(`[Razorpay Webhook] Updated receipt ${receipt}: ${status}`);
      } else {
        // Store new entry
        orderStore.set(receipt, {
          documentType: notes?.documentType || "unknown",
          amount: amount / 100,
          status,
          createdAt: new Date().toISOString(),
        });
        console.log(
          `[Razorpay Webhook] Created new entry for receipt ${receipt}: ${status}`
        );
      }
    }

    // Also track by Razorpay order_id for cross-reference
    if (orderId) {
      const byOrderId = orderStore.get(orderId);
      if (byOrderId) {
        orderStore.set(orderId, {
          ...byOrderId,
          status,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Razorpay Webhook Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
