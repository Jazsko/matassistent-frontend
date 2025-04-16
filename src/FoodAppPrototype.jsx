// Frontend: React-komponent med bildeopplasting og visning
import React, { useState } from "react";

const Button = (props) => (
  <button className="bg-blue-500 text-white py-2 px-4 rounded" {...props}>
    {props.children}
  </button>
);

const Input = (props) => (
  <input className="border border-gray-300 rounded px-3 py-2 w-full" {...props} />
);

const Card = ({ children }) => (
  <div className="border rounded-xl shadow-md p-4 my-4">{children}</div>
);
const CardContent = ({ children }) => <div>{children}</div>;

export default function FoodAppPrototype() {
  const [image, setImage] = useState(null);
  const [identifiedFood, setIdentifiedFood] = useState("");
  const [nutrition, setNutrition] = useState(null);
  const [intake, setIntake] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setLog((prev) => [...prev, "✅ Bilde lastet opp"]);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    setLog((prev) => [...prev, "🔍 Knapp trykket"]);

    if (!image) {
      setError("Du må laste opp et bilde først.");
      setLog((prev) => [...prev, "❌ Ingen bilde funnet"]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setLog((prev) => [...prev, "📤 Sender bilde til backend..."]);

      const response = await fetch(import.meta.env.VITE_API_URL + "/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Serverfeil: ${text}`);
      }

      const data = await response.json();
      console.log("Svar fra backend:", data);

      setLog((prev) => [...prev, "✅ Svar mottatt", JSON.stringify(data, null, 2)]);

      if (!data.food || !data.nutrition) {
        setError("Fikk ikke gyldig informasjon tilbake fra analysen.");
        setIdentifiedFood("");
        setNutrition(null);
      } else {
        setIdentifiedFood(data.food);
        setNutrition(data.nutrition);
      }
    } catch (error) {
      console.error("Feil ved analyse:", error);
      setError("Noe gikk galt under bildeanalysen. Prøv igjen.");
      setLog((prev) => [...prev, `❌ Feil: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const addToIntake = () => {
    if (identifiedFood && nutrition) {
      setIntake([...intake, { name: identifiedFood, ...nutrition }]);
      setIdentifiedFood("");
      setNutrition(null);
      setImage(null);
    }
  };

  const totalCalories = intake.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Matassistent</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {image && <img src={image} alt="Matbilde" className="w-full max-w-sm" />}
          <Button onClick={analyzeImage}>{loading ? "Analyserer..." : "Analyser bilde"}</Button>
          {error && <p className="text-red-600 font-semibold">{error}</p>}

          {!loading && !identifiedFood && !error && <p className="text-gray-500">Ingen analyse utført ennå.</p>}

          {identifiedFood && nutrition && (
            <div>
              <h2 className="text-xl font-semibold">Identifisert: {identifiedFood}</h2>
              <p><strong>Kalorier:</strong> {nutrition.calories} kcal</p>
              <p><strong>Proteiner:</strong> {nutrition.protein}</p>
              <p><strong>Fett:</strong> {nutrition.fat}</p>
              <p><strong>Karbohydrater:</strong> {nutrition.carbs}</p>
              <p><strong>Fordeler:</strong> {nutrition.benefits}</p>
              <p><strong>Vitaminer og mineraler:</strong></p>
              <ul className="list-disc list-inside">
                {nutrition.details.map((item, idx) => (
                  <li key={idx}><strong>{item.name}</strong>: {item.function}</li>
                ))}
              </ul>
              <Button onClick={addToIntake} className="mt-2">Legg til i dagbok</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">Dagens inntak</h2>
          {intake.length === 0 ? <p>Ingen mat registrert ennå.</p> : (
            <ul className="space-y-1">
              {intake.map((item, idx) => (
                <li key={idx}>{item.name} – {item.calories} kcal</li>
              ))}
            </ul>
          )}
          <p className="mt-2 font-bold">Totalt: {totalCalories} kcal</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="text-sm text-gray-600 bg-gray-50">
          <h2 className="text-md font-semibold">Debug-logg:</h2>
          <ul className="list-disc list-inside whitespace-pre-wrap">
            {log.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
