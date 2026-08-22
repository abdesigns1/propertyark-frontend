import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { BackToTopButton } from "@/components/shared/back-to-top";
import { Toaster } from "@/components/ui/sonner";
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
  title: {
    default:
      "PropertyArk — Buy, Sell & Rent Verified Properties with Confidence",
    template: "%s | PropertyArk",
  },
  description:
    "PropertyArk is a verified property marketplace where buyers browse, inspect, and invest in real estate, and vendors list and manage properties — all in one platform.",
  icons: {
    icon: [
      {
        url: "/property%20arc%20logo-7.png",
        type: "image/png",
      },
    ],
    shortcut: "/property%20arc%20logo-7.png",
    apple: "/property%20arc%20logo-7.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
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
