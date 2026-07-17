"use client";

import Link from "next/link";
import { DisclaimerBanner } from "./DisclaimerBanner";

export function Header() {
  return (
    <header>
      <DisclaimerBanner />
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">M</span>
              </div>
              <span className="font-display font-bold text-lg text-stone-900 hidden sm:block">
                Munsif AI
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
              <Link href="/dashboard/documents" className="hover:text-teal-700 transition-colors">
                Documents
              </Link>
              <Link href="/#how-it-works" className="hover:text-teal-700 transition-colors">
                How It Works
              </Link>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 hover:text-teal-700 transition-colors"
              >
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary text-sm !px-4 !py-2 !rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
