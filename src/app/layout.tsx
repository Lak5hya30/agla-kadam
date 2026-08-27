import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { DemoRibbon } from "@/components/DemoRibbon";
import { CpgramsHeader } from "@/components/CpgramsHeader";
import { CpgramsFooter } from "@/components/CpgramsFooter";

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
          <AuthProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
            >
              Skip to content
            </a>
            <DemoRibbon />
            <CpgramsHeader />
            <main id="main">{children}</main>
            <CpgramsFooter />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
