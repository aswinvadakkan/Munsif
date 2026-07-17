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
  const categoryColor =
    categoryColors[template.category] || "bg-stone-50 text-stone-700";

  const content = (
    <div className="card p-5 md:p-6 cursor-pointer group h-full flex flex-col">
      {/* Icon + Badge row */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl md:text-4xl flex-shrink-0 leading-none">
          {template.icon}
        </div>
        <span
          className={`text-[10px] uppercase tracking-wide font-semibold px-2.5 py-1 rounded-full ${categoryColor} flex-shrink-0`}
        >
          {template.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-stone-900 text-base md:text-lg mb-1.5">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-stone-500 text-sm leading-relaxed flex-1 line-clamp-2 mb-4">
        {template.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
        <span className="text-xs text-stone-400 flex items-center gap-1">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {template.estimatedTime}
        </span>
        <span className="text-teal-600 text-sm font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
          Create
          <svg
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return (
    <Link href={`/dashboard/documents/${template.id}`} className="block h-full">
      {content}
    </Link>
  );
}
