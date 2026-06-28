import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthProvider";
import { ToastProvider } from "@/app/components/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://outturn.vercel.app"),
  title: "Outturn — Advice, followed through",
  description:
    "Outturn is the accountability control plane for closed-loop farm advisory. A WhatsApp engine nudges each farmer until they act; Outturn shows partners follow-through per district and the lever to act where it slips.",
  openGraph: {
    title: "Outturn — Advice, followed through",
    description: "Closed-loop farm advisory: from advice to action.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
