"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard" as const, label: t("overview"), icon: "📊" },
    { href: "/dashboard/documents" as const, label: t("documents"), icon: "📄" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <DisclaimerBanner />

      <nav className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-display font-bold">M</span>
                </div>
                <span className="font-display font-semibold text-stone-900 hidden sm:block">
                  Munsif AI
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-teal-50 text-teal-700"
                          : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/dashboard/documents"
                className="btn-primary text-sm !px-4 !py-2 !rounded-lg"
              >
                {t("newDocument")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 z-40">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-xs font-medium ${
                  isActive ? "text-teal-700" : "text-stone-500"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
