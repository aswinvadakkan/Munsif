"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

// Sample user data for table structure demo
const SAMPLE_USERS = [
  { id: "u1", name: "Amit Sharma", email: "amit@example.com", phone: "+91 98765 43210", role: "user", documentsGenerated: 3, joinedDate: "2026-01-15" },
  { id: "u2", name: "Priya Patel", email: "priya@example.com", phone: "+91 87654 32109", role: "user", documentsGenerated: 7, joinedDate: "2025-11-22" },
  { id: "u3", name: "Vikram Singh", email: "vikram@startup.in", phone: "+91 76543 21098", role: "user", documentsGenerated: 1, joinedDate: "2026-06-01" },
  { id: "u4", name: "Neha Iyer", email: "neha@freelance.in", phone: "+91 65432 10987", role: "user", documentsGenerated: 12, joinedDate: "2025-09-10" },
  { id: "u5", name: "Rajesh Kumar", email: "admin@munsif.ai", phone: "+91 98765 00001", role: "admin", documentsGenerated: 0, joinedDate: "2025-08-01" },
];

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search) return SAMPLE_USERS;
    const q = search.toLowerCase();
    return SAMPLE_USERS.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-900">
            {t("users.title")}
          </h1>
          <p className="text-stone-500 mt-1">{t("users.subtitle")}</p>
        </div>
      </div>

      {/* Placeholder notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-800">{t("placeholder.usersTitle")}</p>
          <p className="text-sm text-amber-700 mt-0.5">{t("placeholder.usersDesc")}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("users.searchPlaceholder")}
          className="input-field max-w-sm"
        />
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("users.columns.name")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("users.columns.email")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("users.columns.phone")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("users.columns.role")}</th>
                <th className="text-center px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("users.columns.documents")}</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t("users.columns.joined")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                    {search ? t("users.noResults") : t("users.noUsers")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50/40"}>
                    <td className="px-4 py-3 font-medium text-stone-900 whitespace-nowrap">{user.name}</td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{user.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-stone-600 whitespace-nowrap">{user.documentsGenerated}</td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{user.joinedDate}</td>
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
