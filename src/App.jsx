import { useState, useEffect, useRef } from "react";
import Academy from "./Academy";

// ─── Constants ────────────────────────────────────────────────────────────────

const HEAT = {
  fire: { label: "🔥 Fire",  desc: "Extremely high demand", bg: "bg-orange-600", text: "text-orange-400", border: "border-orange-500" },
  hot:  { label: "🌶️ Hot",   desc: "Strong sales activity",  bg: "bg-red-600",    text: "text-red-400",    border: "border-red-500"    },
  warm: { label: "☀️ Warm",  desc: "Moderate interest",      bg: "bg-yellow-600", text: "text-yellow-400", border: "border-yellow-500" },
  cold: { label: "❄️ Cold",  desc: "Low demand right now",   bg: "bg-blue-700",   text: "text-blue-400",   border: "border-blue-600"   },
};

const VERDICT = { BUY: "bg-green-600", HOLD: "bg-yellow-600", SELL: "bg-red-600" };
const SPORT_COLOR = { NBA: "text-orange-400", NFL: "text-green-400", MLB: "text-blue-400", NHL: "text-cyan-400" };

const BRANDS = ["Panini Prizm","Bowman Chrome","Topps Chrome","Panini Optic","Select","National Treasures","Fleer Ultra","Upper Deck","Other"];
const GRADES = ["Raw (Ungraded)","PSA 10","PSA 9","PSA 8","BGS 10 Black","BGS 9.5","BGS 9","SGC 10","SGC 9.5"];

// ─── Small shared UI ──────────────────────────────────────────────────────────

