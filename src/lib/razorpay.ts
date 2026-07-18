/**
 * Razorpay Payments SDK wrapper.
 *
 * Handles order creation, payment signature verification,
 * and webhook processing using the official razorpay SDK (v2).
 *
 * Reference: https://razorpay.com/docs/api/
 */

import Razorpay from "razorpay";
import crypto from "crypto";

// --- Configuration ---

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

/**
 * Get a configured Razorpay client instance.
 * Created per-call to avoid stale state in long-running serverless functions.
 */
function getClient(): InstanceType<typeof Razorpay> {
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

// --- Types ---

export interface CreateRazorpayOrderParams {
  amount: number; // in INR (e.g., 499 — NOT paise, the SDK handles conversion)
  currency?: string; // default "INR"
  receipt: string; // unique receipt ID
  notes?: Record<string, string>;
}

export interface CreateRazorpayOrderResult {
  orderId: string;
  amount: number; // in paise (as returned by Razorpay)
  amountInr: number; // in INR for display
  currency: string;
  receipt: string;
}

// --- API Functions ---

/**
 * Create a Razorpay payment order.
 *
 * @param params.amount - Amount in INR (not paise). The function converts internally.
 * @returns Order details including the Razorpay order ID.
 */
export async function createRazorpayOrder(
  params: CreateRazorpayOrderParams
): Promise<CreateRazorpayOrderResult> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  const razorpay = getClient();
  const currency = params.currency || "INR";
  // Razorpay expects amount in paise (1 INR = 100 paise)
  const amountInPaise = params.amount * 100;

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency,
    receipt: params.receipt,
    notes: params.notes || {},
  });

  return {
    orderId: order.id,
    amount: Number(order.amount), // in paise
    amountInr: Number(order.amount) / 100, // in INR
    currency: order.currency,
    receipt: order.receipt || params.receipt,
  };
}

/**
 * Verify the Razorpay payment signature returned from the checkout modal.
 *
 * Use this on the backend to verify that the payment was genuine.
 * The signature is created by hashing order_id + "|" + payment_id with
 * the key_secret using HMAC SHA256.
 *
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID (from checkout success callback)
 * @param signature - Razorpay signature (from checkout success callback)
 * @returns true if the signature is valid
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  } catch {
    return false;
  }
}

/**
 * Verify a Razorpay webhook signature.
 *
 * Razorpay sends webhooks with a signature header (X-Razorpay-Signature).
 * The signature is HMAC SHA256 of the raw request body using the webhook secret.
 *
 * @param payload - Raw request body string
 * @param signature - Value of the X-Razorpay-Signature header
 * @param webhookSecret - The webhook secret from Razorpay dashboard
 * @returns true if the webhook signature is valid
 */
export function verifyRazorpayWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");
    return expectedSignature === signature;
  } catch {
    return false;
  }
}

/**
 * Fetch payment details from Razorpay by payment ID.
 * Useful for verifying payment status server-side.
 */
export async function fetchRazorpayPayment(
  paymentId: string
): Promise<{ status: string; amount: number; orderId: string }> {
  const razorpay = getClient();
  const payment = await razorpay.payments.fetch(paymentId);

  return {
    status: payment.status || "unknown",
    amount: Number(payment.amount || 0),
    orderId: String(payment.order_id || ""),
  };
}
