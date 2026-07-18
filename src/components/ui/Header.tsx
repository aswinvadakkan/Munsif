"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const t = useTranslations("header");
  return (
    <header>
      <DisclaimerBanner />
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">M</span>
              </div>
              <span className="font-display font-bold text-lg text-stone-900 hidden sm:block">
                Munsif AI
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
              <Link
                href="/dashboard/documents"
                className="hover:text-teal-700 transition-colors"
              >
                {t("documents")}
              </Link>
              <Link
                href="/#how-it-works"
                className="hover:text-teal-700 transition-colors"
              >
                {t("howItWorks")}
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 hover:text-teal-700 transition-colors"
              >
                {t("signIn")}
              </Link>
              <Link href="/signup" className="btn-primary text-sm !px-4 !py-2 !rounded-lg">
                {t("getStarted")}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
