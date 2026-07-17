/**
 * Shared utility functions.
 */

// Lightweight classname joiner — no external dependency needed
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format Indian Rupee amounts.
 */
export function formatINR(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Format date in Indian locale.
 */
export function formatDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

/**
 * Generate a unique order ID for Cashfree.
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MUNSIF_${timestamp}_${random}`.toUpperCase();
}

/**
 * Truncate text for display.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Get document status badge color classes.
 */
export function getStatusClasses(
  status: string
): { bg: string; text: string; label: string } {
  switch (status) {
    case "draft":
      return { bg: "bg-stone-100", text: "text-stone-600", label: "Draft" };
    case "generated":
      return { bg: "bg-blue-50", text: "text-blue-700", label: "Generated" };
    case "paid":
      return { bg: "bg-teal-50", text: "text-teal-700", label: "Ready" };
    case "expired":
      return { bg: "bg-red-50", text: "text-red-600", label: "Expired" };
    default:
      return { bg: "bg-stone-100", text: "text-stone-600", label: status };
  }
}
