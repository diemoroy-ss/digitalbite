"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";

interface Plan {
  id: string; // id de bd
  name: string; // "Premium"
}

interface Categoria {
  id: string;
  slug: string;
  name: string;
}

interface Comercio {
  id: string;
  slug: string;
  name: string;
}

interface Usuario {
  id: string; // firestore id (o uid de firebase auth)
  email: string;
  name: string;
  role: "admin" | "user";
  plan: string;
  rutFacturacion?: string;
  razonSocial?: string;
  giro?: string;
  direccion?: string;
  categoriesAllowed: string[]; // ["burger", "sushi"] o ["all"]
  comercioId?: string; // id del doc en 'comercios'
  generationCount?: number;
  createdAt: any;
}

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter State
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterQuota, setFilterQuota] = useState("all");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchCategorias(), fetchComercios()]);
    setLoading(false);
  };

  const fetchComercios = async () => {
    const q = query(collection(db, "comercios"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    const data: Comercio[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Comercio));
    setComercios(data);
  };

  const fetchCategorias = async () => {
    const q = query(collection(db, "categories"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    const data: Categoria[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Categoria));
    setCategorias(data);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data: Usuario[] = [];
      snap.forEach(d => {
        data.push({ id: d.id, ...d.data() } as Usuario);
      });
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, "users", editingUser.id), {
         role: editingUser.role,
         plan: editingUser.plan,
         categoriesAllowed: editingUser.categoriesAllowed,
         comercioId: editingUser.comercioId || "gastronomico" // Default safely
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (error) {
       console.error(error); alert("Error guardando usuario");
    } finally {
       setSaving(false);
    }
  };

  const toggleCategory = (catId: string) => {
    if (!editingUser) return;
    const current = editingUser.categoriesAllowed || [];
    let nw = [...current];

    if (catId === "all") {
      nw = ["all"];
    } else {
      // Remover "all" si estaba
      nw = nw.filter(c => c !== "all");
      if (nw.includes(catId)) {
        nw = nw.filter(c => c !== catId);
      } else {
        nw.push(catId);
      }
    }
    setEditingUser({ ...editingUser, categoriesAllowed: nw });
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("¿Dar de baja a este usuario permanentemente? Esto no borra su cuenta en Auth, pero borra su perfil de acceso local.")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
       console.error(error); alert("Error");
    }
  };

  // Derived Data
  const availablePlans = Array.from(new Set(users.map(u => u.plan || "Free"))).sort();
  
  const filteredUsers = users.filter(u => {
    const pMatch = filterPlan === "all" || (u.plan || "Free") === filterPlan;
    
    const count = u.generationCount || 0;
    let qMatch = true;
    if (filterQuota === "0") qMatch = count === 0;
    else if (filterQuota === "1-10") qMatch = count > 0 && count <= 10;
    else if (filterQuota === "11-50") qMatch = count > 10 && count <= 50;
    else if (filterQuota === "50+") qMatch = count > 50;
    
    return pMatch && qMatch;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 animate-in fade-in duration-500">
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Administra permisos, planes y supervisa el consumo de cuota.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="mb-6 flex flex-col md:flex-row items-end gap-4 px-4">
         <div className="flex-1 w-full relative">
            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 ml-1">Filtrar por Plan</label>
            <select 
              value={filterPlan} 
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            >
               <option value="all">💎 Todos los Planes</option>
               {availablePlans.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
         </div>
         <div className="flex-1 w-full relative">
            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 ml-1">Filtrar por Cuota (Uso)</label>
            <select 
              value={filterQuota} 
              onChange={(e) => setFilterQuota(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            >
               <option value="all">📊 Todo el Consumo</option>
               <option value="0">0 - Sin actividad</option>
               <option value="1-10">1 a 10 (Uso Bajo)</option>
               <option value="11-50">11 a 50 (Uso Medio)</option>
               <option value="50+">Más de 50 (Uso Alto)</option>
            </select>
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden mx-4">
        {loading ? (
             <div className="p-20 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredUsers.length === 0 ? (
           <div className="p-20 text-center flex flex-col items-center">
              <span className="text-4xl mb-4 opacity-20">🔎</span>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No se encontraron usuarios coincidentes</p>
           </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                 <th className="p-5">Usuario / Email</th>
                 <th className="p-5">Giro / Comercio</th>
                 <th className="p-5">Estatus & Plan</th>
                 <th className="p-5">Capacidad / Cuota</th>
                 <th className="p-5 text-right w-[150px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="p-5">
                     <div className="font-black text-slate-800 text-sm leading-tight mb-1">{u.name || "Usuario de DigitalBite"}</div>
                     <div className="text-slate-400 font-bold text-[11px] truncate max-w-[200px]">{u.email}</div>
                  </td>
                  <td className="p-5">
                     <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                        {comercios.find(c => c.slug === (u.comercioId || 'gastronomico') || c.id === (u.comercioId || 'gastronomico'))?.name || (u.comercioId || "Gastronómico")}
                     </div>
                  </td>
                  <td className="p-5">
                     <div className="flex flex-col gap-1">
                        <span className={`text-[10px] uppercase font-black tracking-widest ${u.role==='admin' ? 'text-indigo-600' : 'text-slate-400'}`}>{u.role || 'user'}</span>
                        <span className="text-xs font-bold text-slate-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-md inline-block self-start shadow-sm">{u.plan || 'Free'}</span>
                     </div>
                  </td>
                  <td className="p-5">
                      <div className="flex items-center gap-3">
                         <div className="flex flex-col">
                            <span className="text-[12px] font-black text-slate-800">{u.generationCount || 0}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Generaciones</span>
                         </div>
                         {u.categoriesAllowed && u.categoriesAllowed.includes("all") ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Acceso Premium Full" />
                         ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                         )}
                      </div>
                  </td>
                  <td className="p-5 text-right space-x-1">
                     <button onClick={()=>setEditingUser(u)} className="w-10 h-10 inline-flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:shadow-md active:scale-95" title="Configurar Acceso"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                     <button onClick={()=>deleteUser(u.id)} className="w-10 h-10 inline-flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all hover:shadow-md active:scale-95" title="Dar de baja"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL EDICIÓN */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-[24px] shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-800">Editando a {editingUser.name}</h2>
                 <button onClick={()=>setEditingUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                 <form id="edit-user-form" onSubmit={handleSaveUser} className="space-y-5">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Rol de Acceso</label>
                        <select value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role: e.target.value as any})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                          <option value="user">Usuario (Cliente)</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nombre del Plan</label>
                        <input type="text" value={editingUser.plan || ''} onChange={e=>setEditingUser({...editingUser, plan: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Ej: Premium Monthly" />
                      </div>
                    </div>

                    <div>
                       <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tipo de Comercio V2</label>
                       <select value={editingUser.comercioId || "gastronomico"} onChange={e=>setEditingUser({...editingUser, comercioId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-indigo-700">
                          {comercios.length === 0 && <option value="gastronomico">Gastronómico</option>}
                          {comercios.map(c => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
                          ))}
                       </select>
                       <p className="text-[10px] text-slate-400 mt-1">Este valor restringe de forma primaria qué tipo de plantillas podrá visualizar independientemente de sus categorías.</p>
                    </div>

                    <div>
                       <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Acceso a Plantillas / Menú de Productos</label>
                       
                       <div className="space-y-2">
                         <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                           <input type="checkbox" checked={editingUser.categoriesAllowed?.includes("all")} onChange={()=>toggleCategory("all")} className="w-5 h-5 text-indigo-600 rounded border-slate-300" />
                           <span className="text-sm font-bold text-slate-800">Toda la Base de Datos (Full Access)</span>
                         </label>

                         {!editingUser.categoriesAllowed?.includes("all") && (
                           <div className="pl-8 pt-2 space-y-2">
                              <p className="text-xs text-slate-500 font-medium mb-3">O selecciona categorías manuales:</p>
                              {categorias.map(cat => (
                                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                   <input type="checkbox" checked={editingUser.categoriesAllowed?.includes(cat.slug)} onChange={()=>toggleCategory(cat.slug)} className="w-4 h-4 rounded text-rose-500" />
                                   <span className="text-sm font-medium text-slate-700 capitalize">{cat.name}</span>
                                </label>
                              ))}
                           </div>
                         )}
                       </div>
                    </div>

                 </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50">
                 <button form="edit-user-form" type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md">
                    {saving ? 'Guardando...' : 'Aplicar Cambios'}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
