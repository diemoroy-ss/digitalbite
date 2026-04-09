"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

interface Comercio {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  generationLimit: number;
  videoLimit: number;
  comercioLimit: number;
  features: string[];
  featured: boolean;
  payPerUse: boolean;
  orderIndex: number;
  isActive: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  
  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedComercios, setSelectedComercios] = useState<string[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
         router.replace("/login");
         return;
      }
      setUserUid(user.uid);
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      // Uncomment to enforce lock
      // if (userDoc.exists() && userDoc.data().onboardingCompleted) {
      //   router.replace("/dashboard");
      //   return;
      // }
      
      await Promise.all([fetchComercios(), fetchPlanes()]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchComercios = async () => {
    const q = query(collection(db, "comercios"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    const data: Comercio[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Comercio));
    setComercios(data);
  };

  const fetchPlanes = async () => {
    const q = query(collection(db, "planes"));
    const snap = await getDocs(q);
    const data: Plan[] = [];
    snap.forEach(d => {
       const planData = d.data();
       if (planData.isActive !== false) {
         data.push({ id: d.id, ...planData } as Plan);
       }
    });
    data.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    setPlanes(data);
  };

  const selectedPlanObj = planes.find(p => p.id === selectedPlanId);
  const currentLimit = selectedPlanObj ? selectedPlanObj.comercioLimit : 1;

  const toggleComercio = (slug: string) => {
    if (selectedComercios.includes(slug)) {
      setSelectedComercios(prev => prev.filter(c => c !== slug));
    } else {
      if (selectedComercios.length < currentLimit) {
        setSelectedComercios(prev => [...prev, slug]);
      }
    }
  };

  // Reset selected comercios if plan changes and limit reduces
  useEffect(() => {
    if (selectedComercios.length > currentLimit) {
      setSelectedComercios(selectedComercios.slice(0, currentLimit));
    }
  }, [selectedPlanId, currentLimit, selectedComercios]);

  const handleFinish = async () => {
    if (!userUid || selectedComercios.length === 0 || !selectedPlanObj) return;
    setSaving(true);
    
    try {
      const isPaid = selectedPlanObj.price && parseInt(selectedPlanObj.price.replace(/\D/g, '')) > 0;
      
      // Si el plan es "Pay Per Use" pero el Onboarding en sí no cuesta (ej. Plan Gratutio/Pay per use básico)
      // O si el precio base del plan es >0 (suscripción mensual)
      if (isPaid && !selectedPlanObj.payPerUse) {
        
        // SUSCRIPCIONES (Ej: Premium / Business)
        const res = await fetch("/api/mercadopago/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userUid,
            userEmail: auth.currentUser?.email,
            planName: selectedPlanObj.name,
            planId: selectedPlanObj.id,
            price: parseInt(selectedPlanObj.price.replace(/\D/g, ''))
          })
        });
        
        const data = await res.json();
        
        if (data.init_point) {
           // Guardamos intencion temporal
           await updateDoc(doc(db, "users", userUid), {
             comercioIds: selectedComercios,
             paymentPending: true,
             onboardingCompleted: true
           });
           window.location.href = data.init_point;
           return;
        } else {
           alert("Hubo un error al conectar con Mercado Pago.");
           setSaving(false);
           return;
        }

      } else {

        // PLANES GRATUITOS O PAY-PER-USE (Suscripción base gratis)
        await updateDoc(doc(db, "users", userUid), {
          plan: selectedPlanObj.name, 
          planId: selectedPlanObj.id,
          comercioIds: selectedComercios,
          generationLimit: selectedPlanObj.generationLimit,
          videoLimit: selectedPlanObj.videoLimit,
          generationCount: 0, 
          videoGenerationCount: 0,
          onboardingCompleted: true,
          paymentPending: false
        });
        router.replace("/dashboard");

      }

    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <div className="max-w-4xl w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        
        {/* Header */}
        <div className="text-center mb-12">
           <div className="w-16 h-16 bg-slate-900 text-white rounded-[20px] flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-slate-900/20">
             ✨
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
             {step === 1 ? "Elige el plan ideal para ti" : "Selecciona tu nicho de mercado"}
           </h1>
           <p className="text-slate-500 text-lg max-w-lg mx-auto">
             {step === 1 
               ? "Comienza a generar contenido profesional en segundos. Puedes cambiar tu plan o cancelarlo en el futuro." 
               : `Como elegiste el plan ${selectedPlanObj?.name.toUpperCase()}, puedes seleccionar hasta ${currentLimit} tipo${currentLimit>1?'s':''} de comercio.`}
           </p>
        </div>

        {/* STEP 1: PLANES DINÁMICOS */}
        {step === 1 && (
           <div className="grid md:grid-cols-3 gap-6 mb-12">
             {planes.map(p => {
               const isSelected = selectedPlanId === p.id;
               return (
                 <div 
                   key={p.id}
                   onClick={() => setSelectedPlanId(p.id)}
                   className={`relative rounded-[32px] p-8 border-2 transition-all cursor-pointer flex flex-col overflow-hidden ${
                     p.featured 
                      ? (isSelected ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-900/40 ring-4 ring-amber-400/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm')
                      : (isSelected ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm')
                   }`}
                 >
                   {p.featured && (
                     <div className="absolute top-0 right-1/2 translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-b-xl uppercase tracking-widest">✨ Más Popular</div>
                   )}
                   
                   {isSelected && (
                     <div className={`absolute top-4 right-4 ${p.featured ? 'text-amber-400' : 'text-indigo-600'}`}>
                       <CheckIcon />
                     </div>
                   )}
                   
                   <div className="mb-6 mt-2">
                     <h3 className={`font-black text-2xl mb-1 ${p.featured ? 'text-white' : 'text-slate-800'}`}>{p.name}</h3>
                     <p className={`text-sm h-10 ${p.featured ? 'text-slate-400' : 'text-slate-500'}`}>{p.desc}</p>
                   </div>
                   
                   <div className="mb-8">
                     <span className={`text-4xl font-black ${p.featured ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
                     <span className={`font-medium ml-1 ${p.featured ? 'text-slate-400' : 'text-slate-500'}`}>{p.period}</span>
                   </div>
                   
                   <ul className="space-y-4 mb-8 flex-1">
                     {p.features && p.features.map((f, i) => (
                       <li key={i} className={`flex gap-3 text-sm font-medium ${p.featured ? 'text-slate-300' : 'text-slate-600'}`}>
                         <CheckSmall className={p.featured ? 'text-amber-400' : 'text-indigo-500'} />
                         {f}
                       </li>
                     ))}
                   </ul>
                 </div>
               )
             })}
           </div>
        )}

        {/* STEP 2: COMERCIOS */}
        {step === 2 && (
           <div className="max-w-2xl mx-auto w-full mb-12 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-700">Comercios Seleccionados:</h3>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                   {selectedComercios.length} / {currentLimit} max
                </div>
             </div>
             
             {comercios.length === 0 ? (
               <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl text-slate-500">
                 <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                 Cargando catálogo...
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {comercios.map(c => {
                    const isSelected = selectedComercios.includes(c.slug);
                    const isDisabled = !isSelected && selectedComercios.length >= currentLimit;
                    return (
                       <button
                         key={c.id}
                         disabled={isDisabled}
                         onClick={() => toggleComercio(c.slug)}
                         className={`p-6 bg-white border-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${isSelected ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-md' : isDisabled ? 'border-slate-100 opacity-50 cursor-not-allowed' : 'border-slate-200 hover:border-slate-300'}`}
                       >
                          <span className="text-4xl mb-3">{c.icon || "🏢"}</span>
                          <span className={`font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>{c.name}</span>
                       </button>
                    )
                  })}
               </div>
             )}
             
             {selectedComercios.length === 0 && (
                <p className="text-center text-rose-500 text-sm mt-6 font-medium animate-pulse">Debes seleccionar al menos un comercio para poder continuar.</p>
             )}
           </div>
        )}
        
        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 border-t border-slate-200 pt-8 mt-auto">
           {step === 2 && (
             <button onClick={() => setStep(1)} className="px-6 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">
               Volver a Planes
             </button>
           )}
           
           {step === 1 ? (
             <button 
               disabled={!selectedPlanId} 
               onClick={() => setStep(2)} 
               className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
             >
               Confirmar y Continuar <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </button>
           ) : (
             <button 
               disabled={selectedComercios.length === 0 || saving} 
               onClick={handleFinish} 
               className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 transition-all flex items-center gap-2"
             >
               {saving ? 'Configurando Espacio...' : 'Finalizar Configuración'}
             </button>
           )}
        </div>

      </div>
    </div>
  );
}

// Helpers SVG
function CheckIcon() {
  return (
    <div className="w-8 h-8 bg-current rounded-full flex items-center justify-center shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  )
}
function CheckSmall({ className="text-indigo-600" }: {className?: string}) {
  return (
    <svg className={`shrink-0 ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  )
}
