import { NextRequest, NextResponse } from "next/server";
import {
  parseIncomingMessage,
  sendMessage,
  sendPdf,
  sendInteractiveMessage,
  normalizePhone,
  type IncomingMessage,
  type Button,
  type ListItem,
} from "@/lib/whatsapp";
import { getTemplateById, type DocumentTemplate, type FormField } from "@/lib/document-templates";
import { generatePdf } from "@/lib/pdf";

// ============================================================
// Session types & store
// ============================================================

type SessionState =
  | "welcome"
  | "choosing_doc"
  | "collecting_fields"
  | "generating"
  | "done";

interface Session {
  phone: string;
  state: SessionState;
  documentType?: string;
  currentFieldIndex?: number;
  answers: Record<string, string>;
  lastActivity: number;
  /** The list of fields we're collecting, in order (max ~6) */
  fields: WhatsAppField[];
}

interface WhatsAppField {
  id: string;
  question: string;
  required: boolean;
}

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

// In-memory session store
const sessions = new Map<string, Session>();

function getSession(phone: string): Session | undefined {
  const session = sessions.get(phone);
  if (!session) return undefined;

  // Check TTL
  if (Date.now() - session.lastActivity > SESSION_TTL_MS) {
    sessions.delete(phone);
    return undefined;
  }

  // Touch lastActivity
  session.lastActivity = Date.now();
  return session;
}

function setSession(session: Session): void {
  session.lastActivity = Date.now();
  sessions.set(session.phone, session);
}

function deleteSession(phone: string): void {
  sessions.delete(phone);
}

// ============================================================
// Document type definitions for WhatsApp
// ============================================================

interface DocTypeEntry {
  id: string;
  name: string;
  emoji: string;
}

const DOC_TYPES: DocTypeEntry[] = [
  { id: "rental-agreement", name: "Rental Agreement", emoji: "🏠" },
  { id: "nda", name: "Non-Disclosure Agreement", emoji: "🔒" },
  { id: "employment-contract", name: "Employment Contract", emoji: "💼" },
  { id: "freelance-agreement", name: "Freelance Agreement", emoji: "✍️" },
  { id: "partnership-deed", name: "Partnership Deed", emoji: "🤝" },
  { id: "legal-notice", name: "Legal Notice", emoji: "⚖️" },
  { id: "affidavit", name: "Affidavit", emoji: "📝" },
  { id: "terms-of-service", name: "Terms of Service", emoji: "📋" },
];

function getDocTypeById(id: string): DocTypeEntry | undefined {
  return DOC_TYPES.find((d) => d.id === id);
}

// ============================================================
// Field extractor: picks the most important 5-6 fields per doc
// ============================================================

function buildWhatsAppFields(template: DocumentTemplate): WhatsAppField[] {
  const priorityIds: Record<string, string[]> = {
    "rental-agreement": [
      "landlordName", "tenantName", "propertyAddress",
      "monthlyRent", "leaseStart", "leaseDuration",
    ],
    "nda": [
      "disclosingParty", "receivingParty", "purpose",
      "duration", "governingState",
    ],
    "employment-contract": [
      "employerName", "employeeName", "jobTitle",
      "startDate", "salary", "probationMonths",
    ],
    "freelance-agreement": [
      "clientName", "freelancerName", "projectDescription",
      "totalFee", "timeline", "paymentSchedule",
    ],
    "partnership-deed": [
      "firmName", "partner1Name", "partner2Name",
      "partner1Capital", "partner2Capital", "profitSharingRatio",
    ],
    "legal-notice": [
      "senderName", "recipientName", "subject",
      "grievanceNature", "reliefSought", "deadlineDays",
    ],
    "affidavit": [
      "deponentName", "parentName", "deponentAge",
      "affidavitPurpose", "statementOfFacts", "courtAuthority",
    ],
    "terms-of-service": [
      "companyName", "websiteUrl", "contactEmail",
      "serviceDescription", "governingState", "lastUpdated",
    ],
  };

  const ids = priorityIds[template.id] || [];
  const fields: WhatsAppField[] = [];

  for (const id of ids) {
    // Find the field across all form steps
    let found: FormField | undefined;
    for (const step of template.formSteps) {
      const f = step.fields.find((f) => f.id === id);
      if (f) {
        found = f;
        break;
      }
    }

    if (found) {
      fields.push({
        id: found.id,
        question: found.label,
        required: found.required,
      });
    }
  }

  return fields;
}

// ============================================================
// Build document body content from answers
// ============================================================

