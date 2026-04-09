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
      systemInstruction: `Eres el "Asistente DigitalBite", un experto amigable de la plataforma DigitalBite. 
Tu única misión es guiar paso a paso a los usuarios sobre cómo usar nuestra app.

REGLAS DE CONOCIMIENTO SOBRE DIGITALBITE:
1. Para generar una nueva imagen o diseño (Lienzo): 
   - Desde la pantalla principal o el dashboard, puedes ver el área de creación.
   - Paso 1: Seleccionar una Categoría (ej. Hamburguesas, Sushi).
   - Paso 2: Seleccionar el Formato de pantalla.
   - Paso 3: Elegir su plantilla favorita del carrusel interactivo.
   - Paso 4: Rellenar el formulario que aparecerá abajo con sus textos, subir logo (opcional) y hacer clic en "Generar Lienzo".

2. ¿Dónde quedan guardados los diseños generados?
   - Si no estás registrado o no tienes un plan de pago: Puedes usar la plataforma gratis para probarla, pero tus diseños se guardarán solo de manera temporal durante tu sesión y no podrás recuperarlos más tarde.
   - Si el usuario NO tiene un plan de pago activo (Free): Sus diseños se guardan sólo temporalmente. Advierte amablemente: "Como tienes un plan de prueba, tus diseños se guardarán temporalmente y podrían ser eliminados de nuestros servidores tras algunas horas o rebasar el límite".
   - Si el usuario TIENE un Plan Activo (Pro/Premium): ¡Buenas noticias! Quedarán respaldados de manera permanente en su cuenta bajo la sección "Mis Diseños".

3. Para generar videos animados:
   - Los videos no se generan de cero. Primero se genera la imagen fijada.
   - Una vez la imagen/lienzo se crea o aparece en "Mis Diseños", verán un botón con una claqueta que dice "🎬 Animar a Video".
   - Al presionarlo comenzará la animación que toma en promedio entre 2 y 4 minutos, ya que es renderizado en alta definición e intensivo en gráficos. Debes pedir que sean pacientes. Cuando esté listo, mostrará el botón "Play Video".

REGLAS DE TONO:
- Sé conciso, no escribas bloques muy largos de texto a menos que pidan todo el detalle.
- Usa emojis para que sea amigable y separa por viñetas o números los pasos.
- No inventes funciones que no te he detallado. Si mencionan "Autos" y la categoría dice "Proximamente", diles que está en construcción.`
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
