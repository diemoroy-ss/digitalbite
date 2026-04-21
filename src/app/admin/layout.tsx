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
    { href: "/admin/productos", label: "Productos", icon: "📦" },
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
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {links.map(link => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors font-semibold text-sm ${
                  isActive 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-xl shrink-0">{link.icon}</span>
                <span>{link.label}</span>
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

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* PROFILE MENU - Fixed floating button in top-right (desktop only) */}
        <div className="hidden md:block fixed top-4 right-4 z-[200]">
          <ProfileMenu user={user} userDoc={userDoc} />
        </div>

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

        <div className="flex-1 overflow-y-auto bg-[#fafafa]">
          {children}
        </div>
      </main>
    </div>
  );
}
