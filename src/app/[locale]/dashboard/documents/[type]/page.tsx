"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTemplateById, type FormStep, type FormField } from "@/lib/document-templates";
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

function saveData(type: string, data: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(type), JSON.stringify(data));
  } catch {
    // quota exceeded — silently ignore
  }
}

function validateField(field: FormField, value: string, t: ReturnType<typeof useTranslations<"questionnaire">>): string | null {
  if (field.required && (!value || value.trim() === "")) {
    return t("fieldRequired");
  }
  if (!value || value.trim() === "") return null;
  if (field.type === "email") {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(value)) return t("invalidEmail");
  }
  if (field.type === "number") {
    const num = Number(value);
    if (isNaN(num)) return t("mustBeNumber");
    if (field.validation?.min !== undefined && num < field.validation.min) {
      return t("minValue", { min: field.validation.min });
    }
    if (field.validation?.max !== undefined && num > field.validation.max) {
      return t("maxValue", { max: field.validation.max });
    }
  }
  if (
    (field.type === "text" || field.type === "textarea") &&
    field.validation?.minLength &&
    value.length < field.validation.minLength
  ) {
    return t("minLength", { minLength: field.validation.minLength });
  }
  return null;
}

function validateStep(step: FormStep, data: Record<string, string>, t: ReturnType<typeof useTranslations<"questionnaire">>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of step.fields) {
    const err = validateField(field, data[field.id] || "", t);
    if (err) errors[field.id] = err;
  }
  return errors;
}

export default function DocumentQuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const template = getTemplateById(type);
  const t = useTranslations("questionnaire");

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const saved = loadSaved(type);
    if (Object.keys(saved).length > 0) {
      setFormData(saved);
    }
  }, [type]);

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
        <button
          onClick={() => router.push("/dashboard/documents")}
          className="btn-primary"
        >
          ← {t("backToDocuments")}
        </button>
      </div>
    );
  }

  const steps = template.formSteps;
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleFieldChange = useCallback(
    (fieldId: string, value: string) => {
      setFormData((prev) => {
        const next = { ...prev, [fieldId]: value };
        saveData(type, next);
        return next;
      });
      if (errors[fieldId]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    },
    [type, errors]
  );

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(step, formData, t);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    if (isLastStep) {
      saveData(type, formData);
      router.push(`/dashboard/documents/${template.id}/preview`);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
        setErrors({});
      }, 150);
    }
  }, [step, formData, isLastStep, type, router, template.id, t]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      router.push("/dashboard/documents");
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsTransitioning(false);
        setErrors({});
      }, 150);
    }
  }, [currentStep, router]);

  const handleStepClick = useCallback(
    (idx: number) => {
      if (idx < currentStep) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentStep(idx);
          setIsTransitioning(false);
          setErrors({});
        }, 150);
      }
    },
    [currentStep]
  );

  const previewContent = useMemo(
    () => generateDocumentPreview(template, formData),
    [template, formData]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <button
        onClick={() => router.push("/dashboard/documents")}
        className="text-sm text-stone-500 hover:text-teal-600 transition-colors mb-4 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t("backToDocuments")}
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div className="text-4xl flex-shrink-0">{template.icon}</div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-display font-bold text-stone-900">
            {template.name}
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">{template.description}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="hidden sm:flex items-center justify-center gap-0">
          {steps.map((s, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => handleStepClick(idx)}
                  disabled={idx > currentStep}
                  className={`flex flex-col items-center gap-1.5 min-w-[80px] ${
                    idx > currentStep ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200 ${
                      isCompleted
                        ? "bg-teal-600 border-teal-600 text-white"
                        : isActive
                        ? "border-teal-600 text-teal-600 bg-teal-50"
                        : "border-stone-300 text-stone-400 bg-white"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden md:block text-center ${
                      isActive ? "text-teal-700" : isCompleted ? "text-teal-600" : "text-stone-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mt-[-20px]">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        idx < currentStep ? "bg-teal-600" : "bg-stone-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sm:hidden flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-teal-600">
            {t("step", { current: currentStep + 1, total: steps.length })}
          </span>
          <span className="text-sm text-stone-400">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="sm:hidden h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Mobile tab toggle */}
      <div className="lg:hidden flex mb-4 bg-stone-100 rounded-xl p-1">
        <button
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            mobileTab === "form" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
          }`}
        >
          ✏️ {t("form")}
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            mobileTab === "preview" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
          }`}
        >
          📄 {t("preview")}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Panel */}
        <div className={`lg:w-[60%] ${mobileTab === "preview" && "hidden lg:block"}`}>
          <div
            className={`card p-6 md:p-8 transition-opacity duration-150 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            <h2 className="text-lg font-display font-semibold text-stone-900 mb-6">
              {step.title}
            </h2>

            <div className="space-y-5">
              {step.fields.map((field: FormField) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-stone-700 mb-1.5"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      id={field.id}
                      className={`input-field min-h-[90px] resize-y ${
                        errors[field.id] ? "!border-red-400 !ring-red-400" : ""
                      }`}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.id}
                      className={`input-field ${
                        errors[field.id] ? "!border-red-400 !ring-red-400" : ""
                      }`}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    >
                      <option value="">{t("selectOption")}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "date" ? (
                    <input
                      id={field.id}
                      type="date"
                      className={`input-field ${
                        errors[field.id] ? "!border-red-400 !ring-red-400" : ""
                      }`}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  ) : field.type === "number" ? (
                    <input
                      id={field.id}
                      type="number"
                      className={`input-field ${
                        errors[field.id] ? "!border-red-400 !ring-red-400" : ""
                      }`}
                      placeholder={field.placeholder || "0"}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  ) : field.type === "email" ? (
                    <input
                      id={field.id}
                      type="email"
                      className={`input-field ${
                        errors[field.id] ? "!border-red-400 !ring-red-400" : ""
                      }`}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  ) : (
                    <input
                      id={field.id}
                      type="text"
                      className={`input-field ${
                        errors[field.id] ? "!border-red-400 !ring-red-400" : ""
                      }`}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  )}

                  {errors[field.id] && (
                    <p className="mt-1.5 text-sm text-red-500">{errors[field.id]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={handleBack} className="btn-secondary">
              {currentStep === 0 ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("cancel")}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("back")}
                </>
              )}
            </button>
            <button onClick={handleNext} className="btn-primary">
              {isLastStep ? (
                <>
                  {t("generateDocument")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              ) : (
                <>
                  {t("next")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`lg:w-[40%] ${mobileTab === "form" && "hidden lg:block"}`}>
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
                {t("livePreview")}
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {t("autoUpdating")}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-elevated overflow-hidden">
              <div className="h-1.5 bg-teal-600" />
              <div className="p-5 md:p-6">
                <div className="font-serif text-stone-800 text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
                  {previewContent || (
                    <p className="text-stone-400 italic font-sans">{t("previewEmpty")}</p>
                  )}
                </div>
              </div>
              <div className="bg-amber-50 border-t border-amber-100 px-4 py-2.5">
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  ⚠️ {t("disclaimer")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
