import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || url.searchParams.get("topic");
    const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");

    const bodyStr = await req.text();
    let body = {};
    try { body = JSON.parse(bodyStr); } catch(e){}

    if (!dataId) {
      return NextResponse.json({ success: true, warning: 'No ID provided' });
    }

    if (type === "payment") {
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: dataId });
      
      if (payment.status === "approved" && payment.external_reference) {
        const userId = payment.external_reference;
        const itemName = payment.additional_info?.items?.[0]?.id; // e.g. PAY_PER_USE
        
        // MODO PAY_PER_USE (Credits)
        if (itemName === "PAY_PER_USE") {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
             // Incrementar límite en 1 (o dar un crédito temporal, dependiendo de tu lógica exacta).
             // Por ejemplo, le sumamos 1 a su límite para que pueda restarlo al descargar.
             const currentLimit = userSnap.data().generationLimit || 0;
             await updateDoc(userRef, {
               generationLimit: currentLimit + 1
             });
          }
        }
      }
    } else if (type === "subscription_preapproval") {
      const preapprovalClient = new PreApproval(client);
      const preapproval = await preapprovalClient.get({ id: dataId });

      if (preapproval.status === "authorized" && preapproval.external_reference) {
        // external_reference tiene formato "userId___planId"
        const [userId, planId] = preapproval.external_reference.split("___");
        
        const userRef = doc(db, "users", userId);
        const planRef = doc(db, "planes", planId);
        
        const [userSnap, planSnap] = await Promise.all([
          getDoc(userRef), getDoc(planRef)
        ]);

        if (userSnap.exists() && planSnap.exists()) {
          const planData = planSnap.data();
          await updateDoc(userRef, {
            planId: planId,
            plan: planData.name,
            generationLimit: planData.generationLimit,
            videoLimit: planData.videoLimit,
            // Reset de conteos mensuales
            generationCount: 0,
            videoGenerationCount: 0
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("MP Webhook Error:", error);
    // Return 200 anyway so MP doesn't keep retrying forever if it's a bug on our side that we will fix later
    return NextResponse.json({ error: error.message }, { status: 200 }); 
  }
}
