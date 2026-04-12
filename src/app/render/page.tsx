// Server Component — NO "use client"
// Esto hace que Next.js pre-renderice el HTML completo en el servidor.
// Butterfly Social obtiene el contenido inmediatamente sin esperar JavaScript.

const FIREBASE_PROJECT = "gastrosantisoft";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

// ── Helpers para parsear la respuesta de Firestore REST API ──────────────────
function parseValue(val: any): any {
  if (!val) return null;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return Number(val.integerValue);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.nullValue !== undefined) return null;
  if (val.arrayValue) return (val.arrayValue.values || []).map(parseValue);
  if (val.mapValue) return parseFields(val.mapValue.fields || {});
  return null;
}
function parseFields(fields: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) out[k] = parseValue(v);
  return out;
}

async function fetchRender(id: string) {
  const urlTemp = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/renders_temporales/${id}?key=${FIREBASE_API_KEY}`;
  const urlFinal = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/renders/${id}?key=${FIREBASE_API_KEY}`;
  
  try {
    // Buscar en renders_temporales primero
    let res = await fetch(urlTemp, { cache: "no-store" });
    
    // Si no está ahí (ej: viene de Mis Diseños), buscar en renders definitivos
    if (!res.ok) {
        res = await fetch(urlFinal, { cache: "no-store" });
    }
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.fields ? parseFields(json.fields) : null;
  } catch {
    return null;
  }
}

