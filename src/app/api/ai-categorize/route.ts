import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { idea, categories } = await req.json();

    if (!idea || !categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: "Missing idea or categories" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ 
        error: "La API de Gemini no está configurada." 
      }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const categoriesList = categories.map(c => c.slug || c.id).join(", ");

    const prompt = `
Eres un clasificador de intenciones para una app de marketing gastronómico.
El usuario quiere generar un fondo para una plantilla usando la siguiente idea/prompt: "${idea}"

Selecciona la categoría de comida que mejor haga match con esa idea de la siguiente lista de categorías disponibles:
[${categoriesList}]

Reglas:
1. Debes responder ÚNICAMENTE con el nombre exacto de UNA categoría de la lista.
2. Si ninguna hace match específico o la idea es muy abstracta, responde "general".
3. No des explicaciones, solo la categoría en minúsculas y sin espacios extra.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().toLowerCase();

    // Verify it's a valid category
    const validMatch = categories.find(c => (c.slug || c.id).toLowerCase() === responseText);
    const categoryId = validMatch ? (validMatch.slug || validMatch.id) : "general";

    return NextResponse.json({ categoryId });

  } catch (err: any) {
    console.error("Gemini Categorize API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
