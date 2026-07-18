/**
 * PDF HTML template builder.
 * Wraps document content in a full HTML document designed for
 * professional PDF rendering via Playwright/Chromium.
 *
 * Output targets A4 paper with legal-document typography:
 * - Serif body (Georgia)
 * - Clean section headings
 * - Signature blocks
 * - AI disclaimer watermark/banner
 * - Page numbers with generation metadata
 */

export interface SignatureOptions {
  /** PNG data URL of the signature image */
  signatureImage?: string;
  /** Printed name of signer */
  signerName: string;
  /** Display date of signing */
  signDate: string;
  /** Whether this is a signed copy */
  isSigned: boolean;
}

export interface PdfTemplateOptions {
  title: string;
  documentType: string;
  bodyContent: string;
  generationTimestamp: string;
  documentId?: string;
  language?: "en" | "hi";
  /** E-signature data — when provided, a signature section is added before the disclaimer */
  signature?: SignatureOptions;
}

/**
 * Build a full HTML document for PDF rendering.
 * The output is designed to look like a real legal document,
 * not a web page.
 */
export function buildPdfHtml(options: PdfTemplateOptions): string {
  const {
    title,
    documentType,
    bodyContent,
    generationTimestamp,
    documentId = generateDocId(),
    language = "en",
    signature,
  } = options;

  const direction = language === "hi" ? "rtl" : "ltr";

  return `<!DOCTYPE html>
<html lang="${language}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — Munsif AI</title>
  <style>
    /* === Reset & Base === */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-size: 11pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      font-size: 1rem;
      line-height: 1.75;
      color: #1c1917;
      padding: 25mm 20mm 30mm 20mm;
      max-width: 210mm;
      margin: 0 auto;
      counter-reset: page;
    }

    /* === Print-specific overrides === */
    @page {
      size: A4;
      margin: 25mm 20mm;
      @bottom-center {
        content: "Page " counter(page);
        font-family: Georgia, Cambria, "Times New Roman", Times, serif;
        font-size: 8pt;
        color: #78716c;
      }
    }

    @media print {
      body {
        padding: 0;
      }
    }

    /* === Watermark === */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-20deg);
      font-size: 64pt;
      font-weight: bold;
      color: rgba(255, 156, 54, 0.08);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 0.1em;
    }

    /* === Header === */
    .doc-header {
      border-bottom: 2.5px solid #248374;
      padding-bottom: 16px;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }

    .doc-header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .doc-header-brand {
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      font-size: 14pt;
      font-weight: 700;
      color: #248374;
      letter-spacing: 0.02em;
    }

    .doc-header-meta {
      text-align: right;
      font-size: 8pt;
      color: #78716c;
      line-height: 1.5;
    }

    .doc-header-title {
      font-size: 18pt;
      font-weight: 700;
      color: #1c1917;
      margin-top: 12px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .doc-header-subtitle {
      font-size: 9pt;
      color: #78716c;
      margin-top: 2px;
    }

    /* === Body Typography === */
    h1 {
      font-size: 14pt;
      font-weight: 700;
      margin-top: 28px;
      margin-bottom: 12px;
      color: #1c1917;
      page-break-after: avoid;
    }

    h2 {
      font-size: 12pt;
      font-weight: 700;
      margin-top: 22px;
      margin-bottom: 10px;
      color: #292524;
      page-break-after: avoid;
    }

    h3 {
      font-size: 11pt;
      font-weight: 700;
      margin-top: 18px;
      margin-bottom: 8px;
      color: #44403c;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 10px;
      text-align: justify;
    }

    .clause {
      margin-bottom: 12px;
      padding-left: 0;
      text-align: justify;
    }

    .clause-number {
      font-weight: 700;
    }

    /* === Tables (party details, schedules) === */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }

    table.parties {
      border: 1px solid #d6d3d1;
    }

    table.parties th {
      background-color: #f5f5f4;
      font-weight: 700;
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid #d6d3d1;
      font-size: 10pt;
    }

    table.parties td {
      padding: 8px 12px;
      border-bottom: 1px solid #e7e5e4;
      vertical-align: top;
    }

    table.terms {
      border: none;
    }

    table.terms td {
      padding: 4px 8px 4px 0;
      vertical-align: top;
    }

    table.terms td:first-child {
      font-weight: 600;
      white-space: nowrap;
      padding-right: 16px;
      color: #57534e;
    }

    /* === Signature Block === */
    .signature-block {
      margin-top: 48px;
      page-break-inside: avoid;
    }

    .signature-block p {
      margin-bottom: 36px;
    }

    .signature-line {
      display: inline-block;
      width: 45%;
    }

    .signature-line .line {
      border-top: 1px solid #1c1917;
      margin-top: 48px;
      margin-bottom: 6px;
    }

    .signature-line .label {
      font-size: 9pt;
      color: #78716c;
    }

    .signatures-row {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-top: 16px;
    }

    /* === E-Signature Section === */
    .esig-section {
      margin-top: 40px;
      padding: 18px 20px;
      border: 1.5px solid #d6d3d1;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    .esig-section .esig-title {
      font-size: 10pt;
      font-weight: 700;
      color: #57534e;
      margin-bottom: 18px;
      letter-spacing: 0.02em;
    }

    .esig-row {
      display: flex;
      gap: 32px;
      align-items: flex-end;
    }

    .esig-draw-area {
      flex: 1;
      min-width: 200px;
    }

    .esig-draw-area img {
      max-width: 280px;
      max-height: 80px;
      object-fit: contain;
    }

    .esig-draw-area .esig-line {
      border-top: 1px solid #1c1917;
      margin-top: 8px;
      padding-top: 4px;
      font-size: 8.5pt;
      color: #78716c;
      text-align: center;
    }

    .esig-details {
      flex: 1;
      font-size: 9pt;
    }

    .esig-details .esig-detail-row {
      margin-bottom: 10px;
    }

    .esig-details .esig-detail-label {
      font-size: 7.5pt;
      color: #78716c;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .esig-details .esig-detail-value {
      font-weight: 600;
      color: #1c1917;
      border-bottom: 1px solid #d6d3d1;
      padding-bottom: 2px;
      min-height: 18px;
    }

    .esig-note {
      margin-top: 14px;
      font-size: 8pt;
      color: #78716c;
      font-style: italic;
    }

    /* === Signed Copy Stamp === */
    .signed-copy-stamp {
      position: fixed;
      bottom: 100px;
      right: 40px;
      padding: 8px 18px;
      border: 3px solid #248374;
      border-radius: 8px;
      color: #248374;
      font-size: 14pt;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      transform: rotate(-5deg);
      opacity: 0.7;
      pointer-events: none;
      z-index: 5;
    }

    /* === AI Disclaimer Banner === */
    .disclaimer-banner {
      margin-top: 40px;
      padding: 14px 18px;
      border: 1.5px solid #ff9c36;
      border-left: 5px solid #ff9c36;
      background-color: #fff8ed;
      font-size: 9pt;
      color: #9e3d0d;
      line-height: 1.6;
      page-break-inside: avoid;
      border-radius: 3px;
    }

    .disclaimer-banner strong {
      display: block;
      margin-bottom: 4px;
      font-size: 9.5pt;
      color: #c74d06;
    }

    /* === Footer === */
    .doc-footer {
      margin-top: 48px;
      padding-top: 14px;
      border-top: 1px solid #d6d3d1;
      font-size: 8pt;
      color: #78716c;
      text-align: center;
      line-height: 1.6;
      page-break-inside: avoid;
    }

    .doc-footer .doc-id {
      font-family: "Courier New", Courier, monospace;
      font-size: 7.5pt;
      color: #a8a29e;
    }

    /* === Print helpers === */
    .page-break {
      page-break-before: always;
    }

    .avoid-break {
      page-break-inside: avoid;
    }

    /* === Indian Contract Act references === */
    .ica-ref {
      font-size: 8.5pt;
      color: #78716c;
      font-style: italic;
    }

    /* === Preformatted (from document-previews) === */
    .doc-body {
      position: relative;
      z-index: 1;
    }

    .doc-body {
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      font-size: 1rem;
      line-height: 1.75;
      color: #1c1917;
    }

    .doc-body h1 { font-size: 14pt; font-weight: 700; margin: 28px 0 12px; color: #1c1917; page-break-after: avoid; }
    .doc-body h2 { font-size: 12pt; font-weight: 700; margin: 22px 0 10px; color: #292524; page-break-after: avoid; }
    .doc-body h3 { font-size: 11pt; font-weight: 700; margin: 18px 0 8px; color: #44403c; page-break-after: avoid; }
    .doc-body p { margin-bottom: 10px; text-align: justify; }
    .doc-body em { font-style: italic; }
  </style>
</head>
<body>
  <!-- Watermark -->
  <div class="watermark">AI-GENERATED DOCUMENT</div>

  <!-- Header -->
  <div class="doc-header">
    <div class="doc-header-top">
      <div class="doc-header-brand">Munsif AI</div>
      <div class="doc-header-meta">
        <div>Document ID: ${escapeHtml(documentId)}</div>
        <div>Generated: ${escapeHtml(generationTimestamp)}</div>
        <div>Document Type: ${escapeHtml(documentType)}</div>
      </div>
    </div>
    <div class="doc-header-title">${escapeHtml(title)}</div>
    <div class="doc-header-subtitle">Prepared by Munsif AI — AI-Generated Legal Document Draft</div>
  </div>

  <!-- Body -->
  <div class="doc-body">
    ${bodyContent}
  </div>

  <!-- E-Signature Section (only when signed) -->
  ${
    signature && signature.isSigned
      ? `
  <div class="esig-section">
    <div class="esig-title">✍️ Electronically Signed</div>
    <div class="esig-row">
      <div class="esig-draw-area">
        ${
          signature.signatureImage
            ? `<img src="${signature.signatureImage}" alt="Signature" />`
            : `<div style="height: 80px;"></div>`
        }
        <div class="esig-line">Signature</div>
      </div>
      <div class="esig-details">
        <div class="esig-detail-row">
          <div class="esig-detail-label">Printed Name</div>
          <div class="esig-detail-value">${escapeHtml(signature.signerName)}</div>
        </div>
        <div class="esig-detail-row">
          <div class="esig-detail-label">Date</div>
          <div class="esig-detail-value">${escapeHtml(signature.signDate)}</div>
        </div>
      </div>
    </div>
    <div class="esig-note">
      Digitally signed via <strong>Munsif AI</strong>. This is an electronic signature
      and may be subject to verification under the Information Technology Act, 2000.
    </div>
  </div>`
      : ""
  }

  <!-- Signed Copy Stamp -->
  ${signature && signature.isSigned ? '<div class="signed-copy-stamp">SIGNED COPY</div>' : ""}

  <!-- AI Disclaimer Banner -->
  <div class="disclaimer-banner">
    <strong>⚠️ AI-GENERATED DOCUMENT — NOT A SUBSTITUTE FOR LEGAL ADVICE</strong>
    This document was generated by Munsif AI, a technology platform, and is intended as a draft starting point only. It has <strong>not</strong> been reviewed by a licensed legal professional. You should have this document reviewed by a qualified lawyer admitted to the Bar Council of India before use.
    <br><br>
    Munsif AI is <strong>not a law firm</strong> and does not provide legal advice, representation, or opinions. Use of this document does not create an attorney-client relationship. Munsif AI makes no warranties regarding the suitability, accuracy, or legal enforceability of this document for your specific circumstances.
    <br><br>
    Applicable law references (Indian Contract Act, 1872; Stamp Act provisions) are provided for general informational purposes only and may vary by state. Please verify stamp duty requirements with your local Sub-Registrar office.
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    <div>Generated by <strong>Munsif AI</strong> &bull; munsif.ai &bull; This is an AI-generated document draft</div>
    <div class="doc-id">Doc ID: ${escapeHtml(documentId)} &bull; ${escapeHtml(generationTimestamp)}</div>
  </div>
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent injection.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] || ch);
}

/**
 * Generate a short unique document ID.
 */
function generateDocId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MUNSIF-${ts}-${rand}`;
}
