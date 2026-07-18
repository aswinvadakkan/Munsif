"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "hi" : "en";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold
        bg-stone-100 hover:bg-teal-50 border border-stone-200 hover:border-teal-300
        text-stone-700 hover:text-teal-700 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed"
      title={locale === "en" ? "Switch to Hindi" : "अंग्रेज़ी में बदलें"}
    >
      <span
        className={`transition-all duration-200 ${
          locale === "en" ? "text-teal-600" : "text-stone-400"
        }`}
      >
        🇬🇧
      </span>
      <span
        className={`transition-all duration-200 ${
          locale === "en" ? "font-bold text-teal-700" : "text-stone-500"
        }`}
      >
        {t("en")}
      </span>
      <span className="text-stone-300">|</span>
      <span
        className={`transition-all duration-200 ${
          locale === "hi" ? "text-teal-600" : "text-stone-400"
        }`}
      >
        🇮🇳
      </span>
      <span
        className={`transition-all duration-200 ${
          locale === "hi" ? "font-bold text-teal-700" : "text-stone-500"
        }`}
      >
        {t("hi")}
      </span>
    </button>
  );
}
