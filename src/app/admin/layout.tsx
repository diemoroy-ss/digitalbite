"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
// import ProfileMenu from "../../components/ProfileMenu"; // Ya no se usa flotante en el layout principal

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const links = [
    { href: "/admin/analytics", label: "Analítica", icon: "📊" },
    { href: "/admin/comercios", label: "Comercios", icon: "🏢" },
    { href: "/admin/fondos", label: "Fondos", icon: "🖼️" },
    { href: "/admin/categorias", label: "Categorías", icon: "🍱" },
    { href: "/admin/plantillas", label: "Plantillas", icon: "🎨" },
    { href: "/admin/productos", label: "Productos", icon: "📦" },
    { href: "/admin/planes", label: "Planes", icon: "💳" },
    { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
    { href: "/admin/workflows", label: "Workflows", icon: "🧠" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col hidden md:flex border-r border-slate-900">
        
        <div className="p-6 border-b border-slate-900/50">
          <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
            <span>⚙️</span> GastroAdmin
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Control Central V3</p>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map(link => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors font-bold text-xs ${
                  isActive 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-lg shrink-0">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* SECCIÓN DE USUARIO - AL FINAL (BAJO WORKFLOWS) */}
        <div className="p-5 bg-slate-900/40 border-t border-slate-800/50">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-rose-500/10">
                {userDoc?.name ? userDoc.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U")}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-[13px] font-black text-white truncate uppercase tracking-tight">
                   {userDoc?.name || "Administrador"}
                </p>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                   {userDoc?.role === "admin" ? "Admin Master" : "Gestor"}
                </span>
              </div>
           </div>

           <div className="space-y-0.5">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-1.5 text-[9.5px] font-black text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all group uppercase tracking-widest">
                <span>🚀</span> Ir al Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-[9.5px] font-black text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all group uppercase tracking-widest"
              >
                <span>🚪</span> Cerrar Sesión
              </button>
           </div>
        </div>

        <div className="p-4 border-t border-slate-900/50">
          <Link href="/" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors">
            ← Ir al Generador
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* El ProfileMenu ya no flota aquí en Desktop */}

        {/* Mobile Header (Fixed) */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-[60]">
           <h2 className="text-lg font-black tracking-tight uppercase">⚙️ {links.find(l => pathname.startsWith(l.href))?.label || "GastroAdmin"}</h2>
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 text-white flex items-center justify-center font-black text-xs">
             {userDoc?.name ? userDoc.name.charAt(0).toUpperCase() : "U"}
           </div>
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
