"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileMenu from "../../components/ProfileMenu";

interface Perfil {
  name: string;
  email: string;
  plan: string;
  role: string;
  categoriesAllowed: string[];
  rutFacturacion?: string;
  razonSocial?: string;
  giro?: string;
  direccion?: string;
  whatsapp?: string;
  contactoEmail?: string;
  sitioWeb?: string;
  facebook?: string;
  instagram?: string;
}

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [rut, setRut] = useState("");
  const [razon, setRazon] = useState("");
  const [giro, setGiro] = useState("");
  const [direccion, setDireccion] = useState("");
  
  // Campos Contacto Video
  const [whatsapp, setWhatsapp] = useState("");
  const [contactoEmail, setContactoEmail] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");

   useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
         try {
           const d = await getDoc(doc(db, "users", user.uid));
           if (d.exists()) {
              const data = d.data() as Perfil;
              if (user.email === "admin@digitalbite.app" || user.email === "diemondy@gmail.com") {
                 data.role = "admin";
              }
              setPerfil(data);
              setRut(data.rutFacturacion || "");
              setRazon(data.razonSocial || "");
              setGiro(data.giro || "");
              setDireccion(data.direccion || "");
              setWhatsapp(data.whatsapp || "");
              setContactoEmail(data.contactoEmail || "");
              setSitioWeb(data.sitioWeb || "");
              setFacebook(data.facebook || "");
              setInstagram(data.instagram || "");
           } else {
             // Si el doc no existe (login fallido de primer uso, etc), creamos perfil en memoria
              setPerfil({
                name: user.displayName || "Usuario",
                email: user.email || "",
                role: (user.email === "admin@digitalbite.app" || user.email === "diemondy@gmail.com") ? "admin" : "user",
                plan: "Free",
                categoriesAllowed: ["all"]
              });
           }
         } catch(e) { console.error(e); }
         finally { setLoading(false); }
      } else {
         router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  const isAdmin = perfil?.role === "admin" || auth.currentUser?.email === "admin@digitalbite.app" || auth.currentUser?.email === "diemondy@gmail.com";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        rutFacturacion: rut,
        razonSocial: razon,
        giro: giro,
        direccion: direccion,
        whatsapp: whatsapp,
        contactoEmail: contactoEmail,
        sitioWeb: sitioWeb,
        facebook: facebook,
        instagram: instagram
      });
      alert("Datos guardados.");
    } catch(e) {
      console.error(e); alert("Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (!perfil) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Cuenta</h1>
             <p className="text-slate-500 mt-1">Revisa tu plan activo y actualiza tus datos de facturación.</p>
           </div>
           <div className="flex items-center gap-3">
             <Link href="/" className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors shadow-sm">
                <span>←</span> Ir al Generador
             </Link>
             <ProfileMenu user={auth.currentUser} userDoc={perfil} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           
           {/* Info Plan & Access */}
           <div className="md:col-span-1 space-y-6">
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                 <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-black text-2xl flex items-center justify-center mb-4 uppercase">
                    {perfil.name ? perfil.name.charAt(0) : '@'}
                 </div>
                 <h2 className="text-xl font-bold text-slate-800">{perfil.name}</h2>
                 <p className="text-slate-500 text-sm mb-6">{perfil.email}</p>

                 <div className="pt-6 border-t border-slate-100">
                    <div className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Plan Activo</div>
                    <div className="text-lg font-black text-slate-800">{perfil.plan}</div>
                    <div className="mt-2 text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-1 inline-block rounded-md">{perfil.role}</div>
                 </div>
              </div>

              <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-lg shadow-indigo-900/20">
                 <h3 className="text-sm font-bold opacity-80 mb-4 uppercase tracking-widest">Acceso a Plantillas</h3>
                 {perfil.categoriesAllowed?.includes("all") ? (
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="text-3xl">🌌</div>
                          <div>
                            <div className="font-bold relative text-base">
                              Acceso Total
                            </div>
                            <div className="text-xs opacity-70 mt-1">Puedes generar de todo.</div>
                          </div>
                       </div>
                       <Link href={isAdmin ? "/admin/plantillas" : "/tus-plantillas"} className="block w-full text-center py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all">
                          {isAdmin ? 'Ir al Administrador' : 'Ver tus Plantillas'} →
                       </Link>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div>
                          <div className="text-2xl font-black">{perfil.categoriesAllowed?.length || 0}</div>
                          <div className="text-xs opacity-70 mt-1">Categorías de menú contratadas.</div>
                          <div className="flex gap-1 mt-3 flex-wrap">
                             {perfil.categoriesAllowed?.map(c => (
                               <span key={c} className="text-[10px] uppercase font-bold bg-white/20 px-2 py-1 rounded-md">{c}</span>
                             ))}
                          </div>
                       </div>
                       <Link href="/tus-plantillas" className="block w-full text-center py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all">
                          Ver tus Plantillas →
                       </Link>
                    </div>
                 )}
              </div>

           </div>

           {/* Facturacion Settings */}
           <div className="md:col-span-2">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                 <h2 className="text-lg font-bold text-slate-800 mb-6">Mis Datos</h2>
                 
                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-5">
                       <h3 className="text-[12px] font-black uppercase text-indigo-500 tracking-widest border-b border-indigo-100 pb-2">Información de Contacto & Redes</h3>
                       <p className="text-xs text-slate-500 mb-2">Usaremos estos datos para enviarte los videos generados o compartirlos con n8n.</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tu WhatsApp</label>
                            <input type="tel" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+56 9 XXXXXXXX" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Principal</label>
                            <input type="email" value={contactoEmail} onChange={e=>setContactoEmail(e.target.value)} placeholder="tu@correo.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                          </div>
                          <div className="md:col-span-2">
                             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sitio Web</label>
                             <input type="url" value={sitioWeb} onChange={e=>setSitioWeb(e.target.value)} placeholder="https://misitio.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Instagram</label>
                            <input type="text" value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="@tuRestaurante" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Facebook</label>
                            <input type="text" value={facebook} onChange={e=>setFacebook(e.target.value)} placeholder="/tuRestaurante" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-5 pt-4">
                       <h3 className="text-[12px] font-black uppercase text-indigo-500 tracking-widest border-b border-indigo-100 pb-2">Datos de Facturación (Chile)</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">RUT EMPRESA</label>
                            <input type="text" value={rut} onChange={e=>setRut(e.target.value)} placeholder="Ej: 76.123.456-7" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">RAZÓN SOCIAL</label>
                            <input type="text" value={razon} onChange={e=>setRazon(e.target.value)} placeholder="Ej: DigitalBite SpA" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                          </div>
                       </div>
   
                       <div>
                         <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">GIRO COMERCIAL</label>
                         <input type="text" value={giro} onChange={e=>setGiro(e.target.value)} placeholder="Software / Restaurantes" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
   
                       <div>
                         <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">DIRECCIÓN TRIBUTARIA</label>
                         <input type="text" value={direccion} onChange={e=>setDireccion(e.target.value)} placeholder="Av. Principal 123, Of 40. Pucón" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                       <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20">
                         {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}
