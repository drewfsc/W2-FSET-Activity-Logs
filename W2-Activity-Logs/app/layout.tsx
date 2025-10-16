import type { Metadata } from "next";
import "./globals.css";
import { TranslationProvider } from "@/contexts/TranslationContext";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "W-2 Activity Logs",
  description: "Track and manage W-2 program activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
