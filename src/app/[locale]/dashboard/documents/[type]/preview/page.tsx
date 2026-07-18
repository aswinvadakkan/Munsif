"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTemplateById } from "@/lib/document-templates";
import { generateDocumentPreview } from "@/lib/document-previews";
import { useRazorpay } from "@/lib/useRazorpay";

type GenerationMethod = "idle" | "llm" | "template";

type PaymentState = "idle" | "loading" | "pending" | "success" | "failed";
type PaymentMethod = "razorpay" | "cashfree";

interface PaymentSession {
  orderId: string;
  documentType: string;
  amount: number;
  state: PaymentState;
  createdAt: string;
  method?: PaymentMethod;
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("razorpay");

  // AI generation state
  const [aiContent, setAiContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMethod, setGenerationMethod] = useState<GenerationMethod>("idle");
  const [aiTokens, setAiTokens] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Razorpay hook
  const {
    isLoaded: rzpLoaded,
    error: rzpError,
    openCheckout,
  } = useRazorpay();

  useEffect(() => {
    const data = loadSaved(type);
    setFormData(data);
    setLoading(false);

    // Restore previously selected payment method
    try {
      const savedMethod = localStorage.getItem(`munsif_payment_method_${type}`);
      if (savedMethod === "razorpay" || savedMethod === "cashfree") {
        setSelectedMethod(savedMethod);
      }
    } catch {
      // ignore
    }
  }, [type]);

