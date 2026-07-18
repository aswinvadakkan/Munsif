"use client";

import { useState, useCallback } from "react";
import {
  getStampDuty,
  getRateForDocType,
  calculateRentAgreementDuty,
  STATE_OPTIONS,
  DOC_TYPE_LABELS,
  type StampDutyDocType,
} from "@/lib/stamp-duty";

export default function StampDutyCalculator() {
  const [stateKey, setStateKey] = useState<string>("delhi");
  const [docType, setDocType] = useState<StampDutyDocType>("rent-agreement");
  const [monthlyRent, setMonthlyRent] = useState<string>("");
  const [leaseMonths, setLeaseMonths] = useState<string>("11");
  const [showRentCalc, setShowRentCalc] = useState(false);

  const stampInfo = getStampDuty(stateKey);
  const rate = getRateForDocType(stateKey, docType);

  const handleStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStateKey(e.target.value);
    },
    []
  );

  const handleDocTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newDocType = e.target.value as StampDutyDocType;
      setDocType(newDocType);
      setShowRentCalc(newDocType === "rent-agreement");
    },
    []
  );

  // Calculate percentage-based duty for rental agreements
  let dutyCalc: { amount: number; description: string } | null = null;
  if (
    showRentCalc &&
    monthlyRent &&
    leaseMonths &&
    !isNaN(Number(monthlyRent)) &&
    !isNaN(Number(leaseMonths))
  ) {
    dutyCalc = calculateRentAgreementDuty(
      stateKey,
      Number(monthlyRent),
      Number(leaseMonths)
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-teal-50 border-b border-teal-100 px-5 py-3">
        <h3 className="font-display font-semibold text-teal-900 text-sm flex items-center gap-2">
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
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Stamp Duty Calculator
        </h3>
        <p className="text-teal-700 text-[11px] mt-0.5">
          Approximate rates as per the Indian Stamp Act, 1899
        </p>
      </div>

      {/* Calculator body */}
      <div className="p-5 space-y-4">
        {/* State selector */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5">
            Select State / UT
          </label>
          <select
            value={stateKey}
            onChange={handleStateChange}
            className="w-full rounded-lg border border-stone-300 bg-white text-sm text-stone-800 px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            {STATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Document type selector */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5">
            Document Type
          </label>
          <select
            value={docType}
            onChange={handleDocTypeChange}
            className="w-full rounded-lg border border-stone-300 bg-white text-sm text-stone-800 px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            {(Object.entries(DOC_TYPE_LABELS) as [StampDutyDocType, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        {/* Rate display */}
        {rate && stampInfo && (
          <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">
                Applicable Stamp Duty
              </span>
              <span className="text-[10px] text-stone-400">
                Updated: {new Date(stampInfo.updatedDate).toLocaleDateString("en-IN")}
              </span>
            </div>
            <p className="text-lg font-display font-bold text-teal-700">
              {rate}
            </p>
            {docType === "rent-agreement" &&
              stampInfo.rentAgreement.maxCap && (
                <p className="text-xs text-stone-500 mt-1">
                  {stampInfo.rentAgreement.maxCap}
                </p>
              )}
            {docType === "rent-agreement" &&
              stampInfo.rentAgreement.notes && (
                <p className="text-xs text-amber-600 mt-1">
                  {stampInfo.rentAgreement.notes}
                </p>
              )}
            {docType === "nda" && stampInfo.nda.notes && (
              <p className="text-xs text-amber-600 mt-1">
                {stampInfo.nda.notes}
              </p>
            )}
            {docType === "affidavit" && stampInfo.affidavit.notes && (
              <p className="text-xs text-amber-600 mt-1">
                {stampInfo.affidavit.notes}
              </p>
            )}
            {docType === "partnership" && stampInfo.partnership.notes && (
              <p className="text-xs text-amber-600 mt-1">
                {stampInfo.partnership.notes}
              </p>
            )}
            {docType === "general-agreement" &&
              stampInfo.generalAgreement.notes && (
                <p className="text-xs text-amber-600 mt-1">
                  {stampInfo.generalAgreement.notes}
                </p>
              )}
          </div>
        )}

        {/* Rent-specific calculator */}
        {showRentCalc && (
          <div className="border-t border-stone-100 pt-4">
            <p className="text-xs font-medium text-stone-600 mb-3">
              Calculate approximate stamp duty for your rental agreement:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="e.g., 15,000"
                  className="w-full rounded-lg border border-stone-300 bg-white text-sm text-stone-800 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  Duration (months)
                </label>
                <input
                  type="number"
                  value={leaseMonths}
                  onChange={(e) => setLeaseMonths(e.target.value)}
                  placeholder="e.g., 11"
                  className="w-full rounded-lg border border-stone-300 bg-white text-sm text-stone-800 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
              </div>
            </div>

            {/* Calculation result */}
            {dutyCalc && (
              <div className="mt-4 bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-xs text-teal-700 mb-1">
                  {dutyCalc.description}
                </p>
                <p className="text-xl font-display font-bold text-teal-800">
                  ₹{dutyCalc.amount.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-teal-600 mt-1">
                  Approximate stamp duty — verify with local sub-registrar
                </p>
              </div>
            )}

            {monthlyRent && !dutyCalc && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  This state uses a flat-rate stamp duty for rental agreements.
                  The exact amount is shown above in the "Applicable Stamp Duty"
                  section.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="bg-amber-50 border-t border-amber-100 px-5 py-2.5">
        <p className="text-amber-700 text-[10px] leading-relaxed">
          ⚠️ Rates are indicative as of {stampInfo?.updatedDate || "July 2026"}.
          Actual stamp duty may vary based on document value, duration, and
          specific state amendments. Always verify with local authorities.
        </p>
      </div>
    </div>
  );
}
