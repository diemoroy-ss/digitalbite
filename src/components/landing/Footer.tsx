"use client";
export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/30 pb-28 sm:pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <span className="font-display font-bold text-primary text-lg">d</span>
            </span>
            <span className="font-display text-xl font-semibold text-white">
              digital<span className="text-primary">bite</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            La forma más rápida y bonita de mostrar lo que cocinas. Hecho con cariño
            para restaurantes, cafés y bares.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Producto</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#galeria" className="hover:text-primary transition-colors">Galería</a></li>
            <li><a href="#precios" className="hover:text-primary transition-colors">Precios</a></li>
            <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            <li><a href="/login" className="hover:text-primary transition-colors">Probar gratis</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Contacto</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="https://wa.me/56900000000" className="hover:text-primary transition-colors">WhatsApp</a></li>
            <li><a href="mailto:hola@digitalbite.cl" className="hover:text-primary transition-colors">hola@digitalbite.cl</a></li>
            <li><a href="https://instagram.com" className="hover:text-primary transition-colors">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} DigitalBite. Cocinado en Santiago.</p>
          <p>Hecho con ✦ por Santisoft.</p>
        </div>
      </div>
    </footer>
  );
}
