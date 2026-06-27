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
  metadataBase: new URL("https://outturn.vercel.app"),
  title: "Outturn — Agricultural Accountability Engine",
  description:
    "Outturn is the control plane that proves what your advisory program produced — tracking farmer follow-through across districts and surfacing where to act. Powered by AgriNexus AI.",
  openGraph: {
    title: "Outturn",
    description: "Proof of what your advisory program produced.",
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
