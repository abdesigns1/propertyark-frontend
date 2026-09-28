import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { BackToTopButton } from "@/components/shared/back-to-top";
import { Toaster } from "@/components/ui/sonner";
import {
  DEFAULT_OG_IMAGE,
  serializeJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "PropertyArk — Buy, Sell & Rent Verified Properties with Confidence",
    template: "%s | PropertyArk",
  },
  description:
    "PropertyArk is a verified property marketplace where buyers browse, inspect, and invest in real estate, and vendors list and manage properties — all in one platform.",
  applicationName: SITE_NAME,
  keywords: [
    "property in Nigeria",
    "real estate Nigeria",
    "verified properties",
    "property for sale",
    "property for rent",
    "shortlet Nigeria",
    "PropertyArk",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    title: "PropertyArk — Buy, Sell & Rent Verified Properties",
    description:
      "Discover verified properties for sale, rent, and shortlet across Nigeria on PropertyArk.",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: "PropertyArk verified property marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropertyArk — Verified Properties in Nigeria",
    description:
      "Discover verified properties for sale, rent, and shortlet across Nigeria.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/PropertyArk%20Logo%20Icon%201.png",
    shortcut: "/PropertyArk%20Logo%20Icon%201.png",
    apple: "/PropertyArk%20Logo%20Icon%201.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/PropertyArk%20Logo%20Icon%201.png`,
    email: "propertyark26@gmail.com",
    sameAs: [
      "https://www.instagram.com/propertyark_",
      "https://web.facebook.com/profile.php?id=61594923290344",
    ],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/properties?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd([organizationJsonLd, websiteJsonLd]),
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
          <BackToTopButton />
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
