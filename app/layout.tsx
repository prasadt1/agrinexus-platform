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
  title: "Outturn Advisory — Agricultural Accountability Engine",
  description:
    "Outturn Advisory is the accountability layer for farmer advisory programs: it sends weather-timed WhatsApp reminders, tracks which farmers actually acted, and shows funders the real follow-through per district. Powered by AgriNexus AI.",
  openGraph: {
    title: "Outturn Advisory",
    description: "Send the advice. Prove it was acted on.",
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
