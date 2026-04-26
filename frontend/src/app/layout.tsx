import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Upgraded the metadata for a professional touch
export const metadata: Metadata = {
  title: "ExpenseTracker | Fenmo Assessment",
  description: "A production-ready expense tracker.",
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
    >
      {/* The body must be the direct child of html */}
      <body className="bg-slate-950 text-slate-50 min-h-screen font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}