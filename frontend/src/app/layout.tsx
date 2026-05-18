import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncUp — Coaching Feed",
  description: "Realtime coaching feed application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/" className="logo">
            SyncUp
          </Link>
          <div className="nav-links">
            <Link href="/">Feed</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </nav>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
