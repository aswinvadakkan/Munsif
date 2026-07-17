/**
 * Cashfree Payments SDK wrapper.
 *
 * Handles order creation, payment verification, and webhook processing
 * using the official cashfree-pg SDK (v6).
 *
 * Reference: https://docs.cashfree.com/
 */

import { Cashfree, CFEnvironment, type OrderEntity } from "cashfree-pg";

// --- Configuration ---

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "";

function getCashfreeEnv(): CFEnvironment {
  return process.env.CASHFREE_ENV === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;
}

/**
 * Get a configured Cashfree client instance.
 * Created per-call to avoid stale state in long-running serverless functions.
 */
function getClient(): Cashfree {
  return new Cashfree(getCashfreeEnv(), CASHFREE_APP_ID, CASHFREE_SECRET_KEY);
}

/**
 * Returns the Cashfree checkout base URL for the current environment.
 */
function getCheckoutBaseUrl(): string {
  return getCashfreeEnv() === CFEnvironment.PRODUCTION
    ? "https://payments.cashfree.com"
    : "https://payments-test.cashfree.com";
}

// --- Types ---

export interface CreateOrderParams {
  orderId: string; // unique order ID (e.g. "order_xxx_timestamp")
  orderAmount: number; // in INR
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  returnUrl: string; // URL to redirect after payment (must include protocol)
}

export interface CreateOrderResult {
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
  checkoutUrl: string;
}

export interface PaymentVerification {
  status: "success" | "failed" | "pending";
  paymentId?: string;
  orderId: string;
  orderAmount?: number;
}

// --- API Functions ---

/**
 * Create a Cashfree payment order and get a checkout URL.
 */
export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new Error(
      "Cashfree credentials not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY."
    );
  }

  const cashfree = getClient();

  const response = await cashfree.PGCreateOrder({
    order_id: params.orderId,
    order_amount: params.orderAmount,
    order_currency: "INR",
    customer_details: {
      customer_id: params.customerEmail || params.orderId,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone || "9999999999",
      customer_name: params.customerName || "Customer",
    },
    order_meta: {
      return_url: params.returnUrl,
      notify_url: process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/cashfree`
        : undefined,
      payment_methods: undefined, // Allow all payment methods
    },
    order_tags: {
      source: "munsif-ai",
    },
  });

  const order: OrderEntity = response.data;
  const paymentSessionId = order.payment_session_id || "";
  const cfOrderId = order.cf_order_id || "";
  const orderStatus = order.order_status || "ACTIVE";

  // Build the checkout URL using cf_order_id and payment_session_id
  const checkoutUrl = `${getCheckoutBaseUrl()}/checkout/post?cf_id=${cfOrderId}&session_id=${paymentSessionId}`;

  return {
    orderId: params.orderId,
    paymentSessionId,
    orderStatus,
    checkoutUrl,
  };
}

/**
 * Verify payment status by fetching the order from Cashfree.
 */
export async function verifyPayment(
  orderId: string
): Promise<PaymentVerification> {
  const cashfree = getClient();

  try {
    const response = await cashfree.PGFetchOrder(orderId, "verify-" + orderId);
    const order: OrderEntity = response.data;

    const orderStatus = order.order_status || "ACTIVE";

    let status: "success" | "failed" | "pending";
    switch (orderStatus) {
      case "PAID":
        status = "success";
        break;
      case "ACTIVE":
        status = "pending";
        break;
      case "EXPIRED":
      case "FAILED":
      case "TERMINATED":
        status = "failed";
        break;
      default:
        status = "pending";
    }

    // Get payment ID from payments array if available
    const payments = (order as any).payments;
    const paymentId =
      payments && payments.length > 0 ? payments[0].cf_payment_id : undefined;

    return {
      status,
      paymentId,
      orderId: order.order_id || orderId,
      orderAmount: order.order_amount,
    };
  } catch (error: any) {
    // If the order is not found, treat as pending
    console.error("[Cashfree] Payment verification error:", error?.message);
    return {
      status: "pending",
      orderId,
    };
  }
}

/**
 * Verify a Cashfree webhook signature using the official SDK.
 */
export function verifyCashfreeWebhook(
  payload: string,
  signature: string,
  timestamp: string
): { verified: boolean; event?: any } {
  if (!signature || !timestamp) {
    return { verified: false };
  }

  try {
    // Use the Cashfree SDK's built-in webhook verification
    // We create a minimal client just for verification
    const cashfree = new Cashfree(
      getCashfreeEnv(),
      CASHFREE_APP_ID,
      CASHFREE_SECRET_KEY
    );
    const event = cashfree.PGVerifyWebhookSignature(
      signature,
      payload,
      timestamp
    );
    return { verified: true, event: event.object };
  } catch (error: any) {
    console.error("[Cashfree] Webhook verification failed:", error?.message);
    return { verified: false };
  }
}

/**
 * Parse payment status from URL search params returned by Cashfree.
 * Cashfree appends order_id and order_status to the return_url.
 */
export function parseReturnParams(searchParams: URLSearchParams): {
  orderId?: string;
  orderStatus?: string;
} {
  return {
    orderId: searchParams.get("order_id") || undefined,
    orderStatus: searchParams.get("order_status") || undefined,
  };
}
