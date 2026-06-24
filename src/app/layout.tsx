import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import PwaRegister from "@/components/PwaRegister";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "WatchKnot | Cozy Movie Journal & Watch Party",
  description: "A cozy, vintage-aesthetic social platform for friends to collect, review, and watch movies together. Create your digital movie journal and host real-time synchronized watch parties.",
  applicationName: "WatchKnot",
  authors: [{ name: "WatchKnot Team" }],
  generator: "Next.js",
  keywords: ["movie journal", "watch party", "virtual movie theater", "social platform", "movie tracker", "watch together", "sync movies", "online theater"],
  creator: "WatchKnot",
  publisher: "WatchKnot",
  alternates: {
    canonical: "https://watchknot.vercel.app",
  },
  openGraph: {
    title: "WatchKnot | Cozy Movie Journal & Watch Party",
    description: "Your personalized virtual movie theater and journal.",
    url: "https://watchknot.vercel.app",
    siteName: "WatchKnot",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WatchKnot | Cozy Movie Journal & Watch Party",
    description: "Your personalized virtual movie theater and journal.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WatchKnot",
    url: "https://watchknot.vercel.app",
    description: "A cozy, vintage-aesthetic social platform for friends to collect, review, and watch movies together with synchronized watch parties.",
    applicationCategory: "SocialNetworkingApplication",
    genre: "Entertainment",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.removeAttribute('data-theme');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${caveat.variable}`}>
        <PwaRegister />
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
