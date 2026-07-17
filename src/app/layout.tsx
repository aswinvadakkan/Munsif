import type { Metadata } from "next";
import ConvexClientProvider from "@/lib/convex";
import "@/styles/globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Munsif AI — India's AI Legal Document Generator",
    template: "%s | Munsif AI",
  },
  description:
    "Create legally grounded, India-specific legal documents in minutes — rental agreements, NDAs, employment contracts, and more. For SMEs, freelancers, and individuals.",
  keywords: [
    "legal documents",
    "India",
    "rental agreement",
    "NDA",
    "employment contract",
    "AI legal",
    "document generator",
    "Hindi legal documents",
  ],
  openGraph: {
    title: "Munsif AI — India's AI Legal Document Generator",
    description:
      "Create legally grounded, India-specific legal documents in minutes.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-stone-50">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
