"use client";

import { useTranslations } from "next-intl";

const SAMPLE_PAYMENTS = [
  { orderId: "ORD-2026-0001", user: "Amit Sharma", docType: "Rental Agreement", amount: 499, status: "success", date: "2026-07-14" },
  { orderId: "ORD-2026-0002", user: "Neha Iyer", docType: "Employment Contract", amount: 599, status: "success", date: "2026-07-12" },
  { orderId: "ORD-2026-0003", user: "Amit Sharma", docType: "Legal Notice", amount: 249, status: "success", date: "2026-07-10" },
  { orderId: "ORD-2026-0004", user: "Priya Patel", docType: "NDA", amount: 299, status: "pending", date: "2026-07-13" },
  { orderId: "ORD-2026-0005", user: "Vikram Singh", docType: "Freelance Agreement", amount: 399, status: "failed", date: "2026-07-11" },
];

export default function AdminPaymentsPage() {
  const t = useTranslations("admin");

  const totalRevenue = SAMPLE_PAYMENTS
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const successCount = SAMPLE_PAYMENTS.filter((p) => p.status === "success").length;
  const failedCount = SAMPLE_PAYMENTS.filter((p) => p.status === "failed").length;
  const pendingCount = SAMPLE_PAYMENTS.filter((p) => p.status === "pending").length;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-green-50 text-green-700",
      pending: "bg-amber-50 text-amber-700",
      failed: "bg-red-50 text-red-700",
    };
    const labels: Record<string, string> = {
      success: t("payments.statusSuccess"),
      pending: t("payments.statusPending"),
      failed: t("payments.statusFailed"),
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
            {t("payments.title")}
          </h1>
          <p className="text-stone-500 mt-1">{t("payments.subtitle")}</p>
        </div>
      </div>

      {/* Cashfree status indicator */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">{t("payments.cashfreePending")}</p>
          <p className="text-xs text-amber-700 mt-0.5">{t("payments.cashfreePendingDesc")}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
          <div className="text-sm text-stone-500 mb-1">{t("payments.totalRevenue")}</div>
          <div className="text-2xl font-bold text-stone-900">₹{totalRevenue.toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
          <div className="text-sm text-stone-500 mb-1">{t("payments.successful")}</div>
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
          <div className="text-sm text-stone-500 mb-1">{t("payments.failed")}</div>
          <div className="text-2xl font-bold text-red-600">{failedCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5">
          <div className="text-sm text-stone-500 mb-1">{t("payments.pending")}</div>
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("payments.columns.orderId")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("payments.columns.user")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("payments.columns.docType")}</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("payments.columns.amount")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("payments.columns.status")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("payments.columns.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {SAMPLE_PAYMENTS.map((payment, idx) => (
                <tr key={payment.orderId} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50/40"}>
                  <td className="px-4 py-3 font-mono text-xs text-teal-700 whitespace-nowrap">{payment.orderId}</td>
                  <td className="px-4 py-3 text-stone-900 whitespace-nowrap">{payment.user}</td>
                  <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{payment.docType}</td>
                  <td className="px-4 py-3 text-stone-700 text-right font-medium whitespace-nowrap">₹{payment.amount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{statusBadge(payment.status)}</td>
                  <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
