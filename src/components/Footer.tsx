import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm bg-[#030712] relative z-20">
      <p className="tracking-[0.2em] uppercase text-[10px] font-bold">© 2026 Santisoft.cl — Santiago, Chile</p>
      <div className="flex justify-center gap-6 mt-6">
        <Link href="/privacy" className="hover:text-white transition">Privacidad</Link>
        <Link href="/terms" className="hover:text-white transition">Términos</Link>
      </div>
    </footer>
  );
}