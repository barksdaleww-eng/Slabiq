import { useState } from "react";

function App() {
  const [card, setCard] = useState({
    player: "", year: "", brand: "", parallel: "", grade: "", currentValue: ""
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const brands = ["Panini Prizm", "Bowman Chrome", "Topps Chrome", "Panini Optic", "Select", "National Treasures", "Fleer Ultra", "Upper Deck", "Other"];
  const grades = ["Raw (Ungraded)", "PSA 10", "PSA 9", "PSA 8", "BGS 10 Black", "BGS 9.5", "BGS 9", "SGC 10", "SGC 9.5"];

  const handlePredict = async () => {
    if (!card.player || !card.year || !card.brand || !card.currentValue) {
      alert("Please fill in at least Player, Year, Brand and Current Value");
      return;
    }
    setLoading(true);
    setPrediction(null);

    const prompt = `You are a sports card investment expert. Analyze this card and give value predictions.

Card Details:
- Player: ${card.player}
- Year: ${card.year}
- Brand: ${card.brand}
- Parallel/Variation: ${card.parallel || "Base"}
- Grade: ${card.grade || "Raw"}
- Current Market Value: $${card.currentValue}

Respond ONLY with a JSON object, no other text:
{
  "oneYear": 00,
  "fiveYear": 00,
  "tenYear": 00,
  "lifetime": 00,
  "verdict": "BUY / HOLD / SELL",
  "reason": "2-3 sentence explanation",
  "keyFactors": ["factor1", "factor2", "factor3"]
}`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || JSON.stringify(data));
      }
      const text = data.content[0].text;
      const clean = text.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);
      setPrediction(result);
    } catch (err) {
      alert("Prediction failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-400">SlabIQ</span>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">BETA</span>
        </div>
        <nav className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white">Predict</a>
          <a href="#" className="hover:text-white">Marketplace</a>
          <a href="#" className="hover:text-white">Academy</a>
          <a href="#" className="hover:text-white">Portfolio</a>
        </nav>
        <div className="flex gap-3">
          <button className="text-sm text-gray-400 hover:text-white">Log in</button>
          <button className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold">Get Started</button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-16 px-6">
        <h1 className="text-5xl font-black mb-4">
          Know What Your Cards Are <span className="text-blue-400">Worth Tomorrow</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          AI-powered value predictions built for serious collectors.
        </p>
      </section>

      {/* Prediction Tool */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">🔮 Predict Card Value</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Player Name *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Patrick Mahomes"
                value={card.player}
                onChange={e => setCard({...card, player: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Year *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="e.g. 2018"
                value={card.year}
                onChange={e => setCard({...card, year: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Brand *</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                value={card.brand}
                onChange={e => setCard({...card, brand: e.target.value})}
              >
                <option value="">Select brand...</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Parallel / Variation</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Silver Prizm /199"
                value={card.parallel}
                onChange={e => setCard({...card, parallel: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Grade</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                value={card.grade}
                onChange={e => setCard({...card, grade: e.target.value})}
              >
                <option value="">Select grade...</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Current Value ($) *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="e.g. 250"
                value={card.currentValue}
                onChange={e => setCard({...card, currentValue: e.target.value})}
              />
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 py-4 rounded-xl font-bold text-lg mt-2"
          >
            {loading ? "Analyzing card..." : "Get AI Prediction →"}
          </button>
        </div>

        {/* Results */}
        {prediction && (
          <div className="mt-6 bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">📈 Value Forecast</h2>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "1 Year", value: prediction.oneYear },
                { label: "5 Years", value: prediction.fiveYear },
                { label: "10 Years", value: prediction.tenYear },
                { label: "Lifetime", value: prediction.lifetime },
              ].map(item => (
                <div key={item.label} className="bg-gray-800 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm mb-1">{item.label}</div>
                  <div className="text-2xl font-black text-green-400">${item.value}</div>
                </div>
              ))}
            </div>

            <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg mb-4 ${
              prediction.verdict === "BUY" ? "bg-green-600" :
              prediction.verdict === "HOLD" ? "bg-yellow-600" : "bg-red-600"
            }`}>
              {prediction.verdict}
            </div>

            <p className="text-gray-300 mb-4">{prediction.reason}</p>

            <div>
              <div className="text-sm text-gray-400 mb-2">Key Factors:</div>
              <div className="flex flex-wrap gap-2">
                {prediction.keyFactors.map(f => (
                  <span key={f} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">{f}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;