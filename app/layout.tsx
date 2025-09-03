import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";
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
  title: "Polly - Create and Share Polls",
  description: "A modern polling application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
