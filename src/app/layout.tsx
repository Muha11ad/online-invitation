import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Online Invitation",
  description: "Beautiful personalized event landing pages",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${jost.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
