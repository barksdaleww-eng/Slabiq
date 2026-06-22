import { useState } from "react";
import Academy from "./Academy";

const HEAT = {
  fire: { label: "🔥 Fire", desc: "Extremely high demand", bg: "bg-orange-600", text: "text-orange-400", border: "border-orange-600" },
  hot:  { label: "🌶️ Hot",  desc: "Strong sales activity",  bg: "bg-red-600",    text: "text-red-400",    border: "border-red-600"    },
  warm: { label: "☀️ Warm", desc: "Moderate interest",      bg: "bg-yellow-600", text: "text-yellow-400", border: "border-yellow-600" },
  cold: { label: "❄️ Cold", desc: "Low demand right now",   bg: "bg-blue-700",   text: "text-blue-400",   border: "border-blue-700"   },
};

const VERDICT_COLOR = { BUY: "bg-green-600", HOLD: "bg-yellow-600", SELL: "bg-red-600" };

function Header({ page, setPage }) {
  return (
    <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage("home")}>
        <span className="text-2xl font-black text-blue-400">SlabIQ</span>
        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">BETA</span>
      </div>
      <nav className="flex gap-6 text-sm">
        <button
          onClick={() => setPage("home")}
          className={page === "home" ? "text-white font-semibold" : "text-gray-400 hover:text-white"}
        >
          Predict
        </button>
        <button
          onClick={() => setPage("academy")}
          className={page === "academy" ? "text-white font-semibold" : "text-gray-400 hover:text-white"}
        >
          Academy
        </button>
        <a href="#" className="text-gray-400 hover:text-white">Marketplace</a>
        <a href="#" className="text-gray-400 hover:text-white">Portfolio</a>
      </nav>
      <div className="flex gap-3">
        <button className="text-sm text-gray-400 hover:text-white">Log in</button>
        <button className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold">Get Started</button>
      </div>
    </header>
  );
}

