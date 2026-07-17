"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTemplateById } from "@/lib/document-templates";
import { generateDocumentPreview } from "@/lib/document-previews";

function storageKey(type: string): string {
  return `munsif_form_${type}`;
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

export default function DocumentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const template = getTemplateById(type);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const data = loadSaved(type);
    setFormData(data);
    setLoading(false);
  }, [type]);

  const previewContent = template
    ? generateDocumentPreview(template, formData)
    : "";

  const handleDownloadPdf = async () => {
    if (!template || !previewContent) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      // Get the PDF blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Generate filename
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

  if (!template) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-display font-bold text-stone-900 mb-2">
          Document Not Found
        </h1>
        <p className="text-stone-500 mb-6">
          The document type &quot;{type}&quot; is not available.
        </p>
        <button
          onClick={handleBackToDocuments}
          className="btn-primary"
        >
          ← Back to Documents
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-stone-500">Loading document preview...</p>
      </div>
    );
  }

  const hasContent = previewContent.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Breadcrumb */}
      <button
        onClick={handleEdit}
        className="text-sm text-stone-500 hover:text-teal-600 transition-colors mb-4 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        ← Back to Form
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="text-4xl flex-shrink-0">{template.icon}</div>
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-stone-900">
            {template.name} — Preview
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Review your document before generating the final version
          </p>
        </div>
      </div>

      {/* AI Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-amber-800 text-sm font-medium mb-0.5">
              AI-Generated Document — Not Legal Advice
            </p>
            <p className="text-amber-700 text-xs leading-relaxed">
              This document was generated by Munsif AI and is intended as a
              starting point only. It has <strong>not</strong> been reviewed by a
              licensed legal professional. You should have it reviewed by a
              qualified lawyer before use. Munsif AI is a technology platform and{" "}
              <strong>not a law firm</strong>. Use of this document does not
              create an attorney-client relationship.
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!hasContent && (
        <div className="card p-10 text-center mb-6">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-semibold text-stone-900 mb-2">
            No data to preview
          </h3>
          <p className="text-stone-500 text-sm mb-4">
            It looks like you haven&apos;t filled in the form yet, or your
            session data has been cleared.
          </p>
          <button onClick={handleEdit} className="btn-primary text-sm">
            Go to Form
          </button>
        </div>
      )}

      {/* Document Preview */}
      {hasContent && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-elevated overflow-hidden mb-6">
          {/* Decorative top bar */}
          <div className="h-1.5 bg-teal-600" />

          {/* Document header */}
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
              <span>Munsif AI Generated</span>
              <span>•</span>
              <span>Draft v1</span>
            </div>
          </div>

          {/* Document body */}
          <div className="px-6 md:px-10 py-8">
            <div
              className="font-serif text-stone-800 text-sm md:text-[15px] leading-[1.8] document-preview-content"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>

          {/* AI Disclaimer Footer */}
          <div className="bg-amber-50 border-t border-amber-100 px-6 md:px-10 py-3">
            <p className="text-amber-700 text-[11px] leading-relaxed">
              ⚠️ This document is AI-generated and intended as a draft only. It
              should be reviewed by a licensed legal professional before use.
              Munsif AI is not a law firm and does not provide legal advice.
              This document does not create an attorney-client relationship.
            </p>
          </div>
        </div>
      )}

      {/* Download Error */}
      {downloadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">❌</span>
            <div>
              <p className="text-red-800 text-sm font-medium">
                PDF generation failed
              </p>
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

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button onClick={handleEdit} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Details
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading || !hasContent}
          className="btn-accent flex-1 sm:flex-none disabled:opacity-60 disabled:cursor-not-allowed"
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
              Generating PDF...
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
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={handleBackToDocuments}
          className="btn-secondary sm:ml-auto"
        >
          New Document
        </button>
      </div>
    </div>
  );
}
