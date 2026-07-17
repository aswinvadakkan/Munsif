import Link from "next/link";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { DocumentCard } from "@/components/DocumentCard";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-saffron-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
                <span className="w-2 h-2 bg-saffron-400 rounded-full animate-pulse" />
                <span>AI-Powered • India-First • Legally Grounded</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-balance leading-tight">
                India&apos;s AI Legal{" "}
                <span className="text-saffron-400">Document Generator</span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-teal-100 text-balance leading-relaxed max-w-2xl mx-auto">
                Create legally grounded, India-specific legal documents in minutes.
                Rental agreements, NDAs, employment contracts, and more — in English or
                Hindi. No lawyer needed.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-accent text-base px-8 py-3.5 !rounded-xl !text-base w-full sm:w-auto">
                  Start Creating — It&apos;s Free
                </Link>
                <Link
                  href="/dashboard/documents"
                  className="btn-outline text-white border-white/30 hover:bg-white/10 text-base px-8 py-3.5 !rounded-xl !text-base w-full sm:w-auto"
                >
                  Browse Documents
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-teal-200">
                <span className="flex items-center gap-1.5">
                  <span>🔒</span> Encrypted & Secure
                </span>
                <span className="flex items-center gap-1.5">
                  <span>🇮🇳</span> India Law Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <span>⚡</span> Generated in Minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <span>🌐</span> English & हिन्दी
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle mt-3">
                Three simple steps to your legal document
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: "📋",
                  title: "Answer a Few Questions",
                  desc: "Our guided questionnaire takes just a few minutes. No legal jargon — plain, simple questions.",
                },
                {
                  step: "02",
                  icon: "🤖",
                  title: "AI Drafts Your Document",
                  desc: "We draft a legally grounded document referencing Indian contract law and stamp duty norms.",
                },
                {
                  step: "03",
                  icon: "📄",
                  title: "Review & Download",
                  desc: "Preview your document, pay securely via UPI or card, and download the print-ready PDF.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center group">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-teal-500 mb-2">
                    STEP {item.step}
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
              <h2 className="section-title">Document Types</h2>
              <p className="section-subtitle mt-3">
                Choose from 8 professionally crafted legal templates
              </p>
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
                Built on Trust
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "🤖",
                  title: "AI-Generated",
                  desc: "Every document is clearly marked as AI-generated. No ambiguity.",
                },
                {
                  icon: "🔒",
                  title: "Encrypted",
                  desc: "Your data is encrypted in transit and at rest. Never shared with third parties.",
                },
                {
                  icon: "⚖️",
                  title: "India-Compliant",
                  desc: "References Indian contract law, stamp duty norms, and relevant state provisions.",
                },
                {
                  icon: "📢",
                  title: "Transparent",
                  desc: "We are not a law firm. We make this clear on every page and every document.",
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
              Ready to create your first legal document?
            </h2>
            <p className="mt-3 text-teal-100">
              Join thousands of Indian SMEs and freelancers who trust Munsif AI.
            </p>
            <Link
              href="/signup"
              className="btn-accent mt-8 inline-block text-base px-8 py-3.5"
            >
              Get Started — Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