function PlayerIntel() {
  const [query, setQuery] = useState("");
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIntel = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setIntel(null);
    setError(null);
    try {
      const res = await fetch(`/api/player-intel?player=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch player intel");
      setIntel(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const heat = intel ? (HEAT[intel.heat] || HEAT.warm) : null;

  return (
    <section className="max-w-3xl mx-auto px-6 pb-10">
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold mb-2">📡 Player Intel</h2>
        <p className="text-gray-400 text-sm mb-6">
          Real-time news, injury reports & stats — powered by Claude AI web search.
        </p>

        <form onSubmit={fetchIntel} className="flex gap-3 mb-2">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="e.g. Ja Morant, Patrick Mahomes, Juan Soto"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 px-6 py-3 rounded-lg font-semibold whitespace-nowrap"
          >
            {loading ? "Searching..." : "Get Intel →"}
          </button>
        </form>
        <p className="text-xs text-gray-600 mb-4">Searches live web sources — may take 10–20 seconds</p>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 mt-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 mt-6 text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Scanning ESPN, injury reports, and recent news...
          </div>
        )}

        {intel && (
          <div className={`mt-6 rounded-xl border-2 ${heat.border} bg-gray-800/60 p-6`}>
            {/* Header row */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-2xl font-black">{intel.playerName}</h3>
                <div className="text-gray-400 text-sm mt-0.5">{intel.sport} · {intel.team}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${heat.bg}`}>
                  {heat.label}
                </span>
                <span className={`px-3 py-1 rounded-lg font-bold text-sm ${VERDICT_COLOR[intel.cardOutlook] || "bg-gray-600"}`}>
                  Cards: {intel.cardOutlook}
                </span>
              </div>
            </div>

            {/* Injury */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold mb-5 ${
              intel.injuryStatus === "Healthy" || intel.injuryStatus === "Active"
                ? "bg-green-900 text-green-300"
                : intel.injuryStatus === "Out" || intel.injuryStatus === "IR"
                ? "bg-red-900 text-red-300"
                : "bg-yellow-900 text-yellow-300"
            }`}>
              <span className="w-2 h-2 rounded-full bg-current inline-block" />
              {intel.injuryStatus}
              {intel.injuryDetail && <span className="font-normal">· {intel.injuryDetail}</span>}
            </div>

            {/* Heat reason */}
            <p className={`text-sm mb-5 ${heat.text}`}>{intel.heatReason}</p>

            {/* Headlines */}
            {intel.headlines?.length > 0 && (
              <div className="mb-5">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Latest Headlines</div>
                <div className="space-y-2">
                  {intel.headlines.map((h, i) => (
                    <div key={i} className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-white leading-tight">{h.title}</span>
                        <span className="text-xs text-gray-500 shrink-0">{h.source}</span>
                      </div>
                      <p className="text-xs text-gray-400">{h.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats + Outlook */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Recent Performance</div>
                <p className="text-sm text-gray-300">{intel.recentStats}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Card Value Outlook</div>
                <p className="text-sm text-gray-300">{intel.outlookReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function HomePage() {
  const [card, setCard] = useState({
    player: "", year: "", brand: "", parallel: "", grade: "", currentValue: ""
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

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
      if (!res.ok) throw new Error(data.error || JSON.stringify(data));
      const text = data.content[0].text;
      const clean = text.replace(/```json|```/g, "").trim();
      setPrediction(JSON.parse(clean));
    } catch (err) {
      alert("Prediction failed: " + err.message);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults(null);
    setSearchError(null);
    try {
      const res = await fetch(`/api/ebay?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setSearchResults(data);
    } catch (err) {
      setSearchError(err.message);
    }
    setSearchLoading(false);
  };

  return (
    <>
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
      <section className="max-w-3xl mx-auto px-6 pb-10">
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
            <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg mb-4 ${VERDICT_COLOR[prediction.verdict] || "bg-gray-600"}`}>
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

      {/* Player Intel */}
      <PlayerIntel />

      {/* eBay Card Search */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-2">🔍 eBay Sold Listings</h2>
          <p className="text-gray-400 text-sm mb-6">Search real sold prices to compare against the AI prediction.</p>

          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <input
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Patrick Mahomes Prizm rookie PSA 10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 px-6 py-3 rounded-lg font-semibold whitespace-nowrap"
            >
              {searchLoading ? "Searching..." : "Search eBay →"}
            </button>
          </form>

          {searchError && (
            <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 mb-4">
              {searchError}
            </div>
          )}

          {searchResults && (
            <>
              <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-800 rounded-xl">
                <div>
                  <span className="text-gray-400 text-sm">Avg Sold Price</span>
                  <div className="text-2xl font-black text-green-400">${searchResults.avg}</div>
                </div>
                <div className="w-px h-10 bg-gray-700" />
                <div>
                  <span className="text-gray-400 text-sm">Recent Sales</span>
                  <div className="text-2xl font-black text-white">{searchResults.count}</div>
                </div>
                <div className="w-px h-10 bg-gray-700" />
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Market Heat</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${HEAT[searchResults.heat].bg}`}>
                    {HEAT[searchResults.heat].label}
                  </span>
                </div>
                <div className={`ml-auto text-sm ${HEAT[searchResults.heat].text}`}>
                  {HEAT[searchResults.heat].desc}
                </div>
              </div>

              {searchResults.items.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No sold listings found. Try a broader search.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[680px] overflow-y-auto pr-1">
                  {searchResults.items.map(item => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors group flex flex-col"
                    >
                      <div className="aspect-[3/4] bg-gray-700 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">🃏</div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <p className="text-xs text-gray-300 line-clamp-2 mb-2 flex-1">{item.title}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-green-400 font-black text-lg">${item.price.toFixed(2)}</span>
                          <span className="text-xs text-blue-400 group-hover:underline">View →</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header page={page} setPage={setPage} />
      {page === "home" ? <HomePage /> : <Academy />}
    </div>
  );
}
