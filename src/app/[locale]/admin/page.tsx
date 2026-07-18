"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";

export default function AdminOverviewPage() {
  const t = useTranslations("admin");

  const stats = [
    {
      label: t("stats.totalUsers"),
      value: "N/A",
      subtitle: t("stats.convexPending"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: t("stats.totalDocuments"),
      value: "—",
      subtitle: t("stats.placeholderUntilLive"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      color: "bg-teal-50 text-teal-700",
    },
    {
      label: t("stats.totalRevenue"),
      value: "N/A",
      subtitle: t("stats.cashfreePending"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
        </svg>
      ),
      color: "bg-green-50 text-green-700",
    },
    {
      label: t("stats.activeTemplates"),
      value: String(DOCUMENT_TEMPLATES.length),
      subtitle: "",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-700",
    },
  ];

  const quickLinks = [
    { href: "/admin/users", label: t("quickLinks.users"), desc: t("quickLinks.usersDesc"), icon: "👥" },
    { href: "/admin/documents", label: t("quickLinks.documents"), desc: t("quickLinks.documentsDesc"), icon: "📄" },
    { href: "/admin/payments", label: t("quickLinks.payments"), desc: t("quickLinks.paymentsDesc"), icon: "💰" },
    { href: "/admin/templates", label: t("quickLinks.templates"), desc: t("quickLinks.templatesDesc"), icon: "📋" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-900">
          {t("title")}
        </h1>
        <p className="text-stone-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-stone-200 shadow-card p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-stone-900">{stat.value}</div>
            <div className="text-sm text-stone-500">{stat.label}</div>
            {stat.subtitle && (
              <div className="text-xs text-stone-400 mt-1">{stat.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{t("quickLinks.title")}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl border border-stone-200 shadow-card p-5 hover:shadow-elevated transition-shadow group"
          >
            <div className="text-2xl mb-3">{link.icon}</div>
            <h3 className="font-semibold text-stone-900 group-hover:text-teal-700 transition-colors">
              {link.label}
            </h3>
            <p className="text-sm text-stone-500 mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
