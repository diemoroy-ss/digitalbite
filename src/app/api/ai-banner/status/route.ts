import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log(`[STATUS ROUTE] Recibiendo peticion GET: ${req.url}`);
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get("ticketId");

  if (!ticketId) {
    console.warn("[STATUS ROUTE] Faltó el ticketId en la query param");
    return NextResponse.json({ error: "ticketId requerido" }, { status: 400 });
  }

  try {
    console.log(`[STATUS ROUTE] Consultando n8n banner-ia-status para ticket: ${ticketId}`);
    // AHORA n8n espera un GET con el ticketId en la query param
    const n8nResp = await fetch(
      `https://n8n.digitalbite.app/webhook/banner-ia-status?ticketId=${ticketId}`,
      { method: "GET" }
    );

    console.log(`[STATUS ROUTE] n8n respondio con HTTP ${n8nResp.status}`);


    if (!n8nResp.ok) {
      const errText = await n8nResp.text().catch(() => "");
      console.error(`[STATUS ROUTE] n8n error payload: ${errText}`);
      
      // Si n8n responde 404, el webhook no existe o está apagado. Detenemos el polling.
      if (n8nResp.status === 404) {
        return NextResponse.json({ status: "error", error: "El webhook n8n banner-ia-status no está activo (Error 404)." }, { status: 404 });
      }

      return NextResponse.json({ status: "pending", _debug: `n8n_http_${n8nResp.status}` });
    }

    const data = await n8nResp.json();
    console.log(`[STATUS ROUTE] n8n devolvio JSON:`, JSON.stringify(data));
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[STATUS ROUTE] Fetch a n8n fallo:", err.message);
    return NextResponse.json({ status: "pending", _debug: err.message });
  }
}



