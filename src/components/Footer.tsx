"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on paths that have their own footer
  if (pathname === '/' || pathname?.startsWith('/admin') || pathname === '/demo') return null;

  return (
    <footer style={{ borderTop: '0.5px solid rgba(240,237,230,0.08)', padding: '28px 0 24px', background: '#0E0D0B' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 18, color: '#F0EDE6', letterSpacing: '-0.02em' }}>
          Digital<span style={{ color: '#C8F060' }}>Bite</span>
        </span>

        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/privacy" style={{ fontSize: 13, color: 'rgba(240,237,230,0.28)', textDecoration: 'none' }}>Privacidad</Link>
          <Link href="/terms"   style={{ fontSize: 13, color: 'rgba(240,237,230,0.28)', textDecoration: 'none' }}>Términos</Link>
        </div>

        <span style={{ fontSize: 12, color: 'rgba(240,237,230,0.28)' }}>
          © {new Date().getFullYear()} DigitalBite App.
        </span>
      </div>
    </footer>
  );
}