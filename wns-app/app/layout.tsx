import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Wei Name Service — .wei Domains",
  description:
    "Register your .wei domain name on Ethereum. Decentralized, NFT-backed identity for the web3 era.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans">{children}</body>
    </html>
  );
}
