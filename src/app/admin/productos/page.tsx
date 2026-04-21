"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import Image from "next/image";

interface ProductImage {
  url: string;
  path: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  comercioId?: string;
  storagePath?: string;
  images?: ProductImage[];
  createdAt: any;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  comercioId?: string;
}

interface Comercio {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

export default function ProductosAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterComercio, setFilterComercio] = useState("todos");
  const [activeDashboardCat, setActiveDashboardCat] = useState("todos");
  
  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, product: Product | null}>({isOpen: false, product: null});
  
  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [comercioId, setComercioId] = useState("gastronomico");
  
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchProducts(), fetchComercios()]);
    setLoading(false);
  };

  const fetchComercios = async () => {
    const q = query(collection(db, "comercios"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    const data: Comercio[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Comercio));
    setComercios(data);
  };

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "categories"), orderBy("name", "asc"));
      const snap = await getDocs(q);
      const data: Category[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Category));
      
      if (!data.find(c => c.slug === "general")) data.push({ id: "general-hard", slug: "general", name: "General" });
      if (!data.find(c => c.slug === "precio")) data.push({ id: "precio-hard", slug: "precio", name: "Etiquetas de Precio" });
      if (!data.find(c => c.slug === "linea")) data.push({ id: "linea-hard", slug: "linea", name: "Líneas Decorativas" });
      
      setDbCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: Product[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(f => f.type.includes("png"));
      
      if (validFiles.length !== selectedFiles.length) {
        alert("Por favor, sube solo imágenes PNG con transparencia.");
      }

      setFiles(prev => [...prev, ...validFiles]);
      const newUrls = validFiles.map(f => URL.createObjectURL(f));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
    // reset input value so you can select again
    e.target.value = "";
  };

  const removeNewFile = (idx: number) => {
    const newFiles = [...files];
    const newUrls = [...previewUrls];
    newFiles.splice(idx, 1);
    newUrls.splice(idx, 1);
    setFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setCategory(activeDashboardCat !== "todos" ? activeDashboardCat : "general");
    setComercioId(filterComercio !== "todos" ? filterComercio : "gastronomico");
    setFiles([]);
    setPreviewUrls([]);
    setExistingImages([]);
  };

  const openCreateDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setComercioId(product.comercioId || "gastronomico");
    
    // Normalize existing images
    let exist: ProductImage[] = [];
    if (product.images && product.images.length > 0) {
      exist = [...product.images];
    } else if (product.imageUrl) {
      exist = [{ url: product.imageUrl, path: product.storagePath || "" }];
    }
    setExistingImages(exist);
    setFiles([]);
    setPreviewUrls([]);
    setIsDrawerOpen(true);
  };

  const removeExistingImage = async (img: ProductImage) => {
    if (!editingProduct) return;
    try {
      if (img.path) {
        const fileRef = ref(storage, img.path);
        await deleteObject(fileRef).catch(e => console.log(e));
      }
      
      const newImages = existingImages.filter(i => i.url !== img.url);
      setExistingImages(newImages);
      
      const coverUrl = newImages.length > 0 ? newImages[0].url : "";
      const coverPath = newImages.length > 0 ? newImages[0].path : "";
      await updateDoc(doc(db, "products", editingProduct.id), {
        images: newImages,
        imageUrl: coverUrl,
        storagePath: coverPath
      });
      await fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (existingImages.length === 0 && files.length === 0)) return;

    try {
      setUploading(true);
      
      const newUploaded: ProductImage[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (f) => {
          const storageRef = ref(storage, `products/${Date.now()}_${f.name}`);
          const uploadTask = await uploadBytesResumable(storageRef, f);
          const url = await getDownloadURL(uploadTask.ref);
          newUploaded.push({ url, path: uploadTask.ref.fullPath });
        });
        await Promise.all(uploadPromises);
      }

      const finalImages = [...existingImages, ...newUploaded];
      const coverUrl = finalImages.length > 0 ? finalImages[0].url : "";
      const coverPath = finalImages.length > 0 ? finalImages[0].path : "";

      const productData = {
        name,
        category,
        comercioId,
        imageUrl: coverUrl,
        storagePath: coverPath,
        images: finalImages,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }

      setIsDrawerOpen(false);
      await fetchProducts();

    } catch (error) {
      console.error("Error saving product:", error);
      alert("Hubo un error al procesar.");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;
    const prod = deleteModal.product;
    setUploading(true);
    try {
      await deleteDoc(doc(db, "products", prod.id));
      
      // Delete all associated files
      const pathsToDelete: string[] = [];
      if (prod.images) {
        prod.images.forEach(img => { if (img.path) pathsToDelete.push(img.path); });
      } else if (prod.storagePath) {
        pathsToDelete.push(prod.storagePath);
      }

      const uniquePaths = Array.from(new Set(pathsToDelete));
      const deletePromises = uniquePaths.map(p => {
        const fileRef = ref(storage, p);
        return deleteObject(fileRef).catch(e => console.log("File not in storage", e));
      });
      await Promise.all(deletePromises);
      
      setProducts(products.filter(p => p.id !== prod.id));
      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error al eliminar.");
    } finally {
      setUploading(false);
    }
  };

  // Filters logic
  const filteredProducts = products.filter(p => {
    const matchesComercio = filterComercio === "todos" || (p.comercioId || "gastronomico") === filterComercio;
    const matchesCategory = activeDashboardCat === "todos" || p.category === activeDashboardCat;
    return matchesComercio && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-x-hidden">
      
      {/* HEADER SECTION (Stepper & Breadcrumbs) */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 p-1 rounded-2xl overflow-hidden border border-slate-200">
               <button 
                 onClick={() => { setFilterComercio("todos"); setActiveDashboardCat("todos"); }}
                 className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${filterComercio === 'todos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Todos
               </button>
               {comercios.map(c => (
                 <button 
                   key={c.id}
                   onClick={() => { setFilterComercio(c.slug); setActiveDashboardCat("todos"); }}
                   className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${filterComercio === c.slug ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   <span>{c.icon || "🏢"}</span> {c.name}
                 </button>
               ))}
             </div>

             <button 
               onClick={openCreateDrawer}
               className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
             >
               <span>+</span> Nuevo Producto
             </button>
          </div>
        </div>
        
        {/* Category Stepper Sub-Bar */}
        {filterComercio !== "todos" && (
           <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
             <button
                onClick={() => setActiveDashboardCat("todos")}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeDashboardCat === 'todos' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
             >
                Ver Todo
             </button>
             {dbCategories
               .filter(cat => (cat.comercioId || "gastronomico") === filterComercio || cat.slug === "general" || cat.slug === "precio" || cat.slug === "linea")
               .map(cat => (
                 <button
                   key={cat.id}
                   onClick={() => setActiveDashboardCat(cat.slug)}
                   className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeDashboardCat === cat.slug ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                 >
                   {cat.name}
                   <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeDashboardCat === cat.slug ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                     {products.filter(p => p.category === cat.slug && (p.comercioId || "gastronomico") === filterComercio).length}
                   </span>
                 </button>
               ))}
           </div>
        )}
      </div>

      {/* MAIN GRID CONTENT */}
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Cargando Productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-5xl opacity-40 grayscale">📦</div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Sin productos encontrados</h3>
             <p className="text-slate-500 max-w-sm mb-8">No tenemos productos para esta combinación de filtros. ¡Sé el primero en crear uno y subir PNGs transparentes!</p>
             <button onClick={openCreateDrawer} className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all">
               Crear mi primer Producto
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {filteredProducts.map(product => {
               const imagesCount = product.images ? product.images.length : (product.imageUrl ? 1 : 0);
               return (
                 <div key={product.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col relative aspect-[4/5]">
                   
                   {/* Transparency Pattern Background */}
                   <div className="flex-1 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-slate-50/50 p-6 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative w-full h-full">
                         {product.imageUrl && (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                              unoptimized
                            />
                         )}
                      </div>
                   </div>

                   {/* Info Bar */}
                   <div className="bg-white p-4 pt-1 border-t border-slate-50 text-center relative z-10">
                      <h3 className="font-black text-slate-800 text-xs truncate mb-2 uppercase tracking-tight">{product.name}</h3>
                      <div className="flex gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                         <button 
                           onClick={() => openEditDrawer(product)}
                           className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                         >
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                         </button>
                         <button 
                           onClick={() => setDeleteModal({isOpen: true, product})}
                           className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                         >
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                         </button>
                      </div>
                   </div>

                   {/* Badges */}
                   <div className="absolute top-3 left-3 flex flex-col gap-1 z-20 pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black border border-slate-100 shadow-sm text-slate-400 uppercase tracking-widest">
                         {product.category}
                      </div>
                      {imagesCount > 0 && (
                         <div className="bg-indigo-500/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black border border-indigo-400 shadow-sm text-white uppercase tracking-widest w-max">
                            {imagesCount} {imagesCount === 1 ? 'img' : 'imgs'}
                         </div>
                      )}
                   </div>
                 </div>
               )
            })}
          </div>
        )}
      </div>

      {/* DRAWER COMPONENT (MODAL RIGHT) */}
      {isDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-300" 
            onClick={() => setIsDrawerOpen(false)}
          />
          
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#fafafa]">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingProduct ? 'Editar Producto' : 'Crear Producto'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración y Galería</p>
               </div>
               <button 
                 onClick={() => setIsDrawerOpen(false)}
                 className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors"
               >
                 ✕
               </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
               
               <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">1</div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Información General</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre Comercial</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Burger Monster XL"
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Comercio</label>
                       <select
                         value={comercioId}
                         onChange={(e) => setComercioId(e.target.value)}
                         className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm"
                       >
                         {comercios.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
                       <select
                         value={category}
                         onChange={(e) => setCategory(e.target.value)}
                         className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm"
                       >
                         {dbCategories
                           .filter(cat => (cat.comercioId || "gastronomico") === comercioId || cat.slug === "general" || cat.slug === "precio" || cat.slug === "linea")
                           .map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)
                         }
                       </select>
                     </div>
                  </div>
               </div>

               <section className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">2</div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Galería de PNGs ({existingImages.length + files.length})</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                     {/* Existing Images */}
                     {existingImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden group">
                           <img src={img.url} className="w-full h-full object-contain p-2" alt="Product" />
                           <button type="button" onClick={() => removeExistingImage(img)} className="absolute top-1 right-1 w-6 h-6 bg-white/90 text-rose-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition-all font-bold">×</button>
                        </div>
                     ))}
                     
                     {/* Newly Added Files Preview */}
                     {previewUrls.map((url, idx) => (
                        <div key={'new-'+idx} className="relative aspect-square bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden group">
                           <img src={url} className="w-full h-full object-contain p-2" alt="Preview" />
                           <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 w-6 h-6 bg-white/90 text-rose-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition-all font-bold">×</button>
                           <div className="absolute bottom-1 right-1 bg-indigo-500 text-white text-[8px] px-1 rounded font-bold uppercase pointer-events-none">Nuevo</div>
                        </div>
                     ))}
                     
                     {/* Upload Button */}
                     <label className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                        <span className="text-2xl text-slate-300">📤</span>
                        <span className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">Añadir más</span>
                        <input type="file" className="hidden" accept="image/png" multiple onChange={handleMultipleFileChange} />
                     </label>
                  </div>
               </section>

               <div className="mt-auto pt-6">
                 <button
                   type="submit"
                   disabled={uploading || !name || (existingImages.length === 0 && files.length === 0)}
                   className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   {uploading ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Guardando Producto...</span>
                     </>
                   ) : (
                     <>
                       <span className="text-xl leading-none">✨</span>
                       <span>Guardar Cambios</span>
                     </>
                   )}
                 </button>
               </div>
            </form>
          </div>
        </>
      )}

      {/* CUSTOM DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⚠️</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Cuidado</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                 ¿Estás seguro de que quieres eliminar el producto <strong className="text-slate-700">{deleteModal.product?.name}</strong>? Se borrarán **todas** sus imágenes de forma permanente.
              </p>
              
              <div className="flex flex-col gap-3">
                 <button onClick={confirmDelete} disabled={uploading} className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50">
                    {uploading ? "Eliminando..." : "Sí, eliminar definitivamente"}
                 </button>
                 <button onClick={() => setDeleteModal({isOpen: false, product: null})} disabled={uploading} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl transition-all">
                    Cancelar
                 </button>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
