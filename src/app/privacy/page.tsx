import React from 'react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#030712] text-slate-300 py-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto p-10 md:p-16 rounded-[2.5rem] bg-slate-900/80 border border-slate-700 backdrop-blur-xl shadow-2xl">
        <a href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold mb-8 transition-colors">
          ← Volver al inicio
        </a>

        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight text-white">Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Privacidad</span></h1>

        <section className="space-y-8 text-lg leading-relaxed text-slate-300">
          <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <p><strong className="text-white">Responsable:</strong> Santisoft (santisoft.cl).</p>
            <p className="mt-2"><strong className="text-white">Nuestra Visión:</strong> Desarrollamos sitios web, apps y automatizaciones con Inteligencia Artificial en tiempo récord. Tratamos tus datos con el mismo nivel de innovación, velocidad y seguridad con el que construimos tu software.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Uso de Datos</h2>
            <p>Recopilamos nombre, email y teléfono para entender los requerimientos de tu proyecto, entrenar a nuestros agentes para generar tus soluciones (webs o aplicaciones) y automatizar tu comunicación mediante plataformas como Instagram y WhatsApp.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Almacenamiento y Seguridad</h2>
            <p>Los archivos y requerimientos se procesan en infraestructuras seguras en la nube (como Cloudinary o servidores dedicados) y se resguardan estrictamente. Al utilizar IA para crear sin límites, garantizamos que tu propiedad intelectual y datos de origen se mantengan siempre confidenciales y protegidos.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Tus Derechos</h2>
            <p>Puedes solicitar la revisión, modificación o eliminación de tus datos en cualquier momento escribiendo directamente a nuestro equipo a <a href="mailto:contacto@santisoft.cl" className="text-blue-400 hover:underline">contacto@santisoft.cl</a>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}