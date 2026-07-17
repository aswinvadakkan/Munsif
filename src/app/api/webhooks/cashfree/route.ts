import { NextRequest, NextResponse } from "next/server";
import { verifyCashfreeWebhook } from "@/lib/cashfree";
import { getOrderStore } from "@/app/api/payments/create-order/route";

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

    // Verify webhook signature using Cashfree SDK
    const { verified, event } = verifyCashfreeWebhook(
      payload,
      signature,
      timestamp
    );

    if (!verified) {
      console.warn("[Cashfree Webhook] Invalid signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Parse the event
    let data: any;
    try {
      data = typeof event === "object" ? event : JSON.parse(payload);
    } catch {
      data = JSON.parse(payload);
    }

    // Extract order and payment info
    // Cashfree webhook payload structure varies by event type
    const orderData = data?.data || data;
    const orderId = orderData?.order?.order_id || orderData?.order_id || "";
    const orderStatus =
      orderData?.order?.order_status || orderData?.order_status || "";
    const cfPaymentId =
      orderData?.payment?.cf_payment_id ||
      orderData?.cf_payment_id ||
      "";
    const paymentStatus =
      orderData?.payment?.payment_status ||
      orderData?.payment_status ||
      "";

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order_id in webhook payload" },
        { status: 400 }
      );
    }

    // Map Cashfree status to our payment status
    let status: "pending" | "paid" | "failed" = "pending";
    const effectiveStatus = paymentStatus || orderStatus;

    switch (effectiveStatus) {
      case "SUCCESS":
      case "PAID":
        status = "paid";
        break;
      case "ACTIVE":
      case "PENDING":
        status = "pending";
        break;
      case "FAILED":
      case "EXPIRED":
      case "USER_DROPPED":
      case "CANCELLED":
      case "TERMINATED":
        status = "failed";
        break;
      default:
        status = "pending";
    }

    // Update in-memory order store
    const orderStore = getOrderStore();
    const existing = orderStore.get(orderId);
    if (existing) {
      orderStore.set(orderId, {
        ...existing,
        status,
      });
    }

    console.log(
      `[Cashfree Webhook] Order ${orderId}: ${effectiveStatus} → ${status}` +
        (cfPaymentId ? ` (payment: ${cfPaymentId})` : "")
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
