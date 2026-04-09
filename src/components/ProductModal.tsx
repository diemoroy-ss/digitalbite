import { useState } from "react";
import { db, storage } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  dbCategories: any[];
  onSelect: (url: string) => void;
  refreshProducts: () => void;
  category: string | null;
}

export default function ProductModal({ isOpen, onClose, products, dbCategories, onSelect, refreshProducts, category }: ProductModalProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("todas");

  // We reset tab when modal opens
  if (!isOpen) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Usar la pestaña activa (si no es 'todas'), luego categoría base, fallback a 'burger'
      const uploadCat = activeTab !== 'todas' ? activeTab : ((category && category !== 'general') ? category : 'burger');
      
      const fileName = `products/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          console.error("Error al subir:", error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "products"), {
            name: file.name.split('.')[0] || "Nuevo Producto", // Nombre temporal basado en el archivo
            category: uploadCat,
            imageUrl: downloadURL,
            createdAt: serverTimestamp()
          });
          refreshProducts();
          onSelect(downloadURL); // auto-select
          setUploading(false);
          setProgress(0);
        }
      );
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  // Filtrar productos por la pestaña activa
  const displayProducts = products.filter(p => activeTab === 'todas' || p.category === activeTab);

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200/50">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between text-slate-800 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black">Mis Productos</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Selecciona o sube imágenes en formato PNG con fondo transparente.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-800">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Action Bar (Upload & Tabs) */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer relative overflow-hidden group">
              <input type="file" accept="image/png" className="hidden" onChange={handleUpload} disabled={uploading} />
              <div className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'}`}>
                {uploading ? (
                  <>⏳ Subiendo {Math.round(progress)}%</>
                ) : (
                  <>☁️ Subir nuevo producto</>
                )}
              </div>
            </label>
            <span className="text-xs text-slate-400 font-medium">Recomendado: Imágenes cuadradas PNG.</span>
          </div>

          {/* Filtros por Categoría de la Base de Datos */}
          <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
            <button 
              onClick={() => setActiveTab("todas")}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === "todas" ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              Todas
            </button>
            {dbCategories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveTab(cat.slug)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${activeTab === cat.slug ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {products.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
             <div className="text-4xl mb-4 opacity-50">🍔</div>
             <p className="font-medium text-sm">No tienes productos disponibles aquí aún.</p>
             <p className="text-xs mt-1">Sube uno nuevo con el botón de arriba.</p>
           </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayProducts.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelect(m.imageUrl)}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
                >
                  <div className="bg-slate-50/50 aspect-square p-3 flex items-center justify-center relative">
                    {/* Checkerboard bg */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), repeating-linear-gradient(45deg, #cbd5e1 25%, #f8fafc 25%, #f8fafc 75%, #cbd5e1 75%, #cbd5e1)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.imageUrl} alt={m.name} className="w-full h-full object-contain relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="p-2.5 bg-white flex-1 flex items-center justify-center w-full">
                    <p className="text-[10px] font-bold text-slate-700 text-center uppercase tracking-wider truncate w-full">{m.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
