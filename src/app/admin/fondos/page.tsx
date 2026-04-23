'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '../../../lib/firebase';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
  serverTimestamp, query, orderBy, where 
} from 'firebase/firestore';
import { useAlertStore } from '../../../store/useAlertStore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import Image from 'next/image';

interface Background {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  format: 'tv_v' | 'post' | 'tv_h';
  createdAt: any;
}

const FORMATS = [
  { id: 'tv_v', label: '📱 Vertical / Story', icon: '📱' },
  { id: 'post', label: '⏹️ Cuadrado / Post', icon: '⏹️' },
  { id: 'tv_h', label: '📺 Horizontal / TV', icon: '📺' }
];

export default function FondosAdmin() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterFormat, setFilterFormat] = useState('todos');

  // Form State
  const [name, setName] = useState('');
  const [format, setFormat] = useState<'tv_v' | 'post' | 'tv_h'>('tv_v');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'backgrounds'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data: Background[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Background));
      setBackgrounds(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      useAlertStore.getState().openAlert('Completa el nombre.', 'warning');
      return;
    }

    if (editId) {
      // MODO EDICIÓN (Solo nombre y formato si se desea, pero usualmente solo nombre)
      try {
        setSaving(true);
        await updateDoc(doc(db, 'backgrounds', editId), { name, format });
        resetForm();
        setIsDrawerOpen(false);
        fetchBackgrounds();
      } catch (e) {
        console.error(e);
        useAlertStore.getState().openAlert('Error al actualizar.', 'error');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!file) {
      useAlertStore.getState().openAlert('Selecciona un archivo.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const storageRef = ref(storage, `backgrounds/${format}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => { throw error; },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'backgrounds'), {
            name,
            url,
            storagePath: uploadTask.snapshot.ref.fullPath,
            format,
            createdAt: serverTimestamp()
          });
          resetForm();
          setIsDrawerOpen(false);
          fetchBackgrounds();
        }
      );
    } catch (e) {
      console.error(e);
      alert('Error al subir el fondo.');
      setSaving(false);
    }
  };

  const editItem = (bg: Background) => {
    setEditId(bg.id);
    setName(bg.name);
    setFormat(bg.format);
    setFile(null);
    setIsDrawerOpen(true);
  };

  const deleteItem = async (bg: Background) => {
    // 1. Check if used in templates
    try {
      const qTemplates = query(collection(db, 'templates'));
      const snap = await getDocs(qTemplates);
      let isUsed = false;
      snap.forEach(d => {
        const t = d.data();
        if (t.imageUrlVertical === bg.url || t.imageUrlPost === bg.url || t.imageUrlHorizontal === bg.url) {
          isUsed = true;
        }
      });

      if (isUsed) {
        useAlertStore.getState().openConfirm({
          message: '⚠️ Este fondo está siendo usado en una o más plantillas activas. Si lo borras, las plantillas perderán su imagen base. ¿Deseas proceder de todos modos?',
          type: 'warning',
          confirmText: 'Sí, eliminar',
          onConfirm: async () => {
             await executeDeleteBackground(bg);
          }
        });
      } else {
        useAlertStore.getState().openConfirm({
           message: `¿Eliminar el fondo "${bg.name}"?`,
           type: 'warning',
           confirmText: 'Eliminar',
           onConfirm: async () => {
              await executeDeleteBackground(bg);
           }
        });
      }
    } catch (e) {
      console.error(e);
      useAlertStore.getState().openAlert('Error al acceder a los datos.', 'error');
    }
  };

  const executeDeleteBackground = async (bg: Background) => {
    try {
      await deleteDoc(doc(db, 'backgrounds', bg.id));
      await deleteObject(ref(storage, bg.storagePath)).catch(e => console.warn('File already deleted', e));
      setBackgrounds(prev => prev.filter(b => b.id !== bg.id));
      useAlertStore.getState().openAlert('Fondo eliminado correctamente.', 'success');
    } catch (e) {
      console.error(e);
      useAlertStore.getState().openAlert('Error al eliminar.', 'error');
    }
  };

  const resetForm = () => {
    setName('');
    setEditId(null);
    setFile(null);
    setFormat('tv_v');
    setUploadProgress(0);
    const input = document.getElementById('bg-file') as HTMLInputElement;
    if (input) input.value = '';
  };

  const filtered = backgrounds.filter(b => filterFormat === 'todos' || b.format === filterFormat);

  return (
    <div className="min-h-screen bg-[#fafafa] animate-in fade-in duration-500">
      
      {/* HEADER PRINCIPAL CON BOTÓN DE CREACIÓN */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Librería de Fondos</h1>
          <p className="text-slate-500 font-medium">Gestiona y sube activos visuales base para tus plantillas.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsDrawerOpen(true); }}
          className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 group"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span> 
          <span>SUBIR NUEVO FONDO</span>
        </button>
      </div>

      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur-md border-y border-slate-200 sticky top-0 z-30 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Filtrar por Formato</span>
              <select 
                value={filterFormat} 
                onChange={(e) => setFilterFormat(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-rose-300 transition-all min-w-[220px] shadow-sm appearance-none cursor-pointer"
              >
                <option value="todos">🎂 Todos los Formatos</option>
                {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cargando librería...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center flex flex-col items-center justify-center">
             <span className="text-6xl mb-6">🖼️</span>
             <h3 className="text-xl font-black text-slate-800 mb-2">No hay fondos en esta categoría</h3>
             <p className="text-slate-400 text-sm max-w-sm">Empieza subiendo bases originales para que luego puedas crear plantillas sobre ellas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((bg) => (
              <div key={bg.id} className="group bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col relative">
                <div className={`relative w-full overflow-hidden bg-slate-100 ${bg.format === 'tv_h' ? 'aspect-[16/9]' : bg.format === 'post' ? 'aspect-square' : 'aspect-[9/16]'}`}>
                  <Image src={bg.url} alt={bg.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button 
                      onClick={() => editItem(bg)}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-indigo-600 flex items-center justify-center shadow-lg hover:bg-indigo-600 hover:text-white transition-all"
                      title="Editar nombre"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button 
                      onClick={() => deleteItem(bg)}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-rose-500 flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white transition-all"
                      title="Eliminar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2 block">
                    {FORMATS.find(f => f.id === bg.format)?.label}
                  </span>
                  <h3 className="font-black text-slate-800 text-lg leading-tight truncate" title={bg.name}>{bg.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Drawer */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-100 bg-[#fafafa] flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editId ? 'Editar Fondo' : 'Nuevo Fondo'}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {editId ? 'Actualización de metadatos' : 'Carga de activo original'}
                </p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSave} className="flex-1 p-8 space-y-8 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre del Fondo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Restaurant Abstract Dark"
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Formato Destinado</label>
                  <div className="grid grid-cols-1 gap-2">
                    {FORMATS.map(f => (
                      <button 
                        key={f.id}
                        type="button"
                        onClick={() => setFormat(f.id as any)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${format === f.id ? 'bg-slate-900 border-slate-900 text-white shadow-lg translate-x-1' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{f.icon}</span>
                          <span className="font-black text-sm">{f.label}</span>
                        </div>
                        {format === f.id && <span className="w-2 h-2 rounded-full bg-[#C8F060]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {!editId && (
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Seleccionar Imagen</label>
                    <div className="relative group">
                      <input 
                        id="bg-file"
                        type="file" 
                        accept="image/*"
                        onChange={(e) => { if(e.target.files) setFile(e.target.files[0]) }}
                        required
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 transition-all cursor-pointer" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {saving && (
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest animate-pulse">Subiendo activo: {Math.round(uploadProgress)}%</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving || !name || (!file && !editId)}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-5 rounded-[24px] shadow-2xl transition-all flex items-center justify-center gap-3 mt-8 active:scale-95"
              >
                {saving ? '⏳ Procesando...' : editId ? '💾 Guardar Cambios' : '🚀 Confirmar Subida'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
