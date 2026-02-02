import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafePool — AI-Powered Pool Safety",
  description:
    "Extra underwater eyes for lifeguards. Real-time distress detection that assists—never replaces—human vigilance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-teal-deep focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
