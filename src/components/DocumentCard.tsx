"use client";

import Link from "next/link";
import type { DocumentTemplate } from "@/lib/document-templates";

interface DocumentCardProps {
  template: DocumentTemplate;
  href?: string;
}

const categoryColors: Record<string, string> = {
  business: "bg-blue-50 text-blue-700",
  personal: "bg-saffron-50 text-saffron-700",
  employment: "bg-teal-50 text-teal-700",
  property: "bg-purple-50 text-purple-700",
};

export function DocumentCard({ template, href }: DocumentCardProps) {
  const categoryColor = categoryColors[template.category] || "bg-stone-50 text-stone-700";

  const content = (
    <div className="card p-5 md:p-6 cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className="text-3xl md:text-4xl flex-shrink-0">{template.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-stone-900 text-base md:text-lg">
              {template.name}
            </h3>
            <span className={`text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-full ${categoryColor}`}>
              {template.category}
            </span>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">
            {template.description}
          </p>
          <div className="mt-3 flex items-center gap-1 text-teal-600 text-sm font-medium group-hover:gap-2 transition-all">
            <span>Create</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  // Default: link to the document type questionnaire
  return <Link href={`/dashboard/documents/${template.id}`}>{content}</Link>;
}
