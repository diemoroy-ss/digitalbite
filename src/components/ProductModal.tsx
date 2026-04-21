import { useState } from "react";
import { db, storage } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface ProductImage {
  url: string;
  path: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  storagePath?: string;
  images?: ProductImage[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  dbCategories: any[];
  onSelect: (url: string) => void;
  refreshProducts: () => void;
  category: string | null;
}

export default function ProductModal({ isOpen, onClose, products, dbCategories, onSelect, refreshProducts, category }: ProductModalProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("todas");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const handleUploadToProduct = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProduct) return;

    setUploading(true);
    try {
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
          const newImage: ProductImage = { url: downloadURL, path: uploadTask.snapshot.ref.fullPath };
          
          let existingImages: ProductImage[] = [];
          if (selectedProduct.images && selectedProduct.images.length > 0) {
            existingImages = [...selectedProduct.images];
          } else if (selectedProduct.imageUrl) {
            existingImages = [{ url: selectedProduct.imageUrl, path: selectedProduct.storagePath || "" }];
          }
          
          existingImages.push(newImage);
          
          const coverUrl = existingImages[0].url;
          const coverPath = existingImages[0].path;

          await updateDoc(doc(db, "products", selectedProduct.id), {
            images: existingImages,
            imageUrl: coverUrl,
            storagePath: coverPath
          });
          
          const updatedProduct = { ...selectedProduct, images: existingImages, imageUrl: coverUrl, storagePath: coverPath };
          setSelectedProduct(updatedProduct);
          
          refreshProducts();
          onSelect(downloadURL); // auto-select the newly uploaded image
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

  // Imágenes del producto seleccionado
  let productImages: ProductImage[] = [];
  if (selectedProduct) {
     if (selectedProduct.images && selectedProduct.images.length > 0) {
         productImages = selectedProduct.images;
     } else if (selectedProduct.imageUrl) {
         productImages = [{ url: selectedProduct.imageUrl, path: selectedProduct.storagePath || "" }];
     }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200/50">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between text-slate-800 bg-[#fafafa]">
          {selectedProduct ? (
             <div className="flex items-center gap-4">
                <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all focus:outline-none">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div>
                  <h3 className="text-xl font-black">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Selecciona la variante que deseas insertar</p>
                </div>
             </div>
          ) : (
             <div>
               <h3 className="text-xl font-black">Librería de Productos</h3>
               <p className="text-sm text-slate-500 font-medium mt-0.5">Selecciona el producto y luego la variante de imagen.</p>
             </div>
          )}
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-800">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* CONTENIDO: PASO 1 (PRODUCTOS) o PASO 2 (IMÁGENES) */}
        {!selectedProduct ? (
           <>
               {/* Action Bar (Tabs) */}
               <div className="px-8 py-4 bg-white border-b border-slate-100 flex flex-col gap-4">
                 <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
                   <button 
                     onClick={() => setActiveTab("todas")}
                     className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "todas" ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                     Todas las Categorías
                   </button>
                   {dbCategories.map(cat => (
                     <button 
                       key={cat.id}
                       onClick={() => setActiveTab(cat.slug)}
                       className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeTab === cat.slug ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                       {cat.name}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Loading / Empty / Grid */}
               {products.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50/50">
                    <div className="text-5xl mb-4 opacity-50 grayscale drop-shadow-sm">🍔</div>
                    <p className="font-bold text-slate-500">No tienes productos en esta cuenta.</p>
                    <p className="text-xs mt-1">Crea productos desde el panel de administración.</p>
                  </div>
               ) : displayProducts.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50/50">
                    <p className="font-bold text-slate-500">No hay productos en esta categoría.</p>
                  </div>
               ) : (
                 <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                     {displayProducts.map((p) => {
                       const cover = p.imageUrl || (p.images && p.images[0]?.url) || "";
                       const count = p.images ? p.images.length : (p.imageUrl ? 1 : 0);
                       return (
                         <button
                           key={p.id}
                           type="button"
                           onClick={() => setSelectedProduct(p)}
                           className="group bg-white rounded-[24px] border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-xl transition-all flex flex-col shadow-sm text-left relative aspect-[4/5]"
                         >
                           <div className="bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-slate-50/50 flex-1 p-4 flex items-center justify-center relative overflow-hidden">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             {cover && <img src={cover} alt={p.name} className="w-full h-full object-contain relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />}
                             <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors z-0"></div>
                           </div>
                           <div className="p-4 bg-white flex flex-col justify-center border-t border-slate-50">
                             <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate w-full mb-1">{p.name}</h4>
                             <span className="text-[10px] text-slate-400 font-bold">{count} {count === 1 ? 'Variante' : 'Variantes'}</span>
                           </div>
                           <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm pointer-events-none">
                              {p.category}
                           </div>
                         </button>
                       )
                     })}
                   </div>
                 </div>
               )}
           </>
        ) : (
           <>
              <div className="px-8 py-4 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <p className="text-sm font-bold text-slate-600">Galería del Producto</p>
                 <label className="cursor-pointer">
                    <input type="file" accept="image/png" className="hidden" onChange={handleUploadToProduct} disabled={uploading} />
                    <div className={`px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-sm ${uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                      {uploading ? `⏳ Subiendo ${Math.round(progress)}%` : `+ Subir variante aquí`}
                    </div>
                 </label>
              </div>

              <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                 {productImages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                      <p className="font-bold">No hay imágenes en este producto.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                       {productImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onSelect(img.url)}
                            className="group bg-white rounded-[24px] border border-slate-200 overflow-hidden hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col shadow-sm text-center relative aspect-square"
                          >
                             <div className="bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-slate-50/50 w-full h-full p-4 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url} alt={`Variante ${idx+1}`} className="w-full h-full object-contain relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                             </div>
                             <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                                <span className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">Insertar</span>
                             </div>
                          </button>
                       ))}
                    </div>
                 )}
              </div>
           </>
        )}
      </div>

      {/* STYLE FOR SCROLLBAR */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
