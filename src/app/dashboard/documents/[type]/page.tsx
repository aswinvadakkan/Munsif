"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTemplateById } from "@/lib/document-templates";

export default function DocumentQuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const template = getTemplateById(type);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

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
          onClick={() => router.push("/dashboard/documents")}
          className="btn-primary"
        >
          ← Back to Documents
        </button>
      </div>
    );
  }

  const steps = template.formSteps;
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      const searchParams = new URLSearchParams({
        type: template.id,
        ...formData,
      });
      router.push(
        `/dashboard/documents/${template.id}/preview?${searchParams.toString()}`
      );
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.push("/dashboard/documents");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push("/dashboard/documents")}
        className="text-sm text-stone-500 hover:text-teal-600 transition-colors mb-4"
      >
        ← Back to Documents
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div className="text-4xl">{template.icon}</div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-900">
            {template.name}
          </h1>
          <p className="text-stone-500 mt-1">{template.description}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-teal-600">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-stone-400">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-900">{step.title}</h2>
      </div>

      {/* Form Fields */}
      <div className="card p-6 md:p-8 mb-6">
        <div className="space-y-5">
          {step.fields.map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                {field.label}
                {field.required && <span className="text-saffron-500 ml-1">*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  className="input-field min-h-[100px] resize-y"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.id}
                  className="input-field"
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select an option...</option>
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
                  className="input-field"
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                />
              ) : field.type === "number" ? (
                <input
                  id={field.id}
                  type="number"
                  className="input-field"
                  placeholder={field.placeholder || "0"}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                />
              ) : (
                <input
                  id={field.id}
                  type={field.type}
                  className="input-field"
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={handleBack} className="btn-secondary">
          {currentStep === 0 ? "Cancel" : "← Back"}
        </button>
        <button onClick={handleNext} className="btn-primary">
          {isLastStep ? "Preview Document →" : "Next →"}
        </button>
      </div>

      {/* Step Dots (mobile) */}
      <div className="flex items-center justify-center gap-2 mt-6 sm:hidden">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentStep
                ? "bg-teal-600"
                : idx < currentStep
                ? "bg-teal-300"
                : "bg-stone-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
