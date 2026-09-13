import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career OS',
  description: 'Local-first personal Career OS — evidence-backed career management',
};

const NAV_SECTIONS: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: 'Overview',
    items: [{ href: '/', label: 'Dashboard' }],
  },
  {
    title: 'Career',
    items: [
      { href: '/profile', label: 'Profile' },
      { href: '/evidence', label: 'Evidence' },
      { href: '/claims', label: 'Claims' },
    ],
  },
  {
    title: 'Opportunities',
    items: [{ href: '/jobs', label: 'Jobs' }],
  },
  {
    title: 'Applications',
    items: [
      { href: '/applications', label: 'Pipeline' },
      { href: '/contacts', label: 'Contacts' },
    ],
  },
  {
    title: 'Documents',
    items: [{ href: '/documents', label: 'CV Studio' }],
  },
  {
    title: 'Intelligence',
    items: [
      { href: '/analytics', label: 'Analytics' },
      { href: '/audit', label: 'Audit' },
    ],
  },
  {
    title: 'Automation',
    items: [{ href: '/automation', label: 'Automation' }],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="app-shell">
          <aside className="sidebar">
            <p className="brand">
              <span className="brand-dot" aria-hidden />
              CAREER OS
            </p>
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="nav-section">{section.title}</p>
                <nav>
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </aside>
          <div className="main-content">
            <nav className="topnav" aria-label="Mobile navigation">
              {NAV_SECTIONS.flatMap((section) => section.items).map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