function buildDocumentContent(
  template: DocumentTemplate,
  answers: Record<string, string>
): string {
  const lines: string[] = [];
  lines.push(`# ${template.name}`);
  lines.push("");
  lines.push("## Details");
  lines.push("");

  for (const step of template.formSteps) {
    for (const field of step.fields) {
      const answer = answers[field.id];
      if (answer) {
        lines.push(`**${field.label}:** ${answer}`);
      } else if (field.required) {
        lines.push(`**${field.label}:** [Not Provided]`);
      }
    }
  }

  lines.push("");
  lines.push("---");
  lines.push("*This document is AI-generated by Munsif AI. It is not a substitute for licensed legal advice.*");

  return lines.join("\n");
}

// ============================================================
// Message templates
// ============================================================

const WELCOME_MESSAGE =
  "Welcome to *Munsif AI*! 🇮🇳\n\nI can help you create legal documents in minutes — right here on WhatsApp.\n\nWhat would you like to do?";

const WELCOME_BUTTONS: Button[] = [
  { id: "create_doc", title: "📄 Create a Document" },
  { id: "my_docs", title: "📋 My Documents" },
  { id: "help", title: "❓ Help" },
];

const HELP_MESSAGE =
  "*Munsif AI* helps you create legally grounded, India-specific documents.\n\n" +
  "📄 *Available Documents:*\n" +
  "• Rental Agreement\n" +
  "• Non-Disclosure Agreement\n" +
  "• Employment Contract\n" +
  "• Freelance Agreement\n" +
  "• Partnership Deed\n" +
  "• Legal Notice\n" +
  "• Affidavit\n" +
  "• Terms of Service\n\n" +
  "⚖️ All documents reference Indian contract law and stamp duty norms.\n" +
  "⚠️ All documents are AI-generated and not a substitute for licensed legal advice.\n\n" +
  "What would you like to do?";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://munsif.ai";

// ============================================================
// Core handler: process an incoming message
// ============================================================

async function processMessage(msg: IncomingMessage): Promise<void> {
  const phone = normalizePhone(msg.from);
  const userText = msg.text.toLowerCase().trim();

  // Check for global commands
  if (userText === "restart" || userText === "start over") {
    deleteSession(phone);
    await sendInteractiveMessage(phone, WELCOME_MESSAGE, WELCOME_BUTTONS);
    return;
  }

  if (userText === "done" || userText === "exit") {
    deleteSession(phone);
    await sendMessage(
      phone,
      "Thanks for using Munsif AI! 🇮🇳\n\nType anything to start again whenever you need a legal document."
    );
    return;
  }

  // --- RESUME CHECK: if user has an existing incomplete session ---
  let session = getSession(phone);

  if (!session) {
    // New user — show welcome
    setSession({
      phone,
      state: "welcome",
      answers: {},
      lastActivity: Date.now(),
      fields: [],
    });
    await sendInteractiveMessage(phone, WELCOME_MESSAGE, WELCOME_BUTTONS);
    return;
  }

  // --- RESUME: if returning user with in-progress session ---
  if (session.state === "collecting_fields" && session.documentType) {
    // Offer resume
    const resumeKeywords = ["continue", "yes", "1", "resume"];
    const startNewKeywords = ["start new", "new", "2", "no", "restart"];

    if (resumeKeywords.some((kw) => userText.includes(kw))) {
      // Resume collecting
      await sendNextField(session);
      return;
    }

    if (startNewKeywords.some((kw) => userText.includes(kw))) {
      deleteSession(phone);
      setSession({
        phone,
        state: "welcome",
        answers: {},
        lastActivity: Date.now(),
        fields: [],
      });
      await sendInteractiveMessage(phone, WELCOME_MESSAGE, WELCOME_BUTTONS);
      return;
    }

    // First time they're back — offer resume
    const dtEntry = getDocTypeById(session.documentType);
    const docName = dtEntry?.name || session.documentType;
    const progress = session.currentFieldIndex || 0;
    const total = session.fields.length;

    await sendInteractiveMessage(
      phone,
      `You have an in-progress *${docName}* (${progress}/${total} fields completed). Continue where you left off?`,
      [
        { id: "continue", title: "✅ Continue" },
        { id: "start_new", title: "🔄 Start New" },
      ]
    );
    return;
  }

  // --- STATE MACHINE ---

  switch (session.state) {
    case "welcome":
      await handleWelcome(phone, userText, session);
      break;

    case "choosing_doc":
      await handleChooseDoc(phone, userText, session);
      break;

    case "collecting_fields":
      await handleFieldAnswer(phone, userText, session);
      break;

    case "done":
      await handleDone(phone, userText);
      break;

    default:
      await sendInteractiveMessage(phone, WELCOME_MESSAGE, WELCOME_BUTTONS);
  }
}

// --- Welcome state ---

