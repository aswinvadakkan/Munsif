/**
 * E-Signature Integration for Munsif AI
 *
 * This module provides the e-signature abstraction layer for Munsif AI.
 * Currently implements a draw-on-canvas (digital image) signature approach
 * that is pragmatic and works today without regulatory dependencies.
 *
 * ## Future: Aadhaar eSign Integration
 *
 * When Munsif AI is ready to integrate with a licensed eSign Service Provider (ESP),
 * this module provides the hook. Aadhaar eSign is governed by:
 *   - Information Technology Act, 2000 (Section 3A)
 *   - Second Schedule of the IT Act (electronic signatures)
 *   - CCA guidelines for eSign service providers
 *
 * ### Integration Path
 * 1. Partner with a licensed ESP (see below for providers)
 * 2. Implement eKYC using Aadhaar XML / DigiLocker
 * 3. Use the ESP's API for OTP-based consent and digital signing
 * 4. Return the PKCS#7 signature + signer certificate for PDF embedding
 *
 * ### Licensed ESPs (eSign Service Providers)
 * - **emSigner** (emudhra) — https://www.emudhradigital.com/
 * - **NSDL eSign** — https://www.egov-nsdl.co.in/
 * - **CDAC eSign** — https://www.cdac.in/
 * - **DigiSigner** (via Capricorn) — https://www.digisigner.in/
 * - **eMudhra eSign** — https://www.e-mudhra.com/
 *
 * ### Required Approvals
 * - ESP partner agreement (commercial + technical)
 * - CCA (Controller of Certifying Authorities) compliance
 * - Application-specific consent flow (Aadhaar OTP)
 * - Audit trail and document hash storage
 */

// ─── Types ──────────────────────────────────────────────────────────────

/** Request to initiate an Aadhaar eSign session */
export interface AadhaarESignRequest {
  /** 12-digit Aadhaar number */
  aadhaarNumber: string;
  /** SHA-256 hash of the document to be signed */
  documentHash: string;
  /** Consent token from the eKYC / OTP consent flow */
  consentToken: string;
}

/** Response after initiating eSign (OTP sent to Aadhaar-linked mobile) */
export interface AadhaarESignInitResponse {
  transactionId: string;
  status: "otp_sent";
  /** Masked mobile number where OTP was sent */
  maskedMobile: string;
}

/** Response after completing eSign with OTP */
export interface AadhaarESignCompleteResponse {
  /** Base64-encoded PKCS#7 digital signature */
  signature: string;
  /** X.509 signer certificate (PEM format) */
  certificate: string;
  /** Timestamp of the signature */
  signedAt: string;
}

/** E-signature data embedded in the PDF (works for both draw-on-canvas and Aadhaar eSign) */
export interface ESignatureData {
  /** PNG data URL of the signature image (drawn on canvas) */
  signatureImage?: string;
  /** Printed name of the signer */
  signerName: string;
  /** Date of signing in display format */
  signDate: string;
  /** ISO timestamp of signing */
  signedAt: string;
  /** Method used: "draw" for canvas-based, "aadhaar" for Aadhaar eSign */
  method: "draw" | "aadhaar";
  /** PKCS#7 signature (only for Aadhaar eSign) */
  pkcs7Signature?: string;
  /** X.509 certificate (only for Aadhaar eSign) */
  certificate?: string;
  /** Whether the document is a signed copy */
  isSigned: boolean;
}

// ─── Aadhaar eSign Stubs ────────────────────────────────────────────────

/**
 * Initiate an Aadhaar eSign session.
 *
 * In production, this calls the ESP's initiate API to:
 * 1. Validate the Aadhaar number format
 * 2. Create a signing request with document hash
 * 3. Trigger OTP to the Aadhaar-linked mobile number
 *
 * @param req - Aadhaar eSign request with number, document hash, and consent token
 * @returns Transaction ID and OTP sent status
 */
export async function initiateAadhaarESign(
  req: AadhaarESignRequest
): Promise<AadhaarESignInitResponse> {
  // Validate Aadhaar format (12 digits, passes Verhoeff checksum)
  const aadhaarRegex = /^\d{12}$/;
  if (!aadhaarRegex.test(req.aadhaarNumber)) {
    throw new Error(
      "Invalid Aadhaar number format. Must be exactly 12 digits."
    );
  }

  if (!req.documentHash || req.documentHash.length !== 64) {
    throw new Error(
      "Invalid document hash. Must be a SHA-256 hex digest (64 characters)."
    );
  }

  throw new Error(
    "Aadhaar eSign is not yet available. Munsif AI requires a licensed ESP " +
    "(eSign Service Provider) partnership to enable Aadhaar-based digital signing. " +
    "This requires CCA compliance, ESP partner agreement, and regulatory approval. " +
    "Refer to src/lib/esign.ts for the integration path and supported ESPs (" +
    "emSigner, NSDL eSign, CDAC eSign, eMudhra). " +
    "In the meantime, you can sign documents using the draw-on-canvas signature pad."
  );
}

/**
 * Complete an Aadhaar eSign session by submitting the OTP.
 *
 * In production, this calls the ESP's complete API to:
 * 1. Validate the OTP against the transaction
 * 2. Apply the digital signature using the signer's Aadhaar-linked key
 * 3. Return the PKCS#7 signature and X.509 certificate
 *
 * @param transactionId - The transaction ID from initiateAadhaarESign
 * @param otp - The 6-digit OTP received on the Aadhaar-linked mobile
 * @returns PKCS#7 signature and X.509 certificate
 */
export async function completeAadhaarESign(
  transactionId: string,
  otp: string
): Promise<AadhaarESignCompleteResponse> {
  if (!transactionId || transactionId.trim().length === 0) {
    throw new Error("Transaction ID is required.");
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    throw new Error("Invalid OTP format. Must be exactly 6 digits.");
  }

  throw new Error(
    "Aadhaar eSign is not yet available. Munsif AI requires a licensed ESP " +
    "(eSign Service Provider) partnership to enable Aadhaar-based digital signing. " +
    "This requires CCA compliance, ESP partner agreement, and regulatory approval. " +
    "Refer to src/lib/esign.ts for the integration path. " +
    "In the meantime, you can sign documents using the draw-on-canvas signature pad."
  );
}

// ─── Signature Metadata Helpers ─────────────────────────────────────────

const SIGNATURE_STORAGE_PREFIX = "munsif_signature_";

export interface SignatureMetadata {
  signedAt: string;
  signerName: string;
  documentId: string;
  documentType: string;
  method: "draw" | "aadhaar";
}

/**
 * Store signature metadata in localStorage for dashboard display.
 */
export function storeSignatureMetadata(
  documentType: string,
  meta: SignatureMetadata
): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${SIGNATURE_STORAGE_PREFIX}${documentType}`;
    localStorage.setItem(key, JSON.stringify(meta));
  } catch {
    // Storage full or unavailable — ignore non-critical metadata
  }
}

/**
 * Retrieve signature metadata from localStorage.
 * Returns null if not found or unavailable.
 */
export function getSignatureMetadata(
  documentType: string
): SignatureMetadata | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `${SIGNATURE_STORAGE_PREFIX}${documentType}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Check if a document has been signed.
 */
export function isDocumentSigned(documentType: string): boolean {
  return getSignatureMetadata(documentType) !== null;
}

/**
 * Clear signature metadata for a document type.
 */
export function clearSignatureMetadata(documentType: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${SIGNATURE_STORAGE_PREFIX}${documentType}`;
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
