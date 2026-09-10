import type { Metadata } from 'next';
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
          <a href="/">Dashboard</a>
          <a href="/profile">Profile</a>
          <a href="/jobs">Jobs</a>
          <a href="/applications">Applications</a>
          <a href="/documents">Documents</a>
          <a href="/analytics">Analytics</a>
          <a href="/audit">Audit</a>
          <a href="/automation">Automation</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