async function handleWelcome(
  phone: string,
  text: string,
  session: Session
): Promise<void> {
  if (text.includes("create") || text.includes("1") || text.includes("📄")) {
    session.state = "choosing_doc";
    setSession(session);
    await sendDocTypeList(phone);
    return;
  }

  if (text.includes("my doc") || text.includes("2") || text.includes("📋")) {
    await sendMessage(
      phone,
      `You can view and download your documents at:\n${SITE_URL}/dashboard/documents`
    );
    await sendInteractiveMessage(
      phone,
      "What would you like to do next?",
      WELCOME_BUTTONS
    );
    return;
  }

  if (text.includes("help") || text.includes("3") || text.includes("❓")) {
    await sendMessage(phone, HELP_MESSAGE);
    await sendInteractiveMessage(
      phone,
      "What would you like to do?",
      WELCOME_BUTTONS
    );
    return;
  }

  // Unrecognized — resend welcome
  await sendInteractiveMessage(phone, WELCOME_MESSAGE, WELCOME_BUTTONS);
}

// --- Choose document state ---

async function sendDocTypeList(phone: string): Promise<void> {
  const items: ListItem[] = DOC_TYPES.map((dt) => ({
    id: dt.id,
    title: `${dt.emoji} ${dt.name}`,
  }));

  const itemText = DOC_TYPES.map((dt, i) => `${i + 1}. ${dt.emoji} *${dt.name}*`).join("\n");

  await sendMessage(
    phone,
    `Choose a document type:\n\n${itemText}\n\n_Reply with the number (1-${DOC_TYPES.length}) or the document name._`
  );
}

async function handleChooseDoc(
  phone: string,
  text: string,
  session: Session
): Promise<void> {
  // Check if they replied with a number
  const numMatch = text.match(/^(\d+)$/);
  let selectedDoc: DocTypeEntry | undefined;

  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1;
    if (idx >= 0 && idx < DOC_TYPES.length) {
      selectedDoc = DOC_TYPES[idx];
    }
  } else {
    // Try to match by name
    selectedDoc = DOC_TYPES.find(
      (dt) =>
        text.includes(dt.name.toLowerCase()) ||
        text.includes(dt.id.toLowerCase().replace(/-/g, " "))
    );
  }

  if (!selectedDoc) {
    await sendDocTypeList(phone);
    return;
  }

  const template = getTemplateById(selectedDoc.id);
  if (!template) {
    await sendMessage(phone, "Sorry, something went wrong. Please try again.");
    await sendDocTypeList(phone);
    return;
  }

  // Build the WhatsApp fields (top 5-6)
  const fields = buildWhatsAppFields(template);

  session.state = "collecting_fields";
  session.documentType = selectedDoc.id;
  session.currentFieldIndex = 0;
  session.fields = fields;
  session.answers = {};
  setSession(session);

  await sendMessage(
    phone,
    `Great! To create your *${selectedDoc.emoji} ${selectedDoc.name}*, I'll need some information.\n\nI'll ask you ${fields.length} questions, one at a time. You can type "skip" for optional fields or "restart" to start over.\n\nLet's begin!`
  );

  // Send first field
  await sendNextField(session);
}

// --- Collecting fields state ---

async function sendNextField(session: Session): Promise<void> {
  const idx = session.currentFieldIndex || 0;
  const fields = session.fields;

  if (idx >= fields.length) {
    // All fields collected — generate document
    await generateAndSendDocument(session);
    return;
  }

  const field = fields[idx];
  const progress = `Question ${idx + 1} of ${fields.length}`;

  let message = `${progress}\n\n${field.question}`;
  if (!field.required) {
    message += "\n\n_(Optional - reply 'skip' to leave blank)_";
  }

  setSession(session);
  await sendMessage(session.phone, message);
}

async function handleFieldAnswer(
  phone: string,
  text: string,
  session: Session
): Promise<void> {
  const idx = session.currentFieldIndex || 0;
  const fields = session.fields;

  if (idx >= fields.length) {
    // Shouldn't happen, but just in case
    await generateAndSendDocument(session);
    return;
  }

  const field = fields[idx];
  const answer = text.trim();

  // Handle skip for optional fields
  if (answer.toLowerCase() === "skip") {
    if (field.required) {
      await sendMessage(
        phone,
        `This field is required. ${field.question}`
      );
      return;
    }
    session.answers[field.id] = "";
  } else {
    session.answers[field.id] = answer;
  }

  // Move to next field
  session.currentFieldIndex = (idx + 1);
  setSession(session);

  await sendNextField(session);
}

// --- Generate & send document ---

