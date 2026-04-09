export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-20 px-6 relative overflow-hidden" style={{ background: '#f8f7f4' }}>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none -z-10" style={{ background: 'rgba(14, 164, 114, 0.05)', filter: 'blur(150px)' }}></div>

      <div className="max-w-4xl mx-auto p-10 md:p-16 rounded-[2.5rem] relative z-10" style={{ background: '#ffffff', border: '0.5px solid #e5e3de', boxShadow: '0 1px 24px rgba(0,0,0,0.06)' }}>
        <a href="/" className="inline-flex items-center font-ag-body font-semibold mb-8 transition-colors" style={{ color: '#0ea472' }}>
          ← Volver al inicio
        </a>

        <h1 className="font-ag-display text-4xl md:text-5xl font-medium mb-4" style={{ color: '#1a1916', letterSpacing: '-0.02em' }}>
          Política de <span style={{ color: '#0ea472' }}>Privacidad</span>
        </h1>
        
        <p className="font-ag-body text-sm mb-12 italic pb-6" style={{ color: '#9e9b95', borderBottom: '0.5px solid #e5e3de' }}>
          Última actualización: 14 de febrero de 2026
        </p>

        <section className="space-y-10 font-ag-body leading-relaxed" style={{ color: '#6b6860' }}>
          {[
            { num: '1.', title: 'Información que Recopilamos', content: 'Recopilamos información básica de contacto (nombre, correo electrónico, teléfono) cuando utilizas nuestros formularios de contacto o agenda de reuniones. También recopilamos de forma anónima datos de navegación como páginas visitadas y duración de sesión para mejorar nuestro servicio.' },
            { num: '2.', title: 'Uso de la Información', content: 'Utilizamos tu información exclusivamente para responder a tus consultas comerciales, personalizar la comunicación y mejorar nuestros servicios. Nunca vendemos, alquilamos ni compartimos tu información personal con terceros de forma no autorizada.' },
            { num: '3.', title: 'Uso de Inteligencia Artificial', content: 'DigitalBite utiliza modelos de Inteligencia Artificial para analizar el contexto de las solicitudes recibidas y generar propuestas o flujos de trabajo más relevantes. Los datos procesados por nuestras herramientas de IA no son utilizados para entrenar modelos públicos de terceros.' },
            { num: '4.', title: 'Cookies', content: 'Utilizamos cookies esenciales para el correcto funcionamiento del sitio. No utilizamos cookies de rastreo publicitario de terceros. Puedes controlar el uso de cookies a través de la configuración de tu navegador.' },
            { num: '5.', title: 'Tus Derechos', content: 'Conforme a la Ley 19.628 de Chile sobre Protección de Datos de Carácter Personal, tienes derecho a acceder, rectificar y eliminar tus datos personales. Para ejercer estos derechos, contáctanos en la dirección indicada a continuación.' },
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
            Si tiene dudas sobre nuestra política de privacidad, contáctenos en: <br/>
            <a href="mailto:hola@digitalbite.app" className="font-bold underline mt-2 inline-block" style={{ color: '#0ea472' }}>hola@digitalbite.app</a>
          </p>
        </div>
      </div>
    </main>
  );
}