"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/' || pathname?.startsWith('/admin') || pathname === '/demo') return null;

  return (
    <footer className="py-10 text-center relative z-20" style={{
      borderTop: '0.5px solid #e5e3de',
      background: '#ffffff'
    }}>
      <p className="font-display text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: '#9e9b95' }}>
        © 2026 DigitalBite.app — El editor inteligente
      </p>
      <div className="flex justify-center gap-8 mt-5">
        <Link href="/privacy" className="text-[13px] transition-colors" style={{ color: '#9e9b95' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#1a1916'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#9e9b95'; }}>Privacidad</Link>
        <Link href="/terms"   className="text-[13px] transition-colors" style={{ color: '#9e9b95' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#1a1916'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#9e9b95'; }}>Términos</Link>
      </div>
    </footer>
  );
}