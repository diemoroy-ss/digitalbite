import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found in process.env");
      return NextResponse.json({ 
        error: "La API de Gemini no está configurada en el servidor (Falta GEMINI_API_KEY en .env)." 
      }, { status: 500 });
    }

    // Using gemini-2.5-flash which is fast and supports text/multimodal tasks
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Add marketing/expert persona constraint for better results
    const systemInstruction = `Eres un experto publicista y diseñador de contenido para redes sociales (enfocado en gastronomía y automotriz). 
Tu trabajo es responder a la siguiente solicitud del usuario dando ideas atractivas, concisas y listas para usar en banners publicitarios. 
Usa emojis moderadamente. Estructura bien tu respuesta (Títulos cortos, Slogans con gancho).`;

    const finalPrompt = `${systemInstruction}\n\nSolicitud del usuario:\n${prompt}`;

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();

    return NextResponse.json({ text });

  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
