"use client";

import { useState } from "react";
import { DocumentCard } from "@/components/DocumentCard";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";

const categories = [
  { id: "all", label: "All Documents", icon: "📋" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "personal", label: "Personal", icon: "📝" },
  { id: "employment", label: "Employment", icon: "💼" },
  { id: "property", label: "Property", icon: "🏠" },
] as const;

export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredTemplates =
    activeCategory === "all"
      ? DOCUMENT_TEMPLATES
      : DOCUMENT_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-900">
          Choose a Document
        </h1>
        <p className="text-stone-500 mt-1.5">
          Select the type of legal document you need — answer a few questions and
          we&apos;ll draft it for you.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300"
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {filteredTemplates.map((template) => (
          <DocumentCard
            key={template.id}
            template={template}
            href={`/dashboard/documents/${template.id}`}
          />
        ))}
      </div>

      {/* Empty state if no match */}
      {filteredTemplates.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-semibold text-stone-900 mb-2">
            No templates found
          </h3>
          <p className="text-stone-500 text-sm">
            Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
}
