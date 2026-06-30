import type { Metadata, Viewport } from "next";
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
  title: "Outturn — Advice that closes the loop",
  description:
    "Outturn is the accountability layer for WhatsApp crop advisory. It sends farmers weather-timed advice, tracks which farmers act on it, and lets partners — NGOs, agri-input companies, co-ops and government extension — see follow-through by district and re-nudge the rest.",
  openGraph: {
    title: "Outturn — Advice that closes the loop",
    description: "WhatsApp crop advisory that closes the loop — advice tracked all the way to done.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