async function generateAndSendDocument(session: Session): Promise<void> {
  const docType = session.documentType;
  if (!docType) {
    await sendMessage(session.phone, "Something went wrong. Please start again.");
    deleteSession(session.phone);
    return;
  }

  const template = getTemplateById(docType);
  const dtEntry = getDocTypeById(docType);
  const docName = dtEntry?.name || docType;

  if (!template) {
    await sendMessage(session.phone, "Template not found. Please start again.");
    deleteSession(session.phone);
    return;
  }

  // Send "generating" message
  await sendMessage(
    session.phone,
    `⏳ I have all the information. Your *${docName}* is being generated...\n\nThis should take a few seconds.`
  );

  session.state = "generating";
  setSession(session);

  try {
    const bodyContent = buildDocumentContent(template, session.answers);

    const result = await generatePdf({
      bodyContent,
      title: template.name,
      documentType: template.name,
      language: "en",
    });

    // For sending PDF via WhatsApp, we need a publicly accessible URL.
    // In production, we'd upload to cloud storage and share the URL.
    // For now, since we can't share a local file, we generate a text summary
    // and point users to the web dashboard for the PDF.

    // Build a nice summary to send via WhatsApp
    const summaryLines: string[] = [];
    summaryLines.push(`✅ *Your ${docName} is ready!*`);
    summaryLines.push("");
    for (const field of session.fields) {
      const answer = session.answers[field.id];
      if (answer) {
        summaryLines.push(`• ${field.question}: ${answer}`);
      }
    }
    summaryLines.push("");
    summaryLines.push(`📎 *Download your PDF:*`);
    summaryLines.push(`${SITE_URL}/dashboard/documents`);
    summaryLines.push("");
    summaryLines.push("⚠️ This is an AI-generated document draft and is not a substitute for licensed legal advice.");

    await sendMessage(session.phone, summaryLines.join("\n"));

  } catch (error) {
    console.error("[WhatsApp] PDF generation error:", error);
    await sendMessage(
      session.phone,
      "Sorry, there was an error generating your document. Please try again later."
    );
  }

  // Move to done state
  session.state = "done";
  setSession(session);

  await sendInteractiveMessage(
    session.phone,
    "What would you like to do next?",
    [
      { id: "create_another", title: "📄 Create Another" },
      { id: "my_docs_btn", title: "📋 My Documents" },
      { id: "done_btn", title: "✅ Done" },
    ]
  );
}

// --- Done state ---

async function handleDone(phone: string, text: string): Promise<void> {
  if (text.includes("create") || text.includes("1") || text.includes("📄")) {
    deleteSession(phone);
    const session: Session = {
      phone,
      state: "choosing_doc",
      answers: {},
      lastActivity: Date.now(),
      fields: [],
    };
    setSession(session);
    await sendDocTypeList(phone);
    return;
  }

  if (
    text.includes("my doc") ||
    text.includes("2") ||
    text.includes("📋")
  ) {
    await sendMessage(
      phone,
      `You can view and download your documents at:\n${SITE_URL}/dashboard/documents`
    );
    await sendInteractiveMessage(
      phone,
      "What would you like to do next?",
      [
        { id: "create_another", title: "📄 Create Another" },
        { id: "my_docs_btn", title: "📋 My Documents" },
        { id: "done_btn", title: "✅ Done" },
      ]
    );
    return;
  }

  if (text.includes("done") || text.includes("3") || text.includes("✅")) {
    deleteSession(phone);
    await sendMessage(
      phone,
      "Thanks for using Munsif AI! 🇮🇳\n\nType anything to start again whenever you need a legal document."
    );
    return;
  }

  // Unrecognized — resend done options
  await sendInteractiveMessage(
    phone,
    "What would you like to do next?",
    [
      { id: "create_another", title: "📄 Create Another" },
      { id: "my_docs_btn", title: "📋 My Documents" },
      { id: "done_btn", title: "✅ Done" },
    ]
  );
}

// ============================================================
// Next.js Route Handler
// ============================================================

/**
 * POST /api/webhooks/whatsapp
 *
 * Handles incoming WhatsApp messages from Twilio.
 * Twilio sends POST with URL-encoded form data.
 */
export async function POST(request: NextRequest) {
  try {
    // Twilio sends form-encoded data
    const contentType = request.headers.get("content-type") || "";
    let body: Record<string, any>;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // URL-encoded form data
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }

    console.log("[WhatsApp Webhook] Received message:", {
      from: body.From,
      body: body.Body?.substring(0, 50),
    });

    const msg = parseIncomingMessage(body);

    // Process the message (this sends responses back via Twilio)
    await processMessage(msg);

    // Always respond with 200 OK — Twilio expects this
    // Respond with an empty TwiML or plain 200
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("[WhatsApp Webhook Error]", error);

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }
}

/**
 * GET — Twilio may send a validation GET request when configuring the webhook.
 * Return a simple OK response.
 */
export async function GET() {
  return NextResponse.json({ status: "ok", service: "munsif-ai-whatsapp-bot" });
}