  // Trigger AI generation when data is loaded and template is available
  useEffect(() => {
    if (loading || !template || Object.keys(formData).length === 0) return;

    const generateDraft = async () => {
      setIsGenerating(true);
      setGenerationError(null);
      setGenerationMethod("idle");

      try {
        const response = await fetch("/api/generate-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: type,
            formData,
            language: "en",
          }),
        });

        if (!response.ok) {
          throw new Error(`Draft generation failed (${response.status})`);
        }

        const data = await response.json();
        setAiContent(data.content);
        setAiTokens(data.tokens || 0);
        setGenerationMethod(data.method || "template");
      } catch (err) {
        console.error("AI generation error:", err);
        setGenerationError(
          err instanceof Error ? err.message : "Failed to generate AI draft"
        );
        // Fall back to template
        setAiContent("");
        setGenerationMethod("template");
      } finally {
        setIsGenerating(false);
      }
    };

    generateDraft();
  }, [loading, template, type, formData]);

  useEffect(() => {
    if (!template) return;
    const urlOrderId = searchParams.get("order_id");
    const urlOrderStatus = searchParams.get("order_status");
    const savedSession = loadPaymentSession(type);

    // Handle Cashfree redirect return (existing flow)
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
        method: "cashfree",
      });
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
      return;
    }

    if (
      urlOrderStatus &&
      ["FAILED", "EXPIRED", "USER_DROPPED", "CANCELLED", "TERMINATED"].includes(
        urlOrderStatus
      )
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
      if (savedSession.method) {
        setSelectedMethod(savedSession.method);
      }
      return;
    }

    setPaymentState("idle");
  }, [searchParams, type, template, t]);

  // Determine what content to show:
  // - LLM-generated text takes priority when available
  // - Fall back to template-based HTML preview
  const templatePreviewContent = template
    ? generateDocumentPreview(template, formData)
    : "";

  const hasAiContent = aiContent.trim().length > 0;
  const displayContent = hasAiContent ? aiContent : templatePreviewContent;
  const isHtmlContent = !hasAiContent;
  const hasContent = displayContent.trim().length > 0;

  // --- Cashfree payment flow ---
  const handleCashfreePay = useCallback(async () => {
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
          errData?.message ||
            errData?.error ||
            `Payment setup failed (${response.status})`
        );
      }

      const data = await response.json();
      savePaymentSession(type, {
        orderId: data.orderId,
        documentType: type,
        amount: data.amount,
        state: "pending",
        createdAt: new Date().toISOString(),
        method: "cashfree",
      });

      setPaymentOrderId(data.orderId);
      setPaymentState("pending");
      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      setPaymentState("failed");
      setPaymentError(
        error?.message || "Failed to initialize payment. Please try again."
      );
      console.error("[Payment] Cashfree error:", error);
    }
  }, [template, type]);

  // --- Razorpay payment flow ---
  const handleRazorpayPay = useCallback(async () => {
    if (!template) return;
    setPaymentState("loading");
    setPaymentError(null);

    try {
      // 1. Create Razorpay order via backend
      const response = await fetch("/api/payments/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: type,
          customerEmail: "user@example.com",
          customerName: "User",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData?.message ||
            errData?.error ||
            `Razorpay order creation failed (${response.status})`
        );
      }

      const data = await response.json();

      // 2. Open Razorpay checkout modal
      openCheckout(
        {
          key: data.keyId,
          amount: data.amountPaise,
          currency: data.currency || "INR",
          name: "Munsif AI",
          description: `Legal Document: ${template.name}`,
          order_id: data.orderId,
          prefill: {
            name: "User",
            email: "user@example.com",
          },
          notes: {
            documentType: type,
            receipt: data.receipt,
          },
          theme: {
            color: "#248374",
          },
          modal: {
            escape: true,
            animation: true,
            backdropclose: false,
          },
        },
        {
          onSuccess: (response) => {
            // Payment successful via Razorpay modal
            setPaymentState("success");
            setPaymentOrderId(response.razorpay_order_id);
            setHasPaid(true);

            savePaymentSession(type, {
              orderId: response.razorpay_order_id,
              documentType: type,
              amount: template.price,
              state: "success",
              createdAt: new Date().toISOString(),
              method: "razorpay",
            });

            // Store the payment ID and signature for potential verification
            try {
              localStorage.setItem(
                `munsif_razorpay_payment_${type}`,
                JSON.stringify({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  timestamp: Date.now(),
                })
              );
            } catch {
              // ignore
            }
          },
          onDismiss: () => {
            // User closed the modal without paying
            if (paymentState === "loading") {
              setPaymentState("idle");
            }
          },
          onError: (error) => {
            setPaymentState("failed");
            setPaymentError(
              error?.message ||
                error?.description ||
                "Razorpay payment failed. Please try again."
            );
            console.error("[Payment] Razorpay error:", error);
          },
        }
      );
    } catch (error: any) {
      setPaymentState("failed");
      setPaymentError(
        error?.message || "Failed to initialize Razorpay payment. Please try again."
      );
      console.error("[Payment] Razorpay order error:", error);
    }
  }, [template, type, openCheckout, paymentState]);

  // Unified pay handler based on selected method
  const handlePayAndDownload = useCallback(() => {
    // Save selected method preference
    try {
      localStorage.setItem(`munsif_payment_method_${type}`, selectedMethod);
    } catch {
      // ignore
    }

    if (selectedMethod === "razorpay") {
      handleRazorpayPay();
    } else {
      handleCashfreePay();
    }
  }, [selectedMethod, handleRazorpayPay, handleCashfreePay, type]);

  const handleRegenerate = useCallback(async () => {
    if (!template || Object.keys(formData).length === 0) return;
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: type,
          formData,
          language: "en",
        }),
      });

      if (!response.ok) {
        throw new Error(`Draft generation failed (${response.status})`);
      }

      const data = await response.json();
      setAiContent(data.content);
      setAiTokens(data.tokens || 0);
      setGenerationMethod(data.method || "template");
    } catch (err) {
      console.error("AI regeneration error:", err);
      setGenerationError(
        err instanceof Error ? err.message : "Failed to regenerate AI draft"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [template, type, formData]);

  const handleDownloadPdf = async () => {
    if (!template || !displayContent) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // For AI-generated plain text, wrap it in a simple HTML structure for PDF
      let bodyContent: string;
      if (hasAiContent) {
        // Convert plain text to HTML for PDF rendering
        const escaped = displayContent
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const htmlText = escaped
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (!trimmed) return "<br/>";
            if (
              trimmed === trimmed.toUpperCase() &&
              trimmed.length > 3 &&
              !trimmed.startsWith("&")
            ) {
              return `<h2>${trimmed}</h2>`;
            }
            return `<p>${trimmed}</p>`;
          })
          .join("\n");
        bodyContent = `<div class="ai-generated-doc">${htmlText}</div>`;
      } else {
        bodyContent = templatePreviewContent;
      }

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyContent,
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
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
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
            <p className="text-amber-800 text-sm font-medium mb-0.5">
              {t("aiTitle")}
            </p>
            <p className="text-amber-700 text-xs leading-relaxed">
              {t("aiDescription")}
            </p>
          </div>
        </div>
      </div>

      {!hasContent && (
        <div className="card p-10 text-center mb-6">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-semibold text-stone-900 mb-2">
            {t("noDataTitle")}
          </h3>
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
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>{t("munsifGenerated")}</span>
              {generationMethod === "llm" && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.653a.17.17 0 01.03.003l3.726.248a2 2 0 01.767.317V12a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h.27a2 2 0 01-.27-1v-1z" />
                    </svg>
                    Powered by AI
                  </span>
                </>
              )}
              {generationMethod === "template" && !isGenerating && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {t("templateGenerated")}
                  </span>
                </>
              )}
              {isGenerating && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-purple-600 animate-pulse">
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("generatingWithAI")}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="px-6 md:px-10 py-8">
            {/* Generating state */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="animate-spin w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.653a.17.17 0 01.03.003l3.726.248a2 2 0 01.767.317V12a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h.27a2 2 0 01-.27-1v-1z" />
                    </svg>
                  </div>
                </div>
                <p className="text-stone-700 font-medium text-sm mb-1">
                  {t("generatingWithAIDesc")}
                </p>
                <p className="text-stone-400 text-xs">{t("aiDraftingTakeMoment")}</p>
              </div>
            )}

            {/* AI-generated plain text content */}
            {!isGenerating && hasAiContent && (
              <div>
                <div className="font-serif text-stone-800 text-sm md:text-[15px] leading-[1.8] whitespace-pre-wrap document-preview-content">
                  {displayContent}
                </div>
                {/* Regenerate button */}
                <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    {t("aiGeneratedWithTokens", { tokens: aiTokens.toLocaleString("en-IN") })}
                  </span>
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {t("regenerate")}
                  </button>
                </div>
              </div>
            )}

            {/* Template-based HTML content (fallback) */}
            {!isGenerating && !hasAiContent && (
              <div
                className="font-serif text-stone-800 text-sm md:text-[15px] leading-[1.8] document-preview-content"
                dangerouslySetInnerHTML={{ __html: templatePreviewContent }}
              />
            )}

            {/* Empty state when no content at all */}
            {!isGenerating && !hasContent && generationMethod === "template" && (
              <p className="text-stone-400 italic font-sans">No preview content available.</p>
            )}
          </div>

          <div className="bg-amber-50 border-t border-amber-100 px-6 md:px-10 py-3">
            <p className="text-amber-700 text-[11px] leading-relaxed">
              ⚠️ {t("disclaimerFooter")}
            </p>
          </div>
        </div>
      )}

      {/* Generation error */}
      {generationError && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-purple-500 text-sm flex-shrink-0 mt-0.5">🤖</span>
            <div className="flex-1">
              <p className="text-purple-800 text-sm font-medium">
                {t("aiGenerationFallback")}
              </p>
              <p className="text-purple-600 text-xs mt-0.5">{generationError}</p>
            </div>
            <button
              onClick={() => setGenerationError(null)}
              className="text-purple-400 hover:text-purple-600 ml-auto flex-shrink-0"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Payment Section */}
      {hasContent && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden mb-6">
          <div className="px-6 md:px-10 py-5">
            {/* Price display */}
            <div className="mb-5">
              <p className="text-sm text-stone-500 font-medium">
                {t("documentPrice")}
              </p>
              <p className="text-3xl font-display font-bold text-stone-900">
                ₹{template.price.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {t("oneTimePayment")}
              </p>
            </div>

            {/* Payment method selector — only show if not yet paid */}
            {paymentState !== "success" && !hasPaid && (
              <div className="mb-5">
                <p className="text-sm font-medium text-stone-700 mb-3">
                  {t("selectPaymentMethod")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Razorpay card */}
                  <button
                    onClick={() => setSelectedMethod("razorpay")}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === "razorpay"
                        ? "border-teal-600 bg-teal-50 shadow-md"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                    }`}
                  >
                    {selectedMethod === "razorpay" && (
                      <div className="absolute -top-2 -right-2 bg-saffron-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        🇮🇳 {t("mostPopular")}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3395FF]/10 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-[#3395FF]"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">
                          Razorpay
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {t("razorpayDesc")}
                        </p>
                      </div>
                    </div>
                    {selectedMethod === "razorpay" && (
                      <div className="mt-3 flex items-center gap-1 text-teal-700 text-xs">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{t("selected")}</span>
                      </div>
                    )}
                  </button>

                  {/* Cashfree card */}
                  <button
                    onClick={() => setSelectedMethod("cashfree")}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === "cashfree"
                        ? "border-teal-600 bg-teal-50 shadow-md"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-[#FF6B35]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">
                          Cashfree
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {t("cashfreeDesc")}
                        </p>
                      </div>
                    </div>
                    {selectedMethod === "cashfree" && (
                      <div className="mt-3 flex items-center gap-1 text-teal-700 text-xs">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{t("selected")}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Pay button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {paymentState === "success" || hasPaid ? (
                  <p className="text-sm text-green-600 flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("paymentSuccessful")}
                  </p>
                ) : paymentState === "pending" && selectedMethod === "razorpay" ? (
                  <p className="text-sm text-amber-600">
                    {t("completingPayment")}
                  </p>
                ) : null}
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
                        <svg
                          className="animate-spin w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        {t("generatingPDF")}
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {t("downloadPDF")}
                      </>
                    )}
                  </button>
                ) : paymentState === "loading" ? (
                  <button
                    disabled
                    className="btn-accent min-w-[180px] opacity-70 cursor-wait"
                  >
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t("settingUpPayment")}
                  </button>
                ) : (
                  <button
                    onClick={handlePayAndDownload}
                    disabled={
                      selectedMethod === "razorpay" && !rzpLoaded
                    }
                    className="btn-accent min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      selectedMethod === "razorpay" && !rzpLoaded
                        ? t("loadingRazorpay")
                        : undefined
                    }
                  >
                    {selectedMethod === "razorpay" ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        {t("payWithRazorpay")}
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        {t("payWithCashfree")}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Trust badges — always show before payment */}
            {paymentState !== "success" && !hasPaid && (
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  {t("securePayment")}
                </div>
                {selectedMethod === "razorpay" ? (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      {t("poweredByRazorpay")}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <span>{t("pciCompliant")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <span>{t("sslEncrypted")}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
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
                  </>
                )}
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
              <p className="text-red-800 text-sm font-medium">
                {t("paymentFailed")}
              </p>
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Razorpay SDK loading error */}
      {rzpError && selectedMethod === "razorpay" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 text-sm flex-shrink-0 mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-amber-800 text-sm font-medium">
                {t("razorpayNotLoaded")}
              </p>
              <p className="text-amber-600 text-xs mt-0.5">{rzpError}</p>
            </div>
            <button
              onClick={() => setSelectedMethod("cashfree")}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium flex-shrink-0 underline"
            >
              {t("switchToCashfree")}
            </button>
          </div>
        </div>
      )}

      {downloadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">❌</span>
            <div>
              <p className="text-red-800 text-sm font-medium">
                {t("pdfFailed")}
              </p>
              <p className="text-red-600 text-xs mt-0.5">{downloadError}</p>
            </div>
            <button
              onClick={() => setDownloadError(null)}
              className="text-red-400 hover:text-red-600 ml-auto flex-shrink-0"
              aria-label="Dismiss error"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button onClick={handleEdit} className="btn-secondary">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          {t("editDetails")}
        </button>
        <button
          onClick={handleBackToDocuments}
          className="btn-secondary sm:ml-auto"
        >
          {t("newDocument")}
        </button>
      </div>
    </div>
  );
}
