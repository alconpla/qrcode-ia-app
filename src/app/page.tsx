"use client";

import { useState } from "react";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState(
    "A cinematic shot of a an abandoned spaceship in a dark forest, 4k"
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImageUrl(null);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Algo salió mal al generar la imagen.");
      }

      // La API de Replicate devuelve un array de URLs
      if (data.imageUrl && data.imageUrl.length > 0) {
        setImageUrl(data.imageUrl[0]);
      } else {
        throw new Error("La API no devolvió una imagen.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text text-transparent">
          Generador de QR con IA
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl"
        >
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-300"
            >
              URL para el código QR
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/tu-usuario"
              required
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-300"
            >
              Describe la imagen que quieres generar
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Un astronauta en el espacio, arte digital..."
              rows={3}
              required
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url || !prompt}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generando..." : "Generar QR"}
          </button>
        </form>

        {loading && (
          <div className="mt-8 text-center bg-gray-800/50 p-6 rounded-lg">
            <p className="text-gray-300">
              La IA está trabajando... Esto puede tardar hasta 30 segundos.
            </p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-900/50 text-red-300 p-4 rounded-md">
            <p>
              <span className="font-bold">Error:</span> {error}
            </p>
          </div>
        )}

        {imageUrl && !loading && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">¡Tu código QR está listo!</h2>
            <div className="bg-gray-800 p-4 inline-block rounded-lg shadow-2xl">
              <img
                src={imageUrl}
                alt="Código QR generado por IA"
                className="rounded-md mx-auto"
                width="300"
                height="300"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}