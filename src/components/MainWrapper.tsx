"use client";

import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGastronomico = pathname?.startsWith('/gastronomico') || pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/dashboard');
  
  return (
    <main className={`flex-grow ${isGastronomico ? '' : 'pt-[104px] md:pt-[118px]'}`}>
      {children}
    </main>
  );
}
