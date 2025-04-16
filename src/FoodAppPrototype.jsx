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
  const [textInput, setTextInput] = useState("");
  const [textResult, setTextResult] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    const response = await fetch("https://matassistent.onrender.com/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    const data = await response.json();
    setIdentifiedFood(data.food);
    setNutrition(data.nutrition);
  };

  const analyzeText = async () => {
    const response = await fetch("https://matassistent.onrender.com/text-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textInput }),
    });
    const data = await response.json();
    setTextResult(data.result);
  };

  const addToIntake = () => {
    if (identifiedFood && nutrition) {
      setIntake([...intake, { name: identifiedFood, ...nutrition }]);
      setIdentifiedFood("");
      setNutrition(null);
      setImage(null);
    }
  };

  const totalCalories = intake.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Matassistent</h1>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-lg">📷 Bildeanalyse</h2>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {image && <img src={image} alt="Matbilde" className="w-full max-w-sm" />}
          <Button onClick={analyzeImage}>Analyser bilde</Button>

          {identifiedFood && (
            <div className="pt-4">
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
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-lg">✍️ Tekstanalyse</h2>
          <Input
            type="text"
            placeholder="Skriv inn matvare, f.eks. Banan"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <Button onClick={analyzeText}>Analyser matvare</Button>

          {textResult && (
            <div className="pt-4 whitespace-pre-wrap">
              <h3 className="font-semibold">Resultat:</h3>
              <p>{textResult}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">🗒️ Dagens inntak</h2>
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
    </div>
  );
}
