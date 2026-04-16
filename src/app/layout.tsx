import type { Metadata } from "next";
import { Geist, Geist_Mono, Courier_Prime } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DraftRoom — The Screenwriter's Studio",
  description:
    "A focused, industry-standard scriptwriting tool for screenwriters, TV writers, and playwrights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        {/* GitHub Pages SPA redirect handler — restores deep-link path after 404 redirect */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var redirect = sessionStorage.getItem('spa_redirect');
            if (redirect) {
              sessionStorage.removeItem('spa_redirect');
              window.history.replaceState(null, '', redirect);
            }
          })();
        `}} />
        {children}
      </body>
    </html>
  );
}
