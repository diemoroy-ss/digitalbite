import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// MP Client
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(req: Request) {
  try {
    const { userId, userEmail, price, description, itemTitle } = await req.json();

    if (!userId || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pref = new Preference(client);
    
    console.log("BASE_URL IS:", process.env.NEXT_PUBLIC_BASE_URL);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.startsWith('http') ? process.env.NEXT_PUBLIC_BASE_URL.replace(/[\r\n].*/g, '').replace(/[^a-zA-Z0-9://.-]/g, '') : 'http://localhost:3001';

    const preferenceBody = {
      items: [
        {
          id: "PAY_PER_USE",
          title: itemTitle || "Archivo generado - DigitalBite",
          description: description || "Pago por uso de generación única.",
          quantity: 1,
          unit_price: Number(price),
          currency_id: "CLP"
        }
      ],
      payer: {
        email: userEmail || "test_user@testuser.com"
      },
      external_reference: userId,
      back_urls: {
        success: `${baseUrl}/dashboard?payment=success`,
        pending: `${baseUrl}/dashboard`,
        failure: `${baseUrl}/dashboard?payment=failure`
      }
    };

    console.log("SENDING TO MP:", JSON.stringify({ body: preferenceBody }, null, 2));
    require("fs").writeFileSync("debug_mp_payload.json", JSON.stringify(preferenceBody, null, 2));

    // We pass userId via external_reference so the webhook knows who paid
    const result = await pref.create({
      body: preferenceBody as any
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("MP Preference Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
