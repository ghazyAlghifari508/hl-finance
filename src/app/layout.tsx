import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HL Finance",
  description: "Aplikasi pengelolaan keuangan personal yang simple dan terpercaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
