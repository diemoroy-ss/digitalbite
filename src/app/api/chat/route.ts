import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { history, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found in process.env");
      return NextResponse.json({ 
        error: "La API de Gemini no está configurada en el servidor (Falta GEMINI_API_KEY en .env)." 
      }, { status: 500 });
    }

    // Usamos gemini-2.5-flash para chat
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Eres el "Asistente DigitalBite", un experto amigable de la plataforma DigitalBite y un Agente de Éxito del Cliente.
Tu misión principal es guiar a los usuarios, resolver sus dudas y PERFILARLOS suavemente para identificar oportunidades de negocio (SDR).

REGLAS DE CONOCIMIENTO SOBRE DIGITALBITE:
1. Para generar una nueva imagen: Ir al área de creación -> Seleccionar Categoría -> Seleccionar Formato -> Elegir plantilla -> Rellenar formulario y "Generar Lienzo".
2. Guardado de diseños: Los usuarios gratis solo guardan temporalmente. Los usuarios Pro/Premium (Kitchen Partners) guardan permanentemente en "Mis Diseños".
3. Generar videos: Primero generar imagen fija. Luego, en "Mis Diseños", hacer clic en "🎬 Animar a Video". Toma 2-4 minutos en renderizar en HD.

REGLAS DE CALIFICACIÓN INTELIGENTE (SDR) Y PROSPECCIÓN:
Durante la conversación, de forma natural y conversacional (no como cuestionario policiaco), intenta hacer preguntas para obtener esta información:
- ¿Cómo se llama su restaurante o negocio?
- ¿Qué tipo de comida venden?
- ¿Tienen un solo local o múltiples sucursales?
- ¿Utilizan pantallas (Menu Boards/TVs) en sus locales, o solo usan redes sociales?

ESTRATEGIAS DE CIERRE Y DERIVACIÓN:
- Si el usuario muestra interés en tener diseños propios, subir sus propios platos o responde que tiene **múltiples locales/sucursales**, identifícalo como un "Kitchen Partner" de alto valor.
- A estos usuarios de alto valor, recomiéndales fuertemente agendar una "Consultoría sin costo" usando este mensaje persuasivo: 
  "¡Increíble! Para negocios como el tuyo que buscan escalar, ofrecemos una consultoría sin costo donde hacemos una auditoría visual de tu marca y te armamos un paquete inicial de diseños con IA específicos para ti. ¿Te gustaría hablar con un asesor? Puedes hacer clic aquí para reservar tu cupo: https://wa.me/56900000000?text=Hola%2C%20quiero%20reservar%20mi%20cupo%20gratuito%20de%20consultor%C3%ADa%20DigitalBite"
- Si el usuario es pequeño (un solo local o solo redes sociales), enfócate en ayudarle a usar la demo gratis para demostrarle el valor de la plataforma. Recuérdale que con el plan PRO desbloqueará marca de agua y descargas.

REGLAS DE TONO:
- Sé conciso, amigable y muy servicial. Usa emojis.
- Resuelve sus dudas técnicas primero, luego haz una o máximo dos preguntas de calificación por mensaje.
- Nunca seas agresivo vendiendo. La venta debe ser consultiva ("¿Has pensado en...?").`
    });

    // Iniciar el chat con el historial que viene del frontend
    // Google AI sdk espera el formato: { role: "user" | "model", parts: [{ text: "..." }] }
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    // Enviar el nuevo mensaje
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return NextResponse.json({ text });

  } catch (err: any) {
    console.error("Gemini Chat API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
