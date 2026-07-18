/**
 * WhatsApp Business API service using Twilio.
 *
 * Handles sending messages, PDFs, interactive buttons, and list pickers
 * through the Twilio WhatsApp Business API. Also parses incoming webhook
 * payloads from Twilio.
 *
 * Reference: https://www.twilio.com/docs/whatsapp
 */

import twilio from "twilio";

// --- Configuration ---

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

function getClient(): twilio.Twilio {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error(
      "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
    );
  }
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// --- Types ---

export interface Button {
  id: string;
  title: string;
}

export interface ListItem {
  id: string;
  title: string;
  description?: string;
}

export interface IncomingMessage {
  from: string; // WhatsApp sender number, e.g. "whatsapp:+919876543210"
  text: string; // Message body text
  timestamp: number; // Unix timestamp in milliseconds
  buttonPayload?: string; // Payload if the user clicked a quick-reply button
  listPayload?: string; // Payload if the user selected a list item
  mediaUrl?: string; // URL to media if user sent an image/doc
  mediaContentType?: string;
  numMedia?: number;
}

// --- Send Functions ---

/**
 * Send a plain text message to a WhatsApp number.
 *
 * @param to - The recipient's WhatsApp number, e.g. "whatsapp:+919876543210"
 * @param body - The message body text
 * @returns Twilio message SID
 */
export async function sendMessage(
  to: string,
  body: string
): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    from: TWILIO_PHONE_NUMBER,
    to,
    body,
  });
  return message.sid;
}

/**
 * Send a PDF document as a media message via WhatsApp.
 *
 * Twilio requires the media URL to be publicly accessible.
 * The generate-pdf endpoint serves PDFs directly, so we point Twilio
 * at the production PDF endpoint. For local dev, use a tunnel (e.g., ngrok).
 *
 * @param to - The recipient's WhatsApp number
 * @param pdfUrl - Publicly accessible URL of the PDF
 * @param filename - Display filename for the document
 * @returns Twilio message SID
 */
export async function sendPdf(
  to: string,
  pdfUrl: string,
  filename: string
): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    from: TWILIO_PHONE_NUMBER,
    to,
    body: `📎 ${filename}\n\n⚠️ This is an AI-generated document draft and is not a substitute for licensed legal advice.`,
    mediaUrl: [pdfUrl],
  });
  return message.sid;
}

/**
 * Send a message with interactive quick-reply buttons.
 *
 * Quick-reply buttons let the user tap a button instead of typing.
 * Max 3 buttons per message.
 *
 * @param to - The recipient's WhatsApp number
 * @param body - Body text shown above the buttons
 * @param buttons - Array of up to 3 buttons
 * @returns Twilio message SID
 */
export async function sendInteractiveMessage(
  to: string,
  body: string,
  buttons: Button[]
): Promise<string> {
  if (buttons.length > 3) {
    throw new Error("WhatsApp supports a maximum of 3 quick-reply buttons.");
  }

  const client = getClient();

  // Twilio's approach: use persistent action with List/CTA for buttons.
  // For simple button replies, we use a template-like body text with
  // numbered options as a fallback, since Twilio's interactive messages
  // require approved templates in production.
  //
  // The recommended approach for Twilio WhatsApp: send text + list the
  // button labels since template-free interactive buttons need a workaround.
  const buttonText = buttons
    .map((b, i) => `${i + 1}. ${b.title}`)
    .join("\n");

  const fullBody = `${body}\n\n${buttonText}\n\n_Reply with the number of your choice._`;

  return sendMessage(to, fullBody);
}

/**
 * Send a list picker message (WhatsApp List Message).
 *
 * List messages present a menu of up to 10 items the user can pick from.
 * This uses Twilio's content template approach for list messages.
 *
 * @param to - The recipient's WhatsApp number
 * @param body - Body text shown above the list
 * @param buttonText - Text for the button that opens the list, e.g. "Choose a type"
 * @param items - List items (max 10)
 * @returns Twilio message SID
 */
export async function sendListMessage(
  to: string,
  body: string,
  buttonText: string,
  items: ListItem[]
): Promise<string> {
  if (items.length > 10) {
    throw new Error("WhatsApp supports a maximum of 10 list items.");
  }

  // Since Twilio requires approved templates for true interactive list messages
  // in production, we fall back to a numbered list the user can reply to.
  const itemText = items
    .map((item, i) => `${i + 1}. ${item.title}${item.description ? ` — ${item.description}` : ""}`)
    .join("\n");

  const fullBody = `${body}\n\n${itemText}\n\n_Reply with the number of your choice._`;

  return sendMessage(to, fullBody);
}

// --- Parse Incoming Messages ---

/**
 * Parse a Twilio incoming webhook payload into a clean IncomingMessage.
 *
 * Twilio sends POST data with these relevant fields:
 * - From: The sender's WhatsApp number (e.g. "whatsapp:+919876543210")
 * - Body: The message text
 * - ButtonPayload: Payload from a quick-reply button (template messages)
 * - ListId: The selected list item ID (template messages)
 * - NumMedia: Number of media attachments
 * - MediaUrl0, MediaContentType0: First media attachment
 * - Timestamp: (not sent by default — we use server time)
 *
 * @param body - The parsed webhook body from Twilio
 * @returns Parsed incoming message
 */
export function parseIncomingMessage(body: Record<string, any>): IncomingMessage {
  const from = String(body.From || "");
  const text = String(body.Body || "").trim();

  // Check for interactive message responses
  // Twilio sends button payloads via ButtonPayload field for template messages
  const buttonPayload = body.ButtonPayload || undefined;

  // List selection — Twilio sends the selected item details
  const listPayload = body.ListId || undefined;

  // Media handling
  const numMedia = parseInt(String(body.NumMedia || "0"), 10);
  const mediaUrl = numMedia > 0 ? String(body.MediaUrl0 || "") : undefined;
  const mediaContentType = numMedia > 0 ? String(body.MediaContentType0 || "") : undefined;

  return {
    from,
    text,
    timestamp: Date.now(),
    buttonPayload,
    listPayload,
    mediaUrl,
    mediaContentType,
    numMedia,
  };
}

/**
 * Normalize a phone number to WhatsApp format.
 * Accepts various formats and outputs "whatsapp:+91XXXXXXXXXX"
 */
export function normalizePhone(phone: string): string {
  // If already in WhatsApp format, return as-is
  if (phone.startsWith("whatsapp:")) return phone;

  // Strip non-digit chars except leading +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Add India country code if missing
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      cleaned = "+" + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = "+91" + cleaned;
    } else {
      cleaned = "+" + cleaned;
    }
  }

  return `whatsapp:${cleaned}`;
}