function Spinner({ text = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-gray-400 py-4">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function SectionBox({ title, icon, children, className = "" }) {
  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 p-5 ${className}`}>
      <h3 className="font-bold text-base mb-4 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

// ─── Card Alert Banner ────────────────────────────────────────────────────────

function AlertBanner({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  return (
    <div className="border-b border-orange-900 bg-orange-950/60">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center gap-3 px-6 py-2.5 text-sm">
          <span className="text-orange-400 font-black shrink-0">🔥 CARD ALERT</span>
          <span className="text-orange-200 flex-1">
            <span className="font-semibold">{a.player}</span> trending —{" "}
            {a.alertCard} {a.alertStat && <span className="text-orange-400 font-bold">{a.alertStat}</span>}
          </span>
          <button onClick={() => onDismiss(i)} className="text-orange-700 hover:text-orange-400 text-xs ml-auto shrink-0">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function MarketTicker({ movers }) {
  if (!movers) return null;
  const items = [
    ...(movers.gainers || []).map(g => ({ label: g.player, val: g.change, up: true })),
    ...(movers.losers  || []).map(l => ({ label: l.player, val: l.change, up: false })),
  ];
  if (!items.length) return null;
  const repeated = [...items, ...items, ...items];
  return (
    <div className="border-b border-gray-800 bg-gray-950 overflow-hidden">
      <div className="flex items-center">
        <span className="shrink-0 text-xs font-bold text-blue-400 px-3 py-2 border-r border-gray-800 bg-gray-900">MARKET</span>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-6 animate-[ticker_30s_linear_infinite] whitespace-nowrap py-2 px-4">
            {repeated.map((item, i) => (
              <span key={i} className="text-xs shrink-0">
                <span className="text-gray-300 font-medium">{item.label}</span>{" "}
                <span className={item.up ? "text-green-400 font-bold" : "text-red-400 font-bold"}>{item.val}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Player Intel Panel ───────────────────────────────────────────────────────

function PlayerIntelPanel({ onPrefill, onAlert }) {
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
      if (!res.ok) throw new Error(data.error || "Failed");
      setIntel(data);
      if (data.alertCard && (data.heat === "fire" || data.heat === "hot")) {
        onAlert(data);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const heat = intel ? (HEAT[intel.heat] || HEAT.warm) : null;
  const injuryColor =
    !intel ? "" :
    intel.injuryStatus === "Healthy" || intel.injuryStatus === "Active" ? "bg-green-900/50 text-green-300 border-green-700" :
    intel.injuryStatus === "Out" || intel.injuryStatus === "IR" ? "bg-red-900/50 text-red-300 border-red-700" :
    "bg-yellow-900/50 text-yellow-300 border-yellow-700";

  return (
    <SectionBox title="Player Intel" icon="📡">
      <p className="text-xs text-gray-500 mb-3">Claude AI searches live news, injury reports &amp; stats</p>
      <form onSubmit={fetchIntel} className="flex gap-2 mb-4">
        <input
          className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          placeholder="e.g. Ja Morant, Patrick Mahomes"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 px-3 py-2 rounded-lg text-sm font-semibold shrink-0"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {loading && <Spinner text="Scanning live news sources..." />}
      {error && <p className="text-red-400 text-xs">{error}</p>}

      {intel && (
        <div className={`rounded-xl border ${heat.border} bg-gray-800/40 p-4 space-y-3`}>
          {/* Name + badges */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-black text-lg leading-tight">{intel.playerName}</div>
              <div className="text-xs text-gray-400">{intel.sport} · {intel.team}</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${heat.bg}`}>{heat.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${VERDICT[intel.cardOutlook] || "bg-gray-600"}`}>
                Cards: {intel.cardOutlook}
              </span>
            </div>
          </div>

          {/* Injury pill */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${injuryColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {intel.injuryStatus}
            {intel.injuryDetail && <span className="font-normal opacity-80">· {intel.injuryDetail}</span>}
          </div>

          {/* Heat reason */}
          <p className={`text-xs ${heat.text}`}>{intel.heatReason}</p>

          {/* Headlines */}
          {intel.headlines?.length > 0 && (
            <div className="space-y-2">
              {intel.headlines.slice(0, 3).map((h, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-2.5">
                  <div className="flex justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-white leading-snug">{h.title}</span>
                    <span className="text-[10px] text-gray-500 shrink-0">{h.source}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{h.summary}</p>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Recent Performance</div>
            <p className="text-xs text-gray-300">{intel.recentStats}</p>
          </div>

          {/* Card outlook */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Card Value Outlook</div>
            <p className="text-xs text-gray-300">{intel.outlookReason}</p>
          </div>

          {/* Pre-fill button */}
          <button
            onClick={() => onPrefill(intel)}
            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm font-bold mt-1"
          >
            View Card Prediction for {intel.playerName} →
          </button>
        </div>
      )}
    </SectionBox>
  );
}

// ─── Market Movers Panel ─────────────────────────────────────────────────────

function MarketMoversPanel() {
  const [movers, setMovers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch("/api/market-movers");
      const data = await res.json();
      if (res.ok) { setMovers(data); setLoaded(true); }
    } catch {}
    setLoading(false);
  };

  return (
    <SectionBox title="Market Movers" icon="📊">
      {!loaded && !loading && (
        <button
          onClick={load}
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 py-2.5 rounded-lg text-sm font-semibold text-gray-300"
        >
          Load Today's Market Data →
        </button>
      )}
      {loading && <Spinner text="Scanning card market news..." />}

      {movers && (
        <div className="space-y-4">
          {movers.headline && (
            <p className="text-xs text-blue-300 bg-blue-950/50 border border-blue-800 rounded-lg px-3 py-2">{movers.headline}</p>
          )}

          {/* Gainers */}
          <div>
            <div className="text-[10px] text-green-400 font-bold uppercase mb-1.5 flex items-center gap-1">
              <span>▲</span> Top Gainers
            </div>
            <div className="space-y-1.5">
              {movers.gainers?.map((g, i) => (
                <div key={i} className="flex items-start gap-2 bg-gray-800 rounded-lg p-2.5">
                  <span className={`text-[10px] font-bold shrink-0 mt-0.5 ${SPORT_COLOR[g.sport] || "text-gray-400"}`}>{g.sport}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-xs font-bold truncate">{g.player}</span>
                      <span className="text-green-400 text-xs font-black shrink-0">{g.change}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{g.card} · {g.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div>
            <div className="text-[10px] text-red-400 font-bold uppercase mb-1.5 flex items-center gap-1">
              <span>▼</span> Biggest Losers
            </div>
            <div className="space-y-1.5">
              {movers.losers?.map((l, i) => (
                <div key={i} className="flex items-start gap-2 bg-gray-800 rounded-lg p-2.5">
                  <span className={`text-[10px] font-bold shrink-0 mt-0.5 ${SPORT_COLOR[l.sport] || "text-gray-400"}`}>{l.sport}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-xs font-bold truncate">{l.player}</span>
                      <span className="text-red-400 text-xs font-black shrink-0">{l.change}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{l.card} · {l.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Opps */}
          <div>
            <div className="text-[10px] text-yellow-400 font-bold uppercase mb-1.5 flex items-center gap-1">
              <span>💡</span> Buy Opportunities
            </div>
            <div className="space-y-1.5">
              {movers.buyOpportunities?.map((b, i) => (
                <div key={i} className="bg-yellow-950/40 border border-yellow-900 rounded-lg p-2.5">
                  <div className="flex justify-between items-center gap-1 mb-0.5">
                    <span className="text-xs font-bold">{b.player}</span>
                    <span className={`text-[10px] font-bold ${SPORT_COLOR[b.sport] || "text-gray-400"}`}>{b.sport}</span>
                  </div>
                  <p className="text-[10px] text-gray-300">{b.card}</p>
                  <p className="text-[10px] text-yellow-300 mt-0.5">{b.reason}</p>
                  <span className="text-[9px] text-gray-500 uppercase font-semibold">{b.timeframe}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionBox>
  );
}

// ─── Prediction Panel ─────────────────────────────────────────────────────────

function PredictionPanel({ prefill }) {
  const formRef = useRef(null);
  const [card, setCard] = useState({ player: "", year: "", brand: "", parallel: "", grade: "", currentValue: "" });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newsContext, setNewsContext] = useState(null);

  // When Player Intel pre-fills this panel
  useEffect(() => {
    if (!prefill) return;
    setCard(prev => ({ ...prev, player: prefill.playerName }));
    setNewsContext(prefill.newsContextStr);
    setPrediction(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [prefill]);

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
  "keyFactors": ["factor1", "factor2", "factor3"],
  "newsImpact": ["news-driven insight 1", "news-driven insight 2"]
}`;

    try {
      const body = {
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      };
      if (newsContext) body.newsContext = newsContext;

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  return (
    <div ref={formRef} className="space-y-4">
      <SectionBox title="Predict Card Value" icon="🔮">
        {newsContext && (
          <div className="bg-blue-950/50 border border-blue-800 rounded-lg px-3 py-2 text-xs text-blue-300 mb-4 flex items-center gap-2">
            <span>📡</span> Live news context loaded — prediction will include today's news impact
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: "Player Name *", key: "player", placeholder: "e.g. Patrick Mahomes" },
            { label: "Year *", key: "year", placeholder: "e.g. 2018" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder={f.placeholder}
                value={card[f.key]}
                onChange={e => setCard({ ...card, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Brand *</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              value={card.brand}
              onChange={e => setCard({ ...card, brand: e.target.value })}
            >
              <option value="">Select brand...</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Parallel / Variation</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Silver Prizm /199"
              value={card.parallel}
              onChange={e => setCard({ ...card, parallel: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Grade</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              value={card.grade}
              onChange={e => setCard({ ...card, grade: e.target.value })}
            >
              <option value="">Select grade...</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Current Value ($) *</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 250"
              value={card.currentValue}
              onChange={e => setCard({ ...card, currentValue: e.target.value })}
            />
          </div>
        </div>
        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 py-3 rounded-xl font-bold text-sm"
        >
          {loading ? "Analyzing card..." : "Get AI Prediction →"}
        </button>
      </SectionBox>

      {/* Prediction Results */}
      {prediction && (
        <SectionBox title="Value Forecast" icon="📈">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "1 Year",   value: prediction.oneYear   },
              { label: "5 Years",  value: prediction.fiveYear  },
              { label: "10 Years", value: prediction.tenYear   },
              { label: "Lifetime", value: prediction.lifetime  },
            ].map(item => (
              <div key={item.label} className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                <div className="text-xl font-black text-green-400">${item.value}</div>
              </div>
            ))}
          </div>

          <div className={`inline-block px-3 py-1.5 rounded-lg font-bold text-sm mb-3 ${VERDICT[prediction.verdict] || "bg-gray-600"}`}>
            {prediction.verdict}
          </div>
          <p className="text-gray-300 text-sm mb-3">{prediction.reason}</p>

          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1.5">Key Factors</div>
            <div className="flex flex-wrap gap-1.5">
              {prediction.keyFactors?.map(f => (
                <span key={f} className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full text-xs">{f}</span>
              ))}
            </div>
          </div>

          {/* News Impact — the key new section */}
          {prediction.newsImpact?.length > 0 && (
            <div className="bg-blue-950/50 border border-blue-800 rounded-xl p-4">
              <div className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                <span>📰</span> Why This Matters for Cards
              </div>
              <div className="space-y-2">
                {prediction.newsImpact.map((item, i) => {
                  const [trigger, ...rest] = item.split("→");
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-blue-400 shrink-0 mt-0.5">→</span>
                      <span>
                        <span className="text-white font-semibold">{trigger.trim()}</span>
                        {rest.length > 0 && (
                          <span className="text-blue-200"> → {rest.join("→").trim()}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionBox>
      )}
    </div>
  );
}

// ─── eBay Panel ───────────────────────────────────────────────────────────────

function EbayPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetch(`/api/ebay?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const heat = results ? (HEAT[results.heat] || HEAT.cold) : null;

  return (
    <div className="max-w-full">
      <SectionBox title="eBay Sold Listings" icon="🔍">
        <p className="text-xs text-gray-500 mb-3">Real sold prices — compare against AI prediction</p>
        <form onSubmit={search} className="flex gap-2 mb-4">
          <input
            className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="e.g. Patrick Mahomes Prizm rookie PSA 10"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold shrink-0"
          >
            {loading ? "..." : "Search →"}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {results && (
          <>
            <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-800 rounded-xl">
              <div>
                <div className="text-gray-400 text-xs">Avg Sold Price</div>
                <div className="text-xl font-black text-green-400">${results.avg}</div>
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div>
                <div className="text-gray-400 text-xs">Recent Sales</div>
                <div className="text-xl font-black text-white">{results.count}</div>
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div>
                <div className="text-gray-400 text-xs mb-1">Market Heat</div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${heat.bg}`}>{heat.label}</span>
              </div>
              <div className={`ml-auto text-xs ${heat.text}`}>{heat.desc}</div>
            </div>

            {results.items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No results. Try a broader search.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto pr-1">
                {results.items.map(item => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors group flex flex-col"
                  >
                    <div className="aspect-[3/4] bg-gray-700 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">🃏</div>
                      )}
                    </div>
                    <div className="p-2 flex flex-col flex-1">
                      <p className="text-[10px] text-gray-300 line-clamp-2 mb-1.5 flex-1">{item.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-black text-sm">${item.price.toFixed(0)}</span>
                        <span className="text-[10px] text-blue-400">View →</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </SectionBox>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [prefill, setPrefill] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [moversForTicker, setMoversForTicker] = useState(null);

  const handlePrefill = (intel) => {
    // Build a news context string to pass to the prediction API
    const headlines = intel.headlines?.map(h => `- ${h.title} (${h.source}): ${h.summary}`).join("\n") || "";
    const newsContextStr = [
      `Player: ${intel.playerName} (${intel.sport}, ${intel.team})`,
      `Injury Status: ${intel.injuryStatus}${intel.injuryDetail ? " — " + intel.injuryDetail : ""}`,
      `Market Heat: ${intel.heat} — ${intel.heatReason}`,
      `Recent Performance: ${intel.recentStats}`,
      headlines ? `Recent Headlines:\n${headlines}` : "",
    ].filter(Boolean).join("\n");

    setPrefill({ playerName: intel.playerName, newsContextStr });
  };

  const handleAlert = (intel) => {
    setAlerts(prev => {
      const alreadyExists = prev.some(a => a.player === intel.playerName);
      if (alreadyExists) return prev;
      return [...prev, { player: intel.playerName, alertCard: intel.alertCard, alertStat: intel.alertStat }];
    });
  };

  const dismissAlert = (i) => setAlerts(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage("home")}>
          <span className="text-xl font-black text-blue-400">SlabIQ</span>
          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">BETA</span>
        </div>
        <nav className="flex gap-5 text-sm">
          {[
            { id: "home", label: "Terminal" },
            { id: "academy", label: "Academy" },
          ].map(n => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              className={`transition-colors ${page === n.id ? "text-white font-semibold border-b border-blue-400 pb-0.5" : "text-gray-400 hover:text-white"}`}
            >
              {n.label}
            </button>
          ))}
          <a href="#" className="text-gray-400 hover:text-white">Marketplace</a>
          <a href="#" className="text-gray-400 hover:text-white">Portfolio</a>
        </nav>
        <div className="flex gap-3">
          <button className="text-sm text-gray-400 hover:text-white">Log in</button>
          <button className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg font-semibold">Get Started</button>
        </div>
      </header>

      {page === "academy" ? (
        <Academy />
      ) : (
        <>
          {/* Alert Banner */}
          <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

          {/* Market Ticker */}
          <MarketTicker movers={moversForTicker} />

          {/* Hero — compact */}
          <div className="px-6 py-6 border-b border-gray-800">
            <h1 className="text-3xl font-black">
              Sports Card <span className="text-blue-400">Intelligence Terminal</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Live news · AI predictions · Real market data — all in one place.</p>
          </div>

          {/* Bloomberg two-column layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: News + Market Movers */}
            <div className="w-80 shrink-0 border-r border-gray-800 overflow-y-auto p-4 space-y-4">
              <PlayerIntelPanel
                onPrefill={handlePrefill}
                onAlert={handleAlert}
              />
              <MarketMoversPanel />
            </div>

            {/* Right: Prediction + eBay */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <PredictionPanel prefill={prefill} />
              <EbayPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
