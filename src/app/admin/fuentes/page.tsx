"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface CustomFont {
  id: string;
  name: string;
  url: string;
  storagePath: string;
}

export default function FuentesAdmin() {
  const [fonts, setFonts] = useState<CustomFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [externalUrl, setExternalUrl] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        fetchFonts();
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  const fetchFonts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "fonts"), orderBy("name", "asc"));
      const snap = await getDocs(q);
      const data: CustomFont[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as CustomFont));
      setFonts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name) {
      setErrorMsg("Por favor ingresa un nombre para la tipografía.");
      return;
    }

    try {
      setSaving(true);
      let targetUrl = "";
      let targetStoragePath = "";

      if (uploadMode === "file") {
        if (!file) {
          setErrorMsg("Selecciona un archivo válido (.ttf, .woff, .woff2).");
          setSaving(false);
          return;
        }
        const storageRef = ref(storage, `fonts/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        targetUrl = await getDownloadURL(uploadTask.ref);
        targetStoragePath = uploadTask.ref.fullPath;
      } else {
        if (!externalUrl) {
          setErrorMsg("Debes ingresar la URL externa de la tipografía.");
          setSaving(false);
          return;
        }
        targetUrl = externalUrl;
      }

      await addDoc(collection(db, "fonts"), {
        name,
        url: targetUrl,
        storagePath: targetStoragePath,
        createdAt: new Date()
      });

      setName("");
      setFile(null);
      setExternalUrl("");
      const el = document.getElementById("font-file") as HTMLInputElement;
      if (el) el.value = '';
      
      setShowSuccessModal(true);
      fetchFonts();
    } catch (e) {
      console.error(e);
      setErrorMsg("Error interno al intentar guardar la fuente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta fuente? Esto podría afectar las plantillas que la están usando.")) return;
    try {
      if (storagePath) {
        await deleteObject(ref(storage, storagePath)).catch(e => console.error("Could not delete from storage", e));
      }
      await deleteDoc(doc(db, "fonts", id));
      setFonts(fonts.filter(f => f.id !== id));
    } catch (e) {
      console.error(e); 
      setErrorMsg("Hubo un error al eliminar la fuente. Por favor, intenta de nuevo.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Fuentes</h1>
          <p className="text-slate-500 mt-1 text-sm">Sube tipografías personalizadas (.ttf, .woff) para usarlas en el generador.</p>
        </div>
        <Link href="/admin/plantillas" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">
           ← Volver a Plantillas
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span aria-hidden="true">🔤</span> Subir Nueva Fuente
            </h2>
            
            <form onSubmit={handleSave} className="space-y-5">
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nombre en el Menú</label>
                  <input type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Bebas Neue Pro" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-medium transition-all" />
               </div>
               
               <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button type="button" onClick={()=>setUploadMode("file")} className={`flex-1 text-xs py-2 rounded-md font-bold transition-all ${uploadMode === "file" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}>Subir Archivo</button>
                 <button type="button" onClick={()=>setUploadMode("url")} className={`flex-1 text-xs py-2 rounded-md font-bold transition-all ${uploadMode === "url" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}>URL Externa</button>
               </div>

               {uploadMode === "file" ? (
                 <div key="input-file">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Archivo (.ttf, .woff)</label>
                    <input id="font-file" type="file" required accept=".ttf,.woff,.woff2,.otf" onChange={e => { if(e.target.files) setFile(e.target.files[0])}}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                 </div>
               ) : (
                 <div key="input-url">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">URL de Google Fonts o CDN</label>
                    <input type="url" required value={externalUrl || ""} onChange={e=>setExternalUrl(e.target.value)} placeholder="Ej: https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-medium transition-all" />
                    <p className="text-[10px] text-slate-400 mt-1">Si usas Google Fonts, asegúrate de escribir el nombre exacto arriba.</p>
                   </div>
                )}

                {errorMsg && (
                   <div className="bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold p-3 rounded-lg text-center mt-2">
                     {errorMsg}
                   </div>
                )}

                <button type="submit" disabled={saving || (uploadMode === "file" ? !file : !externalUrl) || !name} className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4">
                   {saving ? 'Guardando...' : 'Guardar Fuente'}
                </button>
            </form>
          </div>
        </div>

        {/* Lista de Fuentes */}
        <div className="md:col-span-2 space-y-4">
           {fonts.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
               <span className="text-4xl block mb-4 grayscale opacity-50" aria-hidden="true">🔤</span>
               <h3 className="text-lg font-bold text-slate-700 mb-1">No hay fuentes personalizadas</h3>
               <p className="text-sm text-slate-500">Sube tu primer archivo fuente a la izquierda.</p>
             </div>
           ) : (
             fonts.map(font => (
               <div key={font.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center text-xl font-bold uppercase shadow-inner" style={{ fontFamily: `"${font.name}", sans-serif` }}>
                     {font.name.charAt(0)}
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800">{font.name}</h3>
                     <a href={font.url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 hover:underline">Ver archivo original</a>
                   </div>
                 </div>
                 
                 <div className="flex gap-2">
                   {/* Inyectamos estilo localmente para visualizarla */}
                   <style>{font.url.includes("fonts.googleapis.com") ? `@import url('${font.url}');` : `
                     @font-face {
                       font-family: "${font.name}";
                       src: url(${font.url});
                     }
                   `}</style>
                   <div className="hidden md:flex items-center justify-center px-4 py-1 bg-slate-50 rounded-lg border border-slate-100 mr-4">
                     <span style={{ fontFamily: `"${font.name}", sans-serif` }} className="text-lg text-slate-700">texto de Prueba 1234</span>
                   </div>
                   <button onClick={() => handleDelete(font.id, font.storagePath)} className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors">
                     <span aria-hidden="true">🗑️</span>
                   </button>
                 </div>
               </div>
             ))
           )}
         </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[24px] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <span aria-hidden="true">✨</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">¡Fuente Agregada!</h3>
            <p className="text-slate-500 text-sm mb-6">La tipografía se guardó correctamente y ya está lista en el generador.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md">
               ¡Genial!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
