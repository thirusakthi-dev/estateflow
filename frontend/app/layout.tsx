import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { createMetadata } from "@/lib/metadata";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = createMetadata({
  title: "Real Estate Management CRM",
  description:
    "Manage real estate leads, projects, units, and bookings with EstateFlow.",
  noIndex: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AnimatedBackground />

          <QueryProvider>
            <ToastProvider>
              <div className="relative z-10 min-h-dvh">{children}</div>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
