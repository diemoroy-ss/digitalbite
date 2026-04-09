export default function TermsPage() {
  return (
    <main className="min-h-screen py-20 px-6 relative overflow-hidden" style={{ background: '#f8f7f4' }}>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none -z-10" style={{ background: 'rgba(14, 164, 114, 0.05)', filter: 'blur(150px)' }}></div>

      <div className="max-w-4xl mx-auto p-10 md:p-16 rounded-[2.5rem] relative z-10" style={{ background: '#ffffff', border: '0.5px solid #e5e3de', boxShadow: '0 1px 24px rgba(0,0,0,0.06)' }}>
        <a href="/" className="inline-flex items-center font-ag-body font-semibold mb-8" style={{ color: '#0ea472' }}>
          ← Volver al inicio
        </a>

        <h1 className="font-ag-display text-4xl md:text-5xl font-medium mb-4" style={{ color: '#1a1916', letterSpacing: '-0.02em' }}>
          Términos y <span style={{ color: '#0ea472' }}>Condiciones</span>
        </h1>
        
        <p className="font-ag-body text-sm mb-12 italic pb-6" style={{ color: '#9e9b95', borderBottom: '0.5px solid #e5e3de' }}>
          Última actualización: 14 de febrero de 2026
        </p>

        <section className="space-y-10 font-ag-body leading-relaxed" style={{ color: '#6b6860' }}>
          <div>
            <h2 className="font-ag-display text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: '#1a1916' }}>
              <span style={{ color: '#0ea472' }}>1.</span> Aceptación de los Términos
            </h2>
            <p>Al acceder y utilizar el sitio web <strong style={{ color: '#1a1916' }}>digitalbite.app</strong>, usted acepta estar sujeto a estos términos y condiciones. DigitalBite es una plataforma de diseño inteligente impulsada por Inteligencia Artificial, especializada en la creación de contenido visual para el sector gastronómico.</p>
          </div>

          <div>
            <h2 className="font-ag-display text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: '#1a1916' }}>
              <span style={{ color: '#0ea472' }}>2.</span> Uso del Servicio y Desarrollo con IA
            </h2>
            <p className="mb-4">Nuestra promesa es construir cualquier solución digital que usted pueda imaginar utilizando modelos avanzados de IA. Al solicitarnos proyectos o utilizar nuestros agentes, el usuario se compromete a:</p>
            <ul className="list-none space-y-3 p-6 rounded-2xl" style={{ background: '#f8f7f4', border: '0.5px solid #e5e3de' }}>
              <li className="flex items-start gap-3"><span className="font-bold" style={{ color: '#0ea472' }}>✓</span> No utilizar nuestros desarrollos o infraestructura para generar contenido ilegal.</li>
              <li className="flex items-start gap-3"><span className="font-bold" style={{ color: '#0ea472' }}>✓</span> No realizar envíos masivos no solicitados (SPAM) utilizando nuestras integraciones de n8n.</li>
              <li className="flex items-start gap-3"><span className="font-bold" style={{ color: '#0ea472' }}>✓</span> No intentar vulnerar la seguridad de la plataforma o de las APIs de terceros conectadas.</li>
            </ul>
          </div>

          {[
            { num: '3.', title: 'Propiedad Intelectual', content: 'El código fuente, arquitectura, diseño estructural y flujos de automatización generados mediante nuestra IA son propiedad de DigitalBite hasta que se formalice la entrega y transferencia al cliente según el plan contratado.' },
            { num: '4.', title: 'Limitación de Responsabilidad', content: 'DigitalBite desarrolla herramientas tecnológicas potentes. Sin embargo, no nos hacemos responsables por suspensiones de cuentas en plataformas externas derivadas del uso que el cliente le dé a los sistemas desarrollados.' },
            { num: '5.', title: 'Jurisdicción', content: 'Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia será sometida a los tribunales ordinarios de justicia de Santiago de Chile.' },
          ].map(({ num, title, content }, i) => (
            <div key={i}>
              <h2 className="font-ag-display text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: '#1a1916' }}>
                <span style={{ color: '#0ea472' }}>{num}</span> {title}
              </h2>
              <p>{content}</p>
            </div>
          ))}
        </section>

        <div className="mt-16 p-8 rounded-2xl text-center" style={{ background: 'rgba(14, 164, 114, 0.05)', border: '0.5px solid rgba(14, 164, 114, 0.2)' }}>
          <p className="font-ag-body" style={{ color: '#6b6860' }}>
            Si tiene dudas sobre estos términos, contáctenos en: <br/>
            <a href="mailto:hola@digitalbite.app" className="font-bold underline mt-2 inline-block" style={{ color: '#0ea472' }}>hola@digitalbite.app</a>
          </p>
        </div>
      </div>
    </main>
  );
}