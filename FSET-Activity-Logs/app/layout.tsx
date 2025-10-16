import type { Metadata } from "next";
import "./globals.css";
import { TranslationProvider } from "@/contexts/TranslationContext";

export const metadata: Metadata = {
  title: "FSET Activity Logs",
  description: "Track and manage FSET program activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
