"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DOCUMENT_TEMPLATES, type DocumentTemplate } from "@/lib/document-templates";

const DEPLOY_DATE = "2026-07-17"; // date templates were last deployed
const TEMPLATE_SOURCE = "src/lib/document-templates.ts";

const CATEGORY_LABELS: Record<string, string> = {
  business: "Business",
  personal: "Personal",
  employment: "Employment",
  property: "Property",
};

export default function AdminTemplatesPage() {
  const t = useTranslations("admin");
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const templateMeta = DOCUMENT_TEMPLATES.map((tmpl) => {
    const totalFields = tmpl.formSteps.reduce((sum, step) => sum + step.fields.length, 0);
    return {
      id: tmpl.id,
      name: tmpl.name,
      icon: tmpl.icon,
      category: tmpl.category,
      stepsCount: tmpl.formSteps.length,
      fieldsCount: totalFields,
      price: tmpl.price,
      template: tmpl,
    };
  });

  const openEdit = (tmpl: DocumentTemplate) => {
    setSelectedTemplate(tmpl);
  };

  const closeEdit = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-900">
            {t("templates.title")}
          </h1>
          <p className="text-stone-500 mt-1">{t("templates.subtitle")}</p>
        </div>
      </div>

      {/* Deploy info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <svg className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-slate-800">
            {t("templates.deployedOn")} {DEPLOY_DATE}
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            {t("templates.sourceHint")}: <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded font-mono">{TEMPLATE_SOURCE}</code>
          </p>
        </div>
      </div>

      {/* Templates list */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-200 bg-stone-50 text-sm font-semibold text-stone-600">
          <div className="col-span-4">{t("templates.columns.name")}</div>
          <div className="col-span-2">{t("templates.columns.category")}</div>
          <div className="col-span-1 text-center">{t("templates.columns.steps")}</div>
          <div className="col-span-1 text-center">{t("templates.columns.fields")}</div>
          <div className="col-span-2 text-right">{t("templates.columns.price")}</div>
          <div className="col-span-2 text-right">{t("templates.columns.actions")}</div>
        </div>

        {/* Template rows */}
        <div className="divide-y divide-stone-100">
          {templateMeta.map((tmpl) => (
            <div
              key={tmpl.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-stone-50/50 transition-colors"
            >
              <div className="md:col-span-4 flex items-center gap-3">
                <span className="text-xl">{tmpl.icon}</span>
                <span className="font-medium text-stone-900">{tmpl.name}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  {CATEGORY_LABELS[tmpl.category] || tmpl.category}
                </span>
              </div>
              <div className="md:col-span-1 text-center text-stone-600">
                <span className="md:hidden text-xs text-stone-400 mr-1">{t("templates.columns.steps")}:</span>
                {tmpl.stepsCount}
              </div>
              <div className="md:col-span-1 text-center text-stone-600">
                <span className="md:hidden text-xs text-stone-400 mr-1">{t("templates.columns.fields")}:</span>
                {tmpl.fieldsCount}
              </div>
              <div className="md:col-span-2 text-right text-stone-700 font-medium">
                <span className="md:hidden text-xs text-stone-400 mr-1">{t("templates.columns.price")}:</span>
                ₹{tmpl.price}
              </div>
              <div className="md:col-span-2 text-right">
                <button
                  onClick={() => openEdit(tmpl.template)}
                  className="btn-outline text-xs !px-3 !py-1.5 !rounded-lg"
                >
                  {t("templates.editButton")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit slide-out panel */}
      {selectedTemplate && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-50 transition-opacity"
            onClick={closeEdit}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-modal z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-display font-bold text-lg text-stone-900">
                  {t("templates.editTemplate")}
                </h2>
                <p className="text-sm text-stone-500">{selectedTemplate.name}</p>
              </div>
              <button
                onClick={closeEdit}
                className="p-2 text-stone-400 hover:text-stone-700 transition-colors rounded-lg hover:bg-stone-100"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Editable metadata */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t("templates.editPanel.name")}
                </label>
                <input
                  type="text"
                  defaultValue={selectedTemplate.name}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t("templates.editPanel.description")}
                </label>
                <textarea
                  defaultValue={selectedTemplate.description}
                  className="input-field min-h-[80px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t("templates.editPanel.price")}
                </label>
                <input
                  type="number"
                  defaultValue={selectedTemplate.price}
                  className="input-field max-w-[160px]"
                />
              </div>

              {/* Read-only steps & fields tree */}
              <div className="border-t border-stone-200 pt-6">
                <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
                  {t("templates.editPanel.stepsAndFields")}
                </h3>
                <div className="space-y-3">
                  {selectedTemplate.formSteps.map((step, si) => (
                    <div
                      key={step.id}
                      className="border border-stone-200 rounded-xl overflow-hidden"
                    >
                      <div className="bg-stone-50 px-4 py-2.5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">
                          {si + 1}
                        </span>
                        <span className="font-medium text-sm text-stone-800">
                          {step.title}
                        </span>
                        <span className="text-xs text-stone-400 ml-auto">
                          {step.fields.length} {t("templates.editPanel.fieldsCount")}
                        </span>
                      </div>
                      <div className="px-4 py-2 divide-y divide-stone-100">
                        {step.fields.map((field) => (
                          <div
                            key={field.id}
                            className="flex items-center justify-between py-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-stone-800">{field.label}</span>
                              {field.required && (
                                <span className="text-red-400 text-xs">*</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono">
                                {field.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code source note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                <p className="text-sm font-medium text-amber-800">
                  {t("templates.editPanel.codeSourceNote")}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {t("templates.editPanel.deployedOn")} {DEPLOY_DATE}.{" "}
                  {t("templates.editPanel.editInCode")}:{" "}
                  <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-800">
                    {TEMPLATE_SOURCE}
                  </code>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
