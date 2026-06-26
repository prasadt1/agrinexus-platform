import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthProvider";
import { ToastProvider } from "@/app/components/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgriNexus Platform — B2B Advisory Control Plane",
  description:
    "Provision district cohorts, monitor farmer follow-through, and license agricultural advisory programs at scale.",
  openGraph: {
    title: "AgriNexus Platform",
    description: "B2B control plane for agricultural advisory services",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
