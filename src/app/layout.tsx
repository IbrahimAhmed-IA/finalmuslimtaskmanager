import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ClientProviders from "../client-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muslim Task Manager",
  description:
    "A task manager app for Muslims with additional features like Pomodoro timer and Notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
        <Toaster position="top-right" />
        <div id="portal-root" />
      </body>
    </html>
  );
}
