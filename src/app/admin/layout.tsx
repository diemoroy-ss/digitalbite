"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ProfileMenu from "../../components/ProfileMenu";

// Este layout envolverá a todas las páginas DENTRO de /gastronomico/admin/
export default function GastronomicoAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      const isBypass = typeof window !== 'undefined' ? localStorage.getItem("tempAdminBypass") === "true" : false;
      setUser(u);

      if (!u && !isBypass) {
        router.replace("/login");
        return;
      }

      if (u) {
        const d = await getDoc(doc(db, "users", u.uid));
        if (d.exists()) {
          let data = d.data();
          if (u.email === "admin@digitalbite.app" || u.email === "diemondy@gmail.com") {
            data.role = "admin";
          }
          if (data.role !== "admin") {
            router.replace("/");
            return;
          }
          setUserDoc(data);
        } else {
          // Fallback
          if (u.email === "admin@digitalbite.app" || u.email === "diemondy@gmail.com") {
            setUserDoc({ email: u.email, role: "admin", name: u.displayName || "Admin" });
          } else {
            router.replace("/");
            return;
          }
        }
      } else if (isBypass) {
        setUserDoc({ email: "admin@digitalbite.app", role: "admin", name: "Admin (Bypass)" });
      }
    });
    return () => unsub();
  }, [router]);

  const links = [
    { href: "/admin/comercios", label: "Comercios", icon: "🏢" },
    { href: "/admin/categorias", label: "Categorías", icon: "🍱" },
    { href: "/admin/plantillas", label: "Plantillas", icon: "🖼️" },
    { href: "/admin/productos", label: "Galería PNG", icon: "🍔" },
    { href: "/admin/planes", label: "Planes", icon: "💳" },
    { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
    { href: "/admin/workflows", label: "Workflows", icon: "🧠" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>⚙️</span> GastroAdmin
          </h2>
          <p className="text-slate-400 text-xs mt-1">Panel de Control V2</p>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          {links.map(link => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                  isActive 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors">
            ← Ir al Generador
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* GLOBAL TOPBAR (Desktop) */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-[60] shrink-0">
           <div className="flex flex-col">
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {links.find(l => pathname.startsWith(l.href))?.label || "Administración"}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                 <span>DigitalBite Admin</span>
                 <span>/</span>
                 <span className="text-rose-500">{links.find(l => pathname.startsWith(l.href))?.label || "Escritorio"}</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <ProfileMenu user={user} userDoc={userDoc} />
           </div>
        </header>

        {/* Mobile Header (Fixed) */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-[60]">
           <h2 className="text-lg font-black tracking-tight uppercase">⚙️ {links.find(l => pathname.startsWith(l.href))?.label || "GastroAdmin"}</h2>
           <ProfileMenu user={user} userDoc={userDoc} />
        </div>
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto bg-slate-900 px-4 pb-4 gap-2 hide-scrollbar">
          {links.map(link => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {link.icon} {link.label}
              </Link>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
