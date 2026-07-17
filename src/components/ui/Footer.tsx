export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold">M</span>
              </div>
              <span className="font-display font-bold text-white text-lg">Munsif AI</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-500">
              India&apos;s AI-powered legal document generator for SMEs, freelancers, and individuals.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-stone-300 mb-3">Document Types</h4>
            <ul className="space-y-2 text-sm">
              <li>Rental Agreement</li>
              <li>Non-Disclosure Agreement</li>
              <li>Employment Contract</li>
              <li>Freelance Agreement</li>
              <li>Power of Attorney</li>
              <li>Legal Notice</li>
              <li>Affidavit</li>
              <li>Partnership Deed</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-stone-300 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Refund Policy</li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-stone-800 pt-6">
          <p className="text-xs text-stone-500 leading-relaxed">
            <strong>Disclaimer:</strong> Munsif AI generates AI-assisted legal documents. We are not a law firm, and our documents are not a substitute for advice from a licensed advocate. Every document is clearly marked as AI-generated. Always consult a qualified legal professional for your specific situation. Use of this service is subject to our Terms of Service.
          </p>
          <p className="text-xs text-stone-600 mt-3">
            &copy; {new Date().getFullYear()} Munsif AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
