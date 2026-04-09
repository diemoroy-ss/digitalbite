"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  featured: boolean;
  orderIndex: number;
}

export default function PlanesGastronomicosPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const q = query(collection(db, "planes"));
        const snap = await getDocs(q);
        const data: Plan[] = [];
        snap.docs.forEach(d => {
           const planData = d.data();
           if (planData.isActive !== false) {
             data.push({ id: d.id, ...planData } as Plan);
           }
        });
        data.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        setPlanes(data);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanes();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden min-h-screen bg-slate-50 flex flex-col">
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Inner nav */}
        <nav className="w-full px-6 py-5 flex max-w-6xl mx-auto">
          <Link href="/login" className="group flex items-center gap-2 font-bold text-sm text-slate-500 hover:text-slate-900 transition-colors px-6 py-3 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md">
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Ir al Inicio
          </Link>
        </nav>

        <header className="pt-12 pb-16 px-4 text-center max-w-3xl mx-auto flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border font-black text-xs uppercase mb-6 tracking-widest bg-emerald-50 border-emerald-200 text-emerald-600">
            Precios y Planes
          </div>
          <h1 className="font-black text-slate-900 leading-[1.1] mb-6 tracking-tight text-5xl md:text-7xl">
            Sube el nivel de tu<br />
            <em className="not-italic bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
              marketing digital
            </em>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            Registrate gratis, elige tu nicho y comienza a generar visuales profesionales en alta resolución al instante.
          </p>
        </header>

        <main className="max-w-6xl mx-auto px-4 pb-32 w-full">
          {loading ? (
             <div className="flex justify-center p-20">
               <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {planes.map(p => (
                <div key={p.id} className={`relative flex flex-col rounded-[32px] p-8 border-2 transition-all duration-300 hover:-translate-y-2 ${p.featured ? 'bg-slate-900 border-emerald-400 shadow-2xl shadow-emerald-900/20 md:-translate-y-4' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'}`}>
                  {p.featured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-slate-900 bg-emerald-400 px-4 py-1.5 rounded-b-xl uppercase">
                      MÁS POPULAR
                    </div>
                  )}
                  
                  <div className={`font-bold text-xs tracking-widest uppercase mb-2 ${p.featured ? 'text-emerald-400' : 'text-slate-400'}`}>Plan</div>
                  <div className={`font-black text-3xl mb-2 tracking-tight ${p.featured ? 'text-white' : 'text-slate-900'}`}>{p.name}</div>
                  <p className={`text-sm mb-6 leading-relaxed h-12 ${p.featured ? 'text-slate-400' : 'text-slate-500'}`}>{p.desc}</p>
                  
                  <div className={`font-black text-4xl mb-8 leading-none ${p.featured ? 'text-white' : 'text-slate-900'}`}>
                    {p.price}<span className={`text-sm font-medium ml-1 ${p.featured ? 'text-slate-400' : 'text-slate-500'}`}>{p.period}</span>
                  </div>
                  
                  <ul className="flex flex-col gap-4 flex-grow mb-10">
                    {p.features && p.features.map((f, i) => (
                      <li key={i} className={`flex items-start gap-3 text-sm font-medium ${p.featured ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className="font-bold shrink-0 mt-0.5" style={{ color: p.featured ? '#34d399' : '#10b981' }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/login"
                    className={`w-full py-4 text-center rounded-[16px] font-black text-sm transition-all shadow-md ${p.featured ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/30' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    Comenzar Ahora
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}