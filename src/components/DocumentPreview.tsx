"use client";

interface DocumentPreviewProps {
  title: string;
  content: string;
  language?: "en" | "hi";
}

export function DocumentPreview({
  title,
  content,
  language = "en",
}: DocumentPreviewProps) {
  const isHindi = language === "hi";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-elevated overflow-hidden">
      {/* Document header */}
      <div className="bg-stone-50 border-b border-stone-200 px-6 py-4">
        <h2 className="font-display font-semibold text-stone-900 text-lg">
          {title}
        </h2>
        <p className="text-stone-500 text-xs mt-0.5">
          Preview — Munsif AI Generated Document
        </p>
      </div>

      {/* Document content */}
      <div
        className={`p-6 md:p-8 prose prose-stone max-w-none text-sm leading-relaxed whitespace-pre-wrap ${
          isHindi ? "text-right" : ""
        }`}
      >
        {content || (
          <p className="text-stone-400 italic">
            {isHindi
              ? "दस्तावेज़ सामग्री यहाँ दिखाई देगी..."
              : "Document content will appear here..."}
          </p>
        )}
      </div>

      {/* AI Disclaimer */}
      <div className="bg-amber-50 border-t border-amber-200 px-6 py-3">
        <p className="text-amber-800 text-xs">
          ⚠️ This document is AI-generated and should be reviewed by a licensed legal
          professional before use. Munsif AI is not a law firm.
        </p>
      </div>
    </div>
  );
}
