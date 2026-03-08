import React from 'react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#030712] text-slate-300 py-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] -z-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto p-10 md:p-16 rounded-[2.5rem] bg-slate-900/80 border border-slate-700 backdrop-blur-xl shadow-2xl relative z-10">
        <a href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold mb-8 transition-colors">
          ← Volver al inicio
        </a>

        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white">
          Términos y <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Condiciones</span>
        </h1>
        
        <p className="text-sm text-slate-500 mb-12 italic border-b border-slate-800 pb-6">
          Última actualización: 14 de febrero de 2026
        </p>

        <section className="space-y-10 text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="text-blue-500">1.</span> Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar el sitio web <strong className="text-white">santisoft.cl</strong>, usted acepta estar sujeto a estos términos y condiciones. Santisoft es una agencia de desarrollo tecnológico impulsada por Inteligencia Artificial, especializada en la creación de sitios web, aplicaciones nativas y automatizaciones complejas en tiempo récord.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="text-blue-500">2.</span> Uso del Servicio y Desarrollo con IA
            </h2>
            <p className="mb-4">
              Nuestra promesa es construir cualquier solución digital que usted pueda imaginar utilizando modelos avanzados de IA. Al solicitarnos proyectos o utilizar nuestros agentes, el usuario se compromete a:
            </p>
            <ul className="list-none space-y-3 p-6 bg-slate-800 rounded-2xl border border-slate-700">
              <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">✓</span> No utilizar nuestros desarrollos o infraestructura para generar contenido ilegal.</li>
              <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">✓</span> No realizar envíos masivos no solicitados (SPAM) utilizando nuestras integraciones de n8n.</li>
              <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">✓</span> No intentar vulnerar la seguridad de la plataforma o de las APIs de terceros conectadas.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="text-blue-500">3.</span> Propiedad Intelectual
            </h2>
            <p>
              El código fuente, arquitectura, diseño estructural y flujos de automatización generados mediante nuestra IA son propiedad de Santisoft hasta que se formalice la entrega y transferencia al cliente según el plan contratado.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="text-blue-500">4.</span> Limitación de Responsabilidad
            </h2>
            <p>
              Santisoft desarrolla herramientas tecnológicas potentes. Sin embargo, no nos hacemos responsables por suspensiones de cuentas en plataformas externas derivadas del uso que el cliente le dé a los sistemas desarrollados.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="text-blue-500">5.</span> Jurisdicción
            </h2>
            <p>
              Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia será sometida a los tribunales ordinarios de justicia de Santiago de Chile.
            </p>
          </div>
        </section>

        <div className="mt-16 p-8 bg-blue-900/20 rounded-2xl border border-blue-500/30 text-center">
          <p className="text-slate-300">
            Si tiene dudas sobre estos términos, contáctenos en: <br/>
            <a href="mailto:contacto@santisoft.cl" className="font-bold text-blue-400 hover:text-blue-300 underline mt-2 inline-block transition-colors">contacto@santisoft.cl</a>
          </p>
        </div>
      </div>
    </main>
  );
}