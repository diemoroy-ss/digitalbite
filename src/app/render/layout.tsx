// Layout aislado para la página de render de Butterfly.
// No incluye navbar, footer, ni ningún elemento UI del sitio.
// Butterfly Solo captura el div#link-preview que existe en page.tsx
export default function RenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: "#0f172a", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
