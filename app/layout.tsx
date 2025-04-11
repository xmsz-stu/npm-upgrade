import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/context/translation-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NPM Package Version Checker",
  description: "Check and compare NPM package versions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
