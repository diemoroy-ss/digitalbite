"use client";
import { useState } from "react";
import { auth } from "../../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/plantillas");
    } catch (err: any) {
      setError("Credenciales inválidas. Revisa tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      
      {/* Botón para volver al generador */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-rose-500 font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm transition-all hover:shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
        Volver a la IA Gastronómica
      </Link>

      <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Acceso Privado</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresa como administrador</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-semibold mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-400/20 outline-none transition-all" 
              placeholder="tu@correo.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-400/20 outline-none transition-all" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-slate-900 border-none px-6 py-4 rounded-xl text-white font-bold tracking-wide transition-all hover:bg-slate-800 disabled:opacity-70 mt-2 shadow-lg shadow-slate-900/20"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
