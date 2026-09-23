import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "reveal. — Don't just send an invitation. Send an experience.",
  description:
    "Create cinematic, interactive digital invitations and share them on WhatsApp.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-display antialiased">{children}</body>
    </html>
  );
}
