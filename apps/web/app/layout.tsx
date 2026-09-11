import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career OS',
  description: 'Local-first personal Career OS — evidence-backed career management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="topnav">
          <Link href="/">Dashboard</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/applications">Applications</Link>
          <Link href="/documents">Documents</Link>
          <Link href="/analytics">Analytics</Link>
          <Link href="/audit">Audit</Link>
          <Link href="/automation">Automation</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
