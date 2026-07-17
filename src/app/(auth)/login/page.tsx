"use client";

import Link from "next/link";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <DisclaimerBanner />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">M</span>
              </div>
              <span className="font-display font-bold text-xl text-stone-900">
                Munsif AI
              </span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-stone-900">
              Welcome Back
            </h1>
            <p className="text-stone-500 mt-2">
              Sign in to access your documents
            </p>
          </div>

          {/* Login Form */}
          <div className="card p-6 md:p-8">
            <form className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* OTP / Password — placeholder */}
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Verification Code
                </label>
                <div className="flex gap-3">
                  <input
                    id="otp"
                    type="text"
                    className="input-field"
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                  />
                  <button type="button" className="btn-secondary whitespace-nowrap !px-4">
                    Send Code
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-stone-400">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Auth */}
            <button className="btn-secondary w-full !bg-white border border-stone-300 hover:!bg-stone-50">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-stone-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-teal-600 font-medium hover:text-teal-700">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