async function fetchCustomFonts() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/fonts?key=${FIREBASE_API_KEY}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.documents) return [];
    return json.documents.map((d: any) => parseFields(d.fields || {}));
  } catch {
    return [];
  }
}

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
function IgIcon({ s, c }: { s: number; c: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function FbIcon({ s, c }: { s: number; c: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.39-4h-4.2V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function TkIcon({ s, c }: { s: number; c: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
function SocialIcon({ fieldKey, size, color }: { fieldKey: string; size: number; color: string }) {
  if (fieldKey === "instagram") return <IgIcon s={size} c={color} />;
  if (fieldKey === "facebook") return <FbIcon s={size} c={color} />;
  if (fieldKey === "tiktok") return <TkIcon s={size} c={color} />;
  return null;
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Layer {
  id: string; fieldKey?: string; type: string;
  text: string; posX: number; posY: number; fontSize: number;
  color: string; fontWeight: string;
  textAlign: "left" | "center" | "right";
  fontFamily: string; shadow: boolean;
  badgeStyle: number;
  width: string;
  height: string;
}

// ── Server Component principal ────────────────────────────────────────────────
export default async function RenderPage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  const searchParams = await props.searchParams;
  const id = searchParams.id;

  if (!id) {
    return <div style={{ padding: 40, color: "red", fontFamily: "sans-serif" }}>Falta el parámetro id.</div>;
  }

  const data = await fetchRender(id);
  const customFonts = await fetchCustomFonts();

  if (!data) {
    return <div style={{ padding: 40, color: "red", fontFamily: "sans-serif" }}>No se encontraron datos para id: {id}</div>;
  }

  const isPost = data.formato === "post";
  const isTvH = data.formato === "tv_h";
  const W = 1080, H = isTvH ? 1080 : (isPost ? 1080 : 1920);

  // ── Normalizar capas (maneja AMBOS sistemas: px absolutos y % relativos) ─────
  // El editor guarda posX/posY como % del contenedor (0-100)
  // y width/height también como %, PERO capas antiguas las guardan como px absolutas
  // Regla: si width > 100 → tratarlo como px del canvas 1080, convertir a %.
  const rawLayers: any[] = data.textLayers || [];
  const layers: Layer[] = rawLayers.map(l => {
    // --- posX / posY: siempre se interpretaron como %, mantener
    const posX = l.posX !== undefined ? Number(l.posX) : (Number(l.x) / W * 100) || 50;
    const posY = l.posY !== undefined ? Number(l.posY) : (Number(l.y) / H * 100) || 50;

    // --- width: detectar si está en px o en %
    let widthPct = "78%"; // default razonable
    if (l.width !== undefined && l.width !== null && l.width !== "") {
      const wRaw = l.width;
      if (typeof wRaw === 'string' && wRaw.endsWith('%')) {
        widthPct = wRaw;  // ya es porcentaje
      } else {
        const wNum = parseFloat(String(wRaw));
        if (!isNaN(wNum)) {
          if (wNum <= 100) widthPct = `${wNum}%`; // guardado como %
          else widthPct = `${(wNum / W) * 100}%`;  // guardado como px del canvas
        }
      }
    }

    // --- height: misma lógica
    let heightPct = "auto";
    if (l.height !== undefined && l.height !== null && l.height !== "") {
      const hRaw = l.height;
      if (typeof hRaw === 'string' && hRaw.endsWith('%')) {
        heightPct = hRaw;
      } else {
        const hNum = parseFloat(String(hRaw));
        if (!isNaN(hNum)) {
          if (hNum <= 100) heightPct = `${hNum}%`;
          else heightPct = `${(hNum / H) * 100}%`;
        }
      }
    }

    return {
      id: String(l.id || Math.random().toString(36).slice(2)),
      fieldKey: l.fieldKey || undefined,
      type: String(l.type || "text"),
      text: String(l.text || ""),
      posX, posY,
      fontSize: Number(l.fontSize) || 60,
      color: String(l.color || "#ffffff"),
      fontWeight: String(l.fontWeight || "bold"),
      textAlign: (l.textAlign as "left" | "center" | "right") || "center",
      fontFamily: String(l.fontFamily || "'Playfair Display', serif"),
      shadow: l.shadow !== false,
      badgeStyle: Number(l.badgeStyle) || 1,
      width: widthPct,
      height: heightPct,
    };
  }).filter(l => l.text); // Ignorar capas sin texto

  const hasLayers = layers.length > 0;
  const maxTextWidth = Math.round(W * 0.78); // 78% del ancho del canvas

  const screenMenu: any = data.menusByScreen?.[data.screenIndex || 0] || { isMenuMode: false, menuItems: [] };

  const FONTS_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Pacifico&family=Syne:wght@400;700;800&display=swap";

  return (
    <>
      {/* Preload fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONTS_URL} />
      {customFonts.length > 0 && (
        <style dangerouslySetInnerHTML={{
          __html: customFonts.map((f: any) => f.url.includes("fonts.googleapis.com") ? `@import url('${f.url}');` : `
            @font-face {
              font-family: "${f.name}";
              src: url(${f.url});
            }
          `).join("\n")
        }} />
      )}

      <div
        id="link-preview"
        style={{
          position: "relative",
          overflow: "hidden",
          width: `${W}px`,
          height: `${H}px`,
          backgroundColor: "#000",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Usar <img> asegura que headless browsers esperan a que termine de descargar el fondo antes de la foto */}
        {data.fondoUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.fondoUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} alt="fondo" />
          </>
        )}
        
        {/* Gradient overlay: IGUALADO EXACTAMENTE AL COMPONENTE */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%, transparent 100%)", zIndex: 1, pointerEvents: "none" }} />

        {/* ── MODO A: Capas libres (documentos nuevos con textLayers) ── */}
        {hasLayers && (
          <>
            {/* OJO: SE ELIMINÓ EL BLOQUE DEL LOGO FIJO QUE HABÍA AQUÍ PARA QUE SOLO RENDERICE EL DE LA CAPA */}
            {layers.map((layer, index) => {
              const isSocial = layer.type === "social";
              const isPrice = layer.type === "price";
              const isLogo = layer.type === "logo";
              const isImage = layer.type === "image";
              const bStyle = layer.badgeStyle;

              const ts = layer.shadow ? "0 2px 6px rgba(0,0,0,0.95)" : "none";
              const spanStyle: React.CSSProperties = {
                fontFamily: layer.fontFamily || "sans-serif",
                fontSize: `${layer.fontSize}px`,
                color: layer.color,
                fontWeight: layer.fontWeight as any,
                textShadow: ts,
                display: "block",
                lineHeight: 1.2,
                whiteSpace: "pre-wrap",
                maxWidth: `${maxTextWidth}px`,
                textAlign: layer.textAlign,
              };

              // Variables para contenedor del precio según el estilo
              let priceStyle: React.CSSProperties = {};
              if (isPrice) {
                if (bStyle === 1) priceStyle = { background: "linear-gradient(135deg,#f43f5e,#fb923c)", padding: `${layer.fontSize * 0.12}px ${layer.fontSize * 0.45}px`, borderRadius: 9999, display: "inline-block", fontFamily: layer.fontFamily, fontSize: `${layer.fontSize}px`, fontWeight: 900, color: "#fff", transform: "rotate(-2deg)", boxShadow: "0 20px 50px rgba(244,63,94,0.4)" };
                else if (bStyle === 2) priceStyle = { background: "rgba(15,23,42,0.95)", border: `${layer.fontSize * 0.04}px solid #fbbf24`, padding: `${layer.fontSize * 0.12}px ${layer.fontSize * 0.45}px`, borderRadius: `${layer.fontSize * 0.2}px`, display: "inline-block", fontFamily: layer.fontFamily, fontSize: `${layer.fontSize}px`, fontWeight: 900, color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" };
                else if (bStyle === 3) priceStyle = { background: "rgba(255,255,255,0.95)", padding: `${layer.fontSize * 0.12}px ${layer.fontSize * 0.45}px`, borderRadius: 9999, display: "inline-block", fontFamily: layer.fontFamily, fontSize: `${layer.fontSize}px`, fontWeight: 900, color: "#0f172a", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" };
                else if (bStyle === 4) priceStyle = { background: "transparent", display: "inline-block", fontFamily: layer.fontFamily, fontSize: `${layer.fontSize}px`, fontWeight: 900, color: layer.color, textShadow: layer.shadow ? "0 4px 16px rgba(0,0,0,0.95)" : "none" };
              }

              return (
                <div key={layer.id} style={{ position: "absolute", left: `${layer.posX}%`, top: `${layer.posY}%`, transform: "translate(-50%,-50%)", zIndex: 10 + index, width: layer.width, height: layer.height, display: "flex", alignItems: "center", justifyContent: layer.textAlign === "center" ? "center" : layer.textAlign === "right" ? "flex-end" : "flex-start" }}>
                  {isLogo ? (
                    <div style={{ background: "white", borderRadius: layer.fontSize * 0.12, padding: layer.fontSize * 0.08, boxShadow: "0 8px 32px rgba(0,0,0,0.35)", display: "inline-block", maxWidth: '100%' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={layer.text} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", maxWidth: "100%" }} alt="Logo" />
                    </div>
                  ) : isImage ? (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={layer.text} style={{ width: "100%", height: "100%", objectFit: "contain", filter: layer.shadow ? "drop-shadow(0px 10px 20px rgba(0,0,0,0.6))" : "none", pointerEvents: "none" }} alt="Custom Image" />
                    </div>
                  ) : isSocial && layer.fieldKey ? (
                    <div style={{ display: "flex", alignItems: "center", gap: `${layer.fontSize * 0.3}px` }}>
                      <SocialIcon fieldKey={layer.fieldKey} size={layer.fontSize * 0.9} color={layer.color} />
                      <span style={spanStyle}>{layer.text}</span>
                    </div>
                  ) : isPrice ? (
                    <div style={priceStyle}>
                      {layer.text}
                    </div>
                  ) : (
                    <span style={spanStyle}>{layer.text}</span>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── MODO C: Menu Mode (Lista de productos) ── */}
        {screenMenu.isMenuMode && screenMenu.menuItems && screenMenu.menuItems.length > 0 && (() => {
          const s = screenMenu.scale ?? 1;
          const bgHex = screenMenu.bgColor || "#0f172a";
          let r = 15, g = 23, b = 42;
          if (/^#[0-9A-F]{6}$/i.test(bgHex)) {
            r = parseInt(bgHex.slice(1, 3), 16);
            g = parseInt(bgHex.slice(3, 5), 16);
            b = parseInt(bgHex.slice(5, 7), 16);
          }
          const bgOpacity = screenMenu.bgOpacity ?? 0.85;
          const bgRgba = `rgba(${r},${g},${b},${bgOpacity})`;
          const posX = screenMenu.posX ?? 10;
          const posY = screenMenu.posY ?? 60;
          const wPct = screenMenu.width ?? 80;
          const isDual = data.formato === 'tv_h';

          return (
          <div style={{ position: "absolute", zIndex: screenMenu.customZ !== undefined ? screenMenu.customZ : 15, top: `${posY}%`, left: `${posX}%`, width: `${wPct}%`, background: bgRgba, backdropFilter: "blur(20px)", borderRadius: 48 * s, border: `2px solid rgba(255,255,255,0.1)`, padding: `${64 * s}px ${48 * s}px`, color: "white", display: "flex", flexDirection: isDual ? "row" : "column", gap: isDual ? 64 * s : 32 * s, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 * s }}>
              {screenMenu.menuItems.filter((i: any) => i.name || i.price).map((item: any, idx: number) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 * s, borderBottom: `2px dashed rgba(255,255,255,0.2)`, paddingBottom: 16 * s }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: screenMenu.fontName || "Syne, sans-serif", fontSize: 44 * s, fontWeight: 700, color: screenMenu.colorName || "#ffffff", paddingRight: 24 * s, wordBreak: "break-word" }}>{item.name}</span>
                    <span style={{ fontFamily: screenMenu.fontPrice || "'Playfair Display', serif", fontSize: 48 * s, fontWeight: 900, color: screenMenu.colorPrice || "#fbbf24", flexShrink: 0 }}>{item.price}</span>
                  </div>
                  {item.desc && (
                    <span style={{ fontFamily: screenMenu.fontDesc || "Syne, sans-serif", fontSize: 24 * s, color: screenMenu.colorDesc || "rgba(255,255,255,0.7)", fontWeight: 400, marginTop: -4 * s, textAlign: "left", alignSelf: "flex-start", paddingRight: 80 * s }}>
                      {item.desc}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {isDual && screenMenu.menuItems2 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 * s }}>
                {screenMenu.menuItems2.filter((i: any) => i.name || i.price).map((item: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 * s, borderBottom: `2px dashed rgba(255,255,255,0.2)`, paddingBottom: 16 * s }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: screenMenu.fontName || "Syne, sans-serif", fontSize: 44 * s, fontWeight: 700, color: screenMenu.colorName || "#ffffff", paddingRight: 24 * s, wordBreak: "break-word" }}>{item.name}</span>
                      <span style={{ fontFamily: screenMenu.fontPrice || "'Playfair Display', serif", fontSize: 48 * s, fontWeight: 900, color: screenMenu.colorPrice || "#fbbf24", flexShrink: 0 }}>{item.price}</span>
                    </div>
                    {item.desc && (
                      <span style={{ fontFamily: screenMenu.fontDesc || "Syne, sans-serif", fontSize: 24 * s, color: screenMenu.colorDesc || "rgba(255,255,255,0.7)", fontWeight: 400, marginTop: -4 * s, textAlign: "left", alignSelf: "flex-start", paddingRight: 80 * s }}>
                        {item.desc}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Si quisieras agregar titulo fijo aquí podrías, pero el layout de TextLayerEditor ya no lo usa */}
          </div>
          );
        })()}

        {/* ── MODO B: Card clásico (documentos sin textLayers, backward-compat) ── */}
        {!hasLayers && !screenMenu.isMenuMode && (
          <div style={{ position: "absolute", zIndex: 10, bottom: 0, left: 0, right: 0, padding: 64, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", color: "white" }}>
            {data.logo && (
              <div style={{ background: "white", padding: 24, borderRadius: 40, marginBottom: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.logo} style={{ width: 120, height: 120, objectFit: "contain" }} alt="Logo" />
              </div>
            )}
            <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", padding: 48, borderRadius: 48, border: "1px solid rgba(255,255,255,0.2)", maxWidth: 900, width: "100%" }}>
              {data.subtitulo && <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 50, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#fb7185", marginBottom: 16 }}>{data.subtitulo}</h3>}
              {data.titulo && <h1 style={{ fontFamily: "'Anton',sans-serif", fontSize: 110, fontWeight: 900, lineHeight: 1.1, marginBottom: 32, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>{data.titulo}</h1>}
              {data.precio && <div style={{ display: "inline-block", background: "linear-gradient(135deg,#f43f5e,#fb923c)", borderRadius: 9999, padding: "24px 64px", fontSize: 80, fontWeight: 900, fontFamily: "'Anton',sans-serif", boxShadow: "0 20px 50px rgba(244,63,94,0.4)", marginBottom: 32, transform: "rotate(-2deg)" }}>{data.precio}</div>}
              {data.mensaje && <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 42, color: "#e2e8f0", marginTop: 16, lineHeight: 1.4 }}>{data.mensaje}</p>}
            </div>
            {(data.instagram || data.facebook || data.tiktok) && (
              <div style={{ display: "flex", gap: 48, marginTop: 32, fontSize: 35, fontWeight: 700, flexWrap: "wrap", justifyContent: "center" }}>
                {data.instagram && <span style={{ display: "flex", alignItems: "center", gap: 12 }}><IgIcon s={35} c="white" /> {data.instagram}</span>}
                {data.facebook && <span style={{ display: "flex", alignItems: "center", gap: 12 }}><FbIcon s={35} c="white" /> {data.facebook}</span>}
                {data.tiktok && <span style={{ display: "flex", alignItems: "center", gap: 12 }}><TkIcon s={35} c="white" /> {data.tiktok}</span>}
              </div>
            )}
          </div>
        )}
        {/* ── Firma: Se oculta si hay userId (es usuario logueado/pro) ── */}
        {!data.userId && (
          <div style={{ position: "absolute", bottom: "1.5%", right: "2%", zIndex: 30, display: "flex", alignItems: "center", gap: 10, opacity: 0.8 }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.85)", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>hecho con amor</span>
            <span style={{ fontSize: 30 }}>❤️</span>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.85)", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>por digitalbite.app</span>
          </div>
        )}
      </div>
    </>
  );
}