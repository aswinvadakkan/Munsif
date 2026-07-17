"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { getTemplateById } from "@/lib/document-templates";
import { DocumentPreview } from "@/components/DocumentPreview";

export default function DocumentPreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") || "";
  const template = getTemplateById(type);

  const formData: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "type") {
      formData[key] = value;
    }
  });

  const generatePreviewContent = (): string => {
    if (!template) return "";

    const sections = template.formSteps.map((step) => {
      const fieldLines = step.fields
        .filter((field) => formData[field.id])
        .map((field) => {
          const label = field.label;
          let value = formData[field.id];

          if (field.type === "select" && field.options) {
            const opt = field.options.find((o) => o.value === value);
            if (opt) value = opt.label;
          }

          if (field.type === "date") {
            value = new Date(value).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          }

          if (field.type === "number" && field.label.toLowerCase().includes("₹")) {
            value = `₹${Number(value).toLocaleString("en-IN")}`;
          } else if (field.type === "number") {
            value = Number(value).toLocaleString("en-IN");
          }

          return `**${label}:** ${value}`;
        });

      if (fieldLines.length === 0) return "";
      return `## ${step.title}\n\n${fieldLines.join("\n\n")}`;
    });

    return sections.filter(Boolean).join("\n\n");
  };

  const previewContent = generatePreviewContent();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="text-sm text-stone-500 hover:text-teal-600 transition-colors mb-4"
      >
        ← Back to Form
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div className="text-4xl">{template?.icon || "📄"}</div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-900">
            {template?.name || "Document"} Preview
          </h1>
          <p className="text-stone-500 mt-1">
            Review the details before generating your document
          </p>
        </div>
      </div>

      <DocumentPreview
        title={template?.name || "Document"}
        content={previewContent}
        language="en"
      />

      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button onClick={() => router.back()} className="btn-secondary">
          ← Edit Details
        </button>
        <button className="btn-accent flex-1 sm:flex-none">
          Pay ₹99 & Download PDF
        </button>
      </div>
    </div>
  );
}
