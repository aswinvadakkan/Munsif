import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { DocumentCard } from "@/components/DocumentCard";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-saffron-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
                <span className="w-2 h-2 bg-saffron-400 rounded-full animate-pulse" />
                <span>{t("badge")}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-balance leading-tight">
                {t("heroTitle")}{" "}
                <span className="text-saffron-400">{t("heroTitleHighlight")}</span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-teal-100 text-balance leading-relaxed max-w-2xl mx-auto">
                {t("heroSubtitle")}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="btn-accent text-base px-8 py-3.5 !rounded-xl !text-base w-full sm:w-auto"
                >
                  {t("heroCTA")}
                </Link>
                <Link
                  href="/dashboard/documents"
                  className="btn-outline text-white border-white/30 hover:bg-white/10 text-base px-8 py-3.5 !rounded-xl !text-base w-full sm:w-auto"
                >
                  {t("browseDocuments")}
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-teal-200">
                <span className="flex items-center gap-1.5">
                  <span>🔒</span> {t("trustEncrypted")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span>🇮🇳</span> {t("trustCompliant")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span>⚡</span> {t("trustFast")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span>🌐</span> {t("trustBilingual")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">{t("howItWorks")}</h2>
              <p className="section-subtitle mt-3">{t("howItWorksSub")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: "📋",
                  title: t("step1Title"),
                  desc: t("step1Desc"),
                },
                {
                  step: "02",
                  icon: "🤖",
                  title: t("step2Title"),
                  desc: t("step2Desc"),
                },
                {
                  step: "03",
                  icon: "📄",
                  title: t("step3Title"),
                  desc: t("step3Desc"),
                },
              ].map((item) => (
                <div key={item.step} className="text-center group">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-teal-500 mb-2">
                    {t("step")} {item.step}
                  </div>
                  <h3 className="font-semibold text-stone-900 text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Document Types Grid */}
        <section className="py-16 md:py-24 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">{t("documentTypes")}</h2>
              <p className="section-subtitle mt-3">{t("documentTypesSub")}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {DOCUMENT_TEMPLATES.map((template) => (
                <DocumentCard
                  key={template.id}
                  template={template}
                  href={`/dashboard/documents/${template.id}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 md:py-24 bg-stone-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold">
                {t("trustTitle")}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "🤖",
                  title: t("trustAI"),
                  desc: t("trustAIDesc"),
                },
                {
                  icon: "🔒",
                  title: t("trustEncrypted"),
                  desc: t("trustEncryptedDesc"),
                },
                {
                  icon: "⚖️",
                  title: t("trustCompliant"),
                  desc: t("trustCompliantDesc"),
                },
                {
                  icon: "📢",
                  title: t("trustTransparent"),
                  desc: t("trustTransparentDesc"),
                },
              ].map((item) => (
                <div key={item.title} className="bg-stone-800 rounded-2xl p-6">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-teal-700 to-teal-600">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 text-teal-100">{t("ctaSubtitle")}</p>
            <Link
              href="/signup"
              className="btn-accent mt-8 inline-block text-base px-8 py-3.5"
            >
              {t("ctaButton")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
