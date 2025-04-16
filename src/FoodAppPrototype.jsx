// Frontend: Tekstbasert matvareanalyse (React + Vite)
import React, { useState } from "react";

export default function FoodTextAnalyzer() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const response = await fetch("https://matassistent.onrender.com/text-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      console.error("Feil ved analyse:", err);
      setResult("Noe gikk galt. Prøv igjen senere.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-4">📝 Tekstbasert Matanalyse</h1>
      <input
        type="text"
        placeholder="Skriv en matvare, f.eks. 'avokado'"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full border px-4 py-2 rounded mb-4"
      />
      <button
        onClick={handleAnalyze}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Analyserer..." : "Analyser matvare"}
      </button>

      {result && (
        <div className="mt-6 whitespace-pre-wrap bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">📊 Resultat:</h2>
          {result}
        </div>
      )}
    </div>
  );
}
