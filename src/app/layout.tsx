import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deadline — Student Assignment & Deadline Manager",
  description: "Stay ahead of your academic workload, track assignments, and conquer deadlines with a sleek AMOLED command center.",
  keywords: ["student deadline tracker", "assignment manager", "university workload", "homework planner", "course organizer"],
  authors: [{ name: "Deadline" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-black text-[#F5F5F5] min-h-screen antialiased selection:bg-purple-600/30 selection:text-purple-200`}>
        {children}
      </body>
    </html>
  );
}
