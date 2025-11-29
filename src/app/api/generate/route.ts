import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: Request) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "No hay API Token" }, { status: 500 });
  }

  const replicate = new Replicate({ auth: token });

  try {
    const body = await request.json();
    const { url, prompt } = body;

    console.log("1. Iniciando predicción para:", url);

    // PASO 1: Creamos la predicción (pero no esperamos la imagen aún)
    let prediction = await replicate.predictions.create({
      version: "zylim0702/qr_code_controlnet:628e604e13cf63d8ec58bd4d238474e8986b054bc5e1326e50995fdbc851c557",
      input: {
        url: url,
        prompt: prompt,
        qr_conditioning_scale: 1.3,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        negative_prompt: "blurry, low quality, ugly, disfigured"
      },
    });

    console.log("2. Predicción creada. ID:", prediction.id);

    // PASO 2: Esperamos a que la IA termine (Polling)
    // replicate.wait preguntará a la API cada segundo si ya terminó
    prediction = await replicate.wait(prediction);

    console.log("3. Estado final:", prediction.status);

    // PASO 3: Verificamos si salió bien
    if (prediction.status === "succeeded") {
        console.log("4. Resultado (Output):", prediction.output);
        // prediction.output suele ser [ "https://..." ]
        return NextResponse.json({ imageUrl: prediction.output });
    } else {
        console.error("Falló la predicción:", prediction.error);
        return NextResponse.json({ error: "La IA falló al generar la imagen" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("ERROR CRÍTICO:", error);
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}