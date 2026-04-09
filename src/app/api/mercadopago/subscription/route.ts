import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// MP Client
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(req: Request) {
  try {
    const { userId, userEmail, planName, price, planId } = await req.json();

    if (!userId || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const preapproval = new PreApproval(client);
    
    // Create the recurring payment link
    const result = await preapproval.create({
      body: {
        reason: `Suscripción ${planName || 'Pro'} - DigitalBite`,
        external_reference: `${userId}___${planId}`, // We encode userId and planId to read it in the webhook
        payer_email: userEmail || "test_user@testuser.com",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: Number(price),
          currency_id: "CLP"
        },
        back_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?subscription=success`,
        status: "pending"
      }
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("MP PreApproval Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
