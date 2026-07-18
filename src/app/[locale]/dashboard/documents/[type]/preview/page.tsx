"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTemplateById } from "@/lib/document-templates";
import { generateDocumentPreview } from "@/lib/document-previews";

type PaymentState = "idle" | "loading" | "pending" | "success" | "failed";

interface PaymentSession {
  orderId: string;
  documentType: string;
  amount: number;
  state: PaymentState;
  createdAt: string;
}

function storageKey(type: string): string {
  return `munsif_form_${type}`;
}

function paymentStorageKey(type: string): string {
  return `munsif_payment_${type}`;
}

function loadSaved(type: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(type));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadPaymentSession(type: string): PaymentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(paymentStorageKey(type));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePaymentSession(type: string, session: PaymentSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(paymentStorageKey(type), JSON.stringify(session));
  } catch {
    // ignore
  }
}

function clearPaymentSession(type: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(paymentStorageKey(type));
  } catch {
    // ignore
  }
}

export default function DocumentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = params.type as string;
  const template = getTemplateById(type);
  const t = useTranslations("preview");

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const data = loadSaved(type);
    setFormData(data);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    if (!template) return;
    const urlOrderId = searchParams.get("order_id");
    const urlOrderStatus = searchParams.get("order_status");
    const savedSession = loadPaymentSession(type);

    if (urlOrderStatus === "PAID" && urlOrderId) {
      setPaymentState("success");
      setPaymentOrderId(urlOrderId);
      setHasPaid(true);
      savePaymentSession(type, {
        orderId: urlOrderId,
        documentType: type,
        amount: template.price,
        state: "success",
        createdAt: new Date().toISOString(),
      });
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
      return;
    }

    if (
      urlOrderStatus &&
      ["FAILED", "EXPIRED", "USER_DROPPED", "CANCELLED", "TERMINATED"].includes(urlOrderStatus)
    ) {
      setPaymentState("failed");
      setPaymentError(t("paymentFailedDesc"));
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
      return;
    }

    if (savedSession && savedSession.state === "success") {
      setPaymentState("success");
      setPaymentOrderId(savedSession.orderId);
      setHasPaid(true);
      return;
    }

    setPaymentState("idle");
  }, [searchParams, type, template, t]);

  const previewContent = template
    ? generateDocumentPreview(template, formData)
    : "";

  const hasContent = previewContent.trim().length > 0;

  const handlePayAndDownload = useCallback(async () => {
    if (!template) return;
    setPaymentState("loading");
    setPaymentError(null);

    try {
      const siteUrl = window.location.origin;
      const returnUrl = `${siteUrl}/dashboard/documents/${type}/preview`;

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: type,
          customerEmail: "user@example.com",
          customerName: "User",
          customerPhone: "",
          returnUrl,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData?.message || errData?.error || `Payment setup failed (${response.status})`
        );
      }

      const data = await response.json();
      savePaymentSession(type, {
        orderId: data.orderId,
        documentType: type,
        amount: data.amount,
        state: "pending",
        createdAt: new Date().toISOString(),
      });

      setPaymentOrderId(data.orderId);
      setPaymentState("pending");
      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      setPaymentState("failed");
      setPaymentError(
        error?.message || "Failed to initialize payment. Please try again."
      );
      console.error("[Payment] Error:", error);
    }
  }, [template, type]);

  const handleDownloadPdf = async () => {
    if (!template || !previewContent) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyContent: previewContent,
          title: template.name,
          documentType: template.name,
          language: "en",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `PDF generation failed (${response.status})`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const safeName = template.name
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      const fileName = `${safeName}-Munsif-AI.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download PDF";
      setDownloadError(message);
      console.error("PDF download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/documents/${type}`);
  };

  const handleBackToDocuments = () => {
    router.push("/dashboard/documents");
  };

  const handleRetryPayment = () => {
    setPaymentError(null);
    clearPaymentSession(type);
    handlePayAndDownload();
  };

  if (!template) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-display font-bold text-stone-900 mb-2">
          {t("documentNotFound")}
        </h1>
        <p className="text-stone-500 mb-6">
          {t("documentNotFoundDesc", { type })}
        </p>
        <button onClick={handleBackToDocuments} className="btn-primary">
          ← {t("backToForm")}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-stone-500">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <button
        onClick={handleEdit}
        className="text-sm text-stone-500 hover:text-teal-600 transition-colors mb-4 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        ← {t("backToForm")}
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div className="text-4xl flex-shrink-0">{template.icon}</div>
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-stone-900">
            {template.name} — {t("title")}
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">{t("subtitle")}</p>
        </div>
      </div>

      {/* AI Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-amber-800 text-sm font-medium mb-0.5">{t("aiTitle")}</p>
            <p className="text-amber-700 text-xs leading-relaxed">{t("aiDescription")}</p>
          </div>
        </div>
      </div>

      {!hasContent && (
        <div className="card p-10 text-center mb-6">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-semibold text-stone-900 mb-2">{t("noDataTitle")}</h3>
          <p className="text-stone-500 text-sm mb-4">{t("noDataDesc")}</p>
          <button onClick={handleEdit} className="btn-primary text-sm">
            {t("goToForm")}
          </button>
        </div>
      )}

      {hasContent && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-elevated overflow-hidden mb-6">
          <div className="h-1.5 bg-teal-600" />
          <div className="bg-stone-50 border-b border-stone-200 px-6 md:px-10 py-5">
            <h2 className="font-display font-semibold text-stone-900 text-lg">
              {template.name}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>{t("munsifGenerated")}</span>
              <span>•</span>
              <span>{t("draftVersion")}</span>
            </div>
          </div>

          <div className="px-6 md:px-10 py-8">
            <div
              className="font-serif text-stone-800 text-sm md:text-[15px] leading-[1.8] document-preview-content"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>

          <div className="bg-amber-50 border-t border-amber-100 px-6 md:px-10 py-3">
            <p className="text-amber-700 text-[11px] leading-relaxed">
              ⚠️ {t("disclaimerFooter")}
            </p>
          </div>
        </div>
      )}

      {/* Payment Section */}
      {hasContent && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden mb-6">
          <div className="px-6 md:px-10 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500 font-medium">{t("documentPrice")}</p>
                <p className="text-3xl font-display font-bold text-stone-900">
                  ₹{template.price.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-stone-400 mt-1">{t("oneTimePayment")}</p>
              </div>

              <div className="flex-shrink-0">
                {paymentState === "success" || hasPaid ? (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="btn-accent min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t("generatingPDF")}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t("downloadPDF")}
                      </>
                    )}
                  </button>
                ) : paymentState === "loading" ? (
                  <button disabled className="btn-accent min-w-[180px] opacity-70 cursor-wait">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("settingUpPayment")}
                  </button>
                ) : (
                  <button onClick={handlePayAndDownload} className="btn-accent min-w-[180px]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {t("payAndDownload")}
                  </button>
                )}
              </div>
            </div>

            {paymentState !== "success" && !hasPaid && (
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t("securePayment")}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t("poweredByCashfree")}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <span>UPI</span>
                  <span className="text-stone-300">•</span>
                  <span>Cards</span>
                  <span className="text-stone-300">•</span>
                  <span>Netbanking</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Error */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">❌</span>
            <div className="flex-1">
              <p className="text-red-800 text-sm font-medium">{t("paymentFailed")}</p>
              <p className="text-red-600 text-xs mt-0.5">{paymentError}</p>
            </div>
            <button
              onClick={handleRetryPayment}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex-shrink-0 underline"
            >
              {t("retry")}
            </button>
            <button
              onClick={() => setPaymentError(null)}
              className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {downloadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">❌</span>
            <div>
              <p className="text-red-800 text-sm font-medium">{t("pdfFailed")}</p>
              <p className="text-red-600 text-xs mt-0.5">{downloadError}</p>
            </div>
            <button
              onClick={() => setDownloadError(null)}
              className="text-red-400 hover:text-red-600 ml-auto flex-shrink-0"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button onClick={handleEdit} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t("editDetails")}
        </button>
        <button onClick={handleBackToDocuments} className="btn-secondary sm:ml-auto">
          {t("newDocument")}
        </button>
      </div>
    </div>
  );
}
