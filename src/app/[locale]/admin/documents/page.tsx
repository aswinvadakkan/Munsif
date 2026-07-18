"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const DOCUMENT_TYPES = [
  "rental-agreement", "nda", "employment-contract", "freelance-agreement",
  "partnership-deed", "legal-notice", "affidavit", "terms-of-service",
] as const;

type DocStatus = "draft" | "generated" | "paid";

const SAMPLE_DOCUMENTS: {
  id: string;
  user: string;
  type: string;
  status: DocStatus;
  date: string;
  price: number;
}[] = [
  { id: "DOC-2026-0001", user: "Amit Sharma", type: "rental-agreement", status: "paid", date: "2026-07-14", price: 499 },
  { id: "DOC-2026-0002", user: "Priya Patel", type: "nda", status: "generated", date: "2026-07-13", price: 299 },
  { id: "DOC-2026-0003", user: "Neha Iyer", type: "employment-contract", status: "paid", date: "2026-07-12", price: 599 },
  { id: "DOC-2026-0004", user: "Vikram Singh", type: "freelance-agreement", status: "draft", date: "2026-07-11", price: 399 },
  { id: "DOC-2026-0005", user: "Amit Sharma", type: "legal-notice", status: "paid", date: "2026-07-10", price: 249 },
];

const TYPE_LABELS: Record<string, string> = {
  "rental-agreement": "Rental Agreement",
  "nda": "NDA",
  "employment-contract": "Employment Contract",
  "freelance-agreement": "Freelance Agreement",
  "partnership-deed": "Partnership Deed",
  "legal-notice": "Legal Notice",
  "affidavit": "Affidavit",
  "terms-of-service": "Terms of Service",
};

export default function AdminDocumentsPage() {
  const t = useTranslations("admin");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDocs = useMemo(() => {
    return SAMPLE_DOCUMENTS.filter((doc) => {
      if (typeFilter !== "all" && doc.type !== typeFilter) return false;
      if (statusFilter !== "all" && doc.status !== statusFilter) return false;
      return true;
    });
  }, [typeFilter, statusFilter]);

  const statusBadge = (status: DocStatus) => {
    const styles: Record<DocStatus, string> = {
      draft: "bg-stone-100 text-stone-600",
      generated: "bg-blue-50 text-blue-700",
      paid: "bg-green-50 text-green-700",
    };
    const labels: Record<DocStatus, string> = {
      draft: t("documents.statusDraft"),
      generated: t("documents.statusGenerated"),
      paid: t("documents.statusPaid"),
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-900">
            {t("documents.title")}
          </h1>
          <p className="text-stone-500 mt-1">{t("documents.subtitle")}</p>
        </div>
      </div>

      {/* Placeholder notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-800">{t("placeholder.documentsTitle")}</p>
          <p className="text-sm text-amber-700 mt-0.5">{t("placeholder.documentsDesc")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field max-w-[200px] py-2"
        >
          <option value="all">{t("documents.filterAllTypes")}</option>
          {DOCUMENT_TYPES.map((dt) => (
            <option key={dt} value={dt}>{TYPE_LABELS[dt]}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[180px] py-2"
        >
          <option value="all">{t("documents.filterAllStatus")}</option>
          <option value="draft">{t("documents.statusDraft")}</option>
          <option value="generated">{t("documents.statusGenerated")}</option>
          <option value="paid">{t("documents.statusPaid")}</option>
        </select>
      </div>

      {/* Documents table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("documents.columns.id")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("documents.columns.user")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("documents.columns.type")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("documents.columns.status")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("documents.columns.date")}</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("documents.columns.price")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                    {t("documents.noResults")}
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => (
                  <tr key={doc.id} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50/40"}>
                    <td className="px-4 py-3 font-mono text-xs text-teal-700 whitespace-nowrap">{doc.id}</td>
                    <td className="px-4 py-3 text-stone-900 whitespace-nowrap">{doc.user}</td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{TYPE_LABELS[doc.type]}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{statusBadge(doc.status)}</td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{doc.date}</td>
                    <td className="px-4 py-3 text-stone-700 text-right font-medium whitespace-nowrap">₹{doc.price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
