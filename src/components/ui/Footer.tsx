import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  const docTypes = [
    "Rental Agreement",
    "Non-Disclosure Agreement",
    "Employment Contract",
    "Freelance Agreement",
    "Power of Attorney",
    "Legal Notice",
    "Affidavit",
    "Partnership Deed",
  ];

  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold">M</span>
              </div>
              <span className="font-display font-bold text-white text-lg">Munsif AI</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-500">{t("tagline")}</p>
          </div>

          <div>
            <h4 className="font-semibold text-stone-300 mb-3">{t("documentTypes")}</h4>
            <ul className="space-y-2 text-sm">
              {docTypes.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-300 mb-3">{t("legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li>{t("privacyPolicy")}</li>
              <li>{t("termsOfService")}</li>
              <li>{t("refundPolicy")}</li>
              <li>{t("contactUs")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6">
          <p className="text-xs text-stone-500 leading-relaxed">
            <strong>Disclaimer:</strong> {t("disclaimer")}
          </p>
          <p className="text-xs text-stone-600 mt-3">
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
