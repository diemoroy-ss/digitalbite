"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Legend 
} from 'recharts';

interface DailyStats {
  id: string;
  total_visits: number;
  home_visits: number;
  dashboard_visits: number;
  videos_generated: number;
  render_views: number;
  logins: number;
  date: string;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const q = query(
          collection(db, "analytics_daily_stats"),
          orderBy("__name__", "desc"), // __name__ is the date ID (YYYY-MM-DD)
          limit(30)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          date: doc.id.split('-').slice(1).join('/'), // MM/DD for display
          ...doc.data()
        })) as DailyStats[];
        
        setStats(data.reverse()); // Chronological order
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const totals = stats.reduce((acc, curr) => ({
    visits: acc.visits + (curr.total_visits || 0),
    videos: acc.videos + (curr.videos_generated || 0),
    logins: acc.logins + (curr.logins || 0),
  }), { visits: 0, videos: 0, logins: 0 });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analítica y Tendencias</h1>
          <p className="text-slate-500 font-medium">Visualiza el rendimiento de DigitalBite en los últimos 30 días.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
            Últimos 30 días
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <span className="text-5xl">👥</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Visitas Totales</p>
          <h3 className="text-4xl font-black text-slate-900 mt-2">{totals.visits}</h3>
          <p className="text-sm text-green-500 font-bold mt-2 flex items-center gap-1">
            <span>↑</span> +12.5% <span className="text-slate-400 font-medium">vs mes anterior</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <span className="text-5xl">🎬</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Videos Generados</p>
          <h3 className="text-4xl font-black text-slate-900 mt-2">{totals.videos}</h3>
          <p className="text-sm text-rose-500 font-bold mt-2 flex items-center gap-1">
            <span>↑</span> +8.2% <span className="text-slate-400 font-medium">tasa de conversión</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <span className="text-5xl">🔑</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sesiones Iniciadas</p>
          <h3 className="text-4xl font-black text-slate-900 mt-2">{totals.logins}</h3>
          <p className="text-sm text-blue-500 font-bold mt-2 flex items-center gap-1">
            <span>🕒</span> Active <span className="text-slate-400 font-medium">usuarios recurrentes</span>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visits Trend */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Tráfico Diario</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Visitas</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Home</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="total_visits" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                <Area type="monotone" dataKey="home_visits" stroke="#6366f1" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Trend */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Generación de Videos</h3>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">Tendencia al Alza</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="videos_generated" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row with more tables or details */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Desglose de Actividad</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitas Totales</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Landing</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conv. Video</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.slice().reverse().map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-slate-900 text-sm">{row.id}</td>
                  <td className="px-8 py-4 text-slate-600 text-sm font-medium">{row.total_visits || 0}</td>
                  <td className="px-8 py-4 text-slate-600 text-sm">{row.home_visits || 0}</td>
                  <td className="px-8 py-4 text-slate-600 text-sm">{row.dashboard_visits || 0}</td>
                  <td className="px-8 py-4">
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                      {row.videos_generated || 0}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-slate-600 text-sm">{row.logins || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
