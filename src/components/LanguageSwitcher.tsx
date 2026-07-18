"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition, useState, useRef, useEffect } from "react";

type LocaleKey = "en" | "hi" | "ta" | "te" | "mr" | "bn";

const LANGUAGES: { code: LocaleKey; flag: string; nativeName: string }[] = [
  { code: "en", flag: "🇬🇧", nativeName: "English" },
  { code: "hi", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "ta", flag: "🇮🇳", nativeName: "தமிழ்" },
  { code: "te", flag: "🇮🇳", nativeName: "తెలుగు" },
  { code: "mr", flag: "🇮🇳", nativeName: "मराठी" },
  { code: "bn", flag: "🇮🇳", nativeName: "বাংলা" },
];

export function LanguageSwitcher() {
  const locale = useLocale() as LocaleKey;
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const switchLocale = (nextLocale: LocaleKey) => {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold
          bg-stone-100 hover:bg-teal-50 border border-stone-200 hover:border-teal-300
          text-stone-700 hover:text-teal-700 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed"
        title={currentLang.nativeName}
      >
        <span>{currentLang.flag}</span>
        <span className="text-teal-700 font-bold">{t(currentLang.code)}</span>
        <svg
          className={`w-3 h-3 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-elevated border border-stone-200 py-1 z-50 animate-fadeIn">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
                ${
                  lang.code === locale
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1">{lang.nativeName}</span>
              <span className="text-xs text-stone-400 font-mono">{t(lang.code)}</span>
              {lang.code === locale && (
                <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
