import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Agla Kadam — Understand the response. Know your next step.",
  description:
    "A citizen-side grievance resolution companion. Compares your request with the department response and shows what you can safely do next. Hackathon demo using synthetic data.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f5fe0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="container-page py-6 sm:py-10">
            {children}
          </main>
          <footer className="container-page pb-10 pt-6 text-center text-xs text-ink-faint">
            <p>
              Agla Kadam · Hackathon prototype · Synthetic data only · Not a
              Government of India service.
            </p>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
