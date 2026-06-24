import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search, ArrowLeft, TrendingUp, TrendingDown, Minus,
  ExternalLink, Zap, AlertTriangle, RefreshCw, CheckCircle2,
} from "lucide-react";
import { cn, fmt$, fmtDate, fmtPct, SPORT_COLORS, HOT_COLD_CONFIG, IMPACT_CONFIG } from "../lib/utils";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function Sk({ className }) {
  return <div className={cn("skeleton", className)} />;
}

function PlayerHeaderSkeleton() {
  return (
    <div className="bg-[#0d1526] border border-white/8 rounded-2xl p-4 mb-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-2">
          <Sk className="h-6 w-44" />
          <Sk className="h-3 w-28" />
        </div>
        <Sk className="h-8 w-16 rounded-full" />
      </div>
      <Sk className="h-4 w-full" />
      <Sk className="h-4 w-3/4" />
      <Sk className="h-10 w-full rounded-xl" />
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="flex gap-3 p-3 border-b border-white/6">
      <Sk className="w-16 h-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-3/4" />
        <Sk className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatBadge({ label, value, highlight }) {
  return (
    <div className="text-center">
      <div className={cn("text-lg font-black", highlight ? "text-emerald-400" : "text-white")}>{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function TrendBadge({ trend, pct }) {
  const cfg = {
    up:   { Icon: TrendingUp,   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: `${fmtPct(Math.abs(pct))} vs last month` },
    down: { Icon: TrendingDown, color: "text-red-400 bg-red-500/10 border-red-500/20",             label: `${fmtPct(Math.abs(pct))} vs last month` },
    flat: { Icon: Minus,        color: "text-slate-400 bg-white/5 border-white/10",               label: "Stable" },
  }[trend] ?? { Icon: Minus, color: "text-slate-400 bg-white/5 border-white/10", label: "—" };

  return (
    <div className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold", cfg.color)}>
      <cfg.Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </div>
  );
}

function ListingRow({ item, showSold }) {
  const [imgError, setImgError] = useState(false);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 border-b border-white/6 active:bg-white/3 hover:bg-white/3 transition-colors group"
    >
      <div className="w-16 h-20 rounded-lg bg-[#111c30] border border-white/8 flex-shrink-0 overflow-hidden">
        {item.imageUrl && !imgError ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🃏</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug mb-1.5 group-hover:text-white transition-colors">
          {item.title}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className={cn("text-base font-black", showSold ? "text-emerald-400" : "text-blue-400")}>
              {fmt$(item.price)}
            </span>
            {item.isAuction && (
              <span className="ml-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-semibold">AUCTION</span>
            )}
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 mt-1">
          {item.condition && <span className="text-[11px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{item.condition}</span>}
          {item.date && <span className="text-[11px] text-slate-600">{fmtDate(item.date)}</span>}
        </div>
      </div>
    </a>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-14 text-center px-4">
      <div className="text-4xl mb-3">🃏</div>
      <p className="text-slate-400 font-semibold mb-1">No results found</p>
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}

// ─── Sold Tab ─────────────────────────────────────────────────────────────────

function SoldTab({ market, loading }) {
  if (loading) return <div>{[...Array(5)].map((_, i) => <ListingSkeleton key={i} />)}</div>;

  // Sold price history is temporarily unavailable (pending Marketplace Insights API access)
  if (market?.soldUnavailable || !market?.sold.length) {
    return (
      <div className="py-14 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/8 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-7 h-7 text-slate-600" />
        </div>
        <p className="text-white font-bold mb-1">Sold Price History</p>
        <p className="text-slate-400 text-sm mb-3">Temporarily unavailable — coming soon.</p>
        <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
          We're switching to eBay's new Marketplace Insights API for accurate sold comps.
          Check the <span className="text-blue-400 font-semibold">For Sale</span> tab for current asking prices,
          or use <span className="text-blue-400 font-semibold">AI Predict</span> for value estimates.
        </p>
      </div>
    );
  }

  const { stats } = market;
  return (
    <div>
      <div className="p-4 border-b border-white/8">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <StatBadge label="Avg (30d)" value={stats.avgSold30d > 0 ? fmt$(stats.avgSold30d, true) : "—"} highlight />
          <StatBadge label="High"      value={stats.highSold > 0 ? fmt$(stats.highSold, true) : "—"} />
          <StatBadge label="Low"       value={stats.lowSold > 0 ? fmt$(stats.lowSold, true) : "—"} />
          <StatBadge label="Sales"     value={stats.totalSold > 0 ? String(stats.totalSold) : "—"} />
        </div>
        {stats.totalSold > 0 && <div className="flex justify-center"><TrendBadge trend={stats.trend} pct={stats.trendPct} /></div>}
      </div>
      {market.sold.map((item) => <ListingRow key={item.itemId} item={item} showSold />)}
      <div className="p-4 text-center text-xs text-slate-700">Data from eBay · Tap any listing to view on eBay</div>
    </div>
  );
}

// ─── For Sale Tab ─────────────────────────────────────────────────────────────

function ForSaleTab({ market, loading }) {
  if (loading) return <div>{[...Array(5)].map((_, i) => <ListingSkeleton key={i} />)}</div>;
  if (!market?.active.length) return <EmptyState message="No active listings found. Try broader search terms." />;
  return (
    <div>
      <div className="p-3 border-b border-white/6 bg-blue-500/5">
        <p className="text-xs text-blue-400 text-center font-semibold">{market.active.length} active listings · Sorted by lowest price</p>
      </div>
      {market.active.map((item) => <ListingRow key={item.itemId} item={item} showSold={false} />)}
      <div className="p-4 text-center text-xs text-slate-700">Active eBay listings · Prices may change</div>
    </div>
  );
}

// ─── AI Predict Tab ───────────────────────────────────────────────────────────

const GRADES = ["Raw", "PSA 10", "PSA 9", "PSA 8", "BGS 9.5", "BGS 9", "SGC 10"];
const BRANDS = ["Prizm", "Topps Chrome", "Bowman Chrome", "National Treasures", "Select", "Optic", "Donruss", "Mosaic"];

function PredictTab({ query, avgSold }) {
  const [grade, setGrade] = useState("PSA 10");
  const [brand, setBrand] = useState("Prizm");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function predict() {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: query, grade, brand, avgSold }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Prediction failed");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const RECO = { Buy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", Hold: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25", Sell: "text-red-400 bg-red-500/10 border-red-500/25" };
  const CONF = { High: "text-emerald-400", Medium: "text-amber-400", Low: "text-red-400" };

  return (
    <div className="p-4 space-y-4">
      {/* Inputs */}
      <div className="bg-[#0d1526] rounded-2xl border border-white/8 p-4 space-y-3">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Player</label>
          <div className="px-4 py-3 rounded-xl bg-[#0a0f1e] border border-white/10 text-slate-300 text-sm font-semibold">{query}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[["Brand", brand, setBrand, BRANDS], ["Grade", grade, setGrade, GRADES]].map(([label, val, setter, opts]) => (
            <div key={label}>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">{label}</label>
              <select
                value={val}
                onChange={(e) => setter(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-[#0a0f1e] border border-white/10 text-slate-100 text-sm appearance-none focus:outline-none focus:border-blue-500/40"
              >
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        {avgSold > 0 && <p className="text-xs text-slate-600 text-center">eBay avg {fmt$(avgSold)} will anchor the prediction</p>}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        onClick={predict}
        disabled={loading}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-base",
          "bg-blue-500 hover:bg-blue-400 text-white shadow-xl shadow-blue-500/20 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        )}
      >
        {loading ? <><RefreshCw className="w-5 h-5 spin" />Claude is researching...</> : <><Zap className="w-5 h-5" />Generate AI Prediction</>}
      </button>

      {loading && <p className="text-xs text-center text-slate-600 animate-pulse">Searching news, stats, injury reports, and market data...</p>}

      {result && (
        <div className="space-y-3 animate-slide-up">
          {/* Header */}
          <div className="bg-[#0d1526] rounded-2xl border border-white/8 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-2xl font-black text-white">{fmt$(result.currentValue)}</div>
                <div className="text-xs text-slate-500 mt-0.5">Estimated current value</div>
              </div>
              <div className="text-right space-y-1">
                <span className={cn("text-sm font-black px-3 py-1 rounded-full border", RECO[result.recommendation])}>
                  {result.recommendation}
                </span>
                <div className={cn("text-xs font-bold mt-1", CONF[result.confidence])}>{result.confidence} Confidence</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[["1 Year", result.oneYear], ["5 Years", result.fiveYear], ["10 Years", result.tenYear], ["Lifetime", result.lifetime]].map(([label, range]) => (
                <div key={label} className="bg-[#0a0f1e] rounded-xl p-3 text-center border border-white/6">
                  <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-base font-black text-white">{fmt$(range?.mid ?? 0, true)}</div>
                  <div className="text-[10px] text-slate-700 mt-0.5">{fmt$(range?.low ?? 0, true)} – {fmt$(range?.high ?? 0, true)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-[#0d1526] rounded-2xl border border-white/8 p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" /> AI Analysis
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">{result.reasoning}</p>
          </div>

          {/* Bull / Bear */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/12 rounded-2xl p-3">
              <div className="text-xs font-bold text-emerald-400 mb-1.5">🐂 Bull Case</div>
              <p className="text-xs text-slate-400 leading-relaxed">{result.bullCase}</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/12 rounded-2xl p-3">
              <div className="text-xs font-bold text-red-400 mb-1.5">🐻 Bear Case</div>
              <p className="text-xs text-slate-400 leading-relaxed">{result.bearCase}</p>
            </div>
          </div>

          {/* Sources */}
          {result.sources?.length > 0 && (
            <div className="p-3 rounded-xl border border-white/6 bg-white/2">
              <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider mb-2">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {result.sources.map((s, i) => (
                  <span key={i} className="text-[11px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-[11px] text-slate-700 pb-2">
            ⚠️ AI estimates only — not financial advice. Always verify with real sales data.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Player Header ────────────────────────────────────────────────────────────

function PlayerHeader({ intel, loading }) {
  if (loading) return <PlayerHeaderSkeleton />;
  if (!intel) return null;

  const hotCfg = HOT_COLD_CONFIG[intel.hotCold] ?? HOT_COLD_CONFIG.neutral;
  const sportCfg = SPORT_COLORS[intel.sport] ?? "bg-white/8 text-slate-400 border-white/15";
  const impactCfg = IMPACT_CONFIG[intel.cardImpact] ?? IMPACT_CONFIG["hold"];

  return (
    <div className="bg-[#0d1526] border border-white/8 rounded-2xl p-4 mb-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-white truncate">{intel.player}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {intel.sport !== "Unknown" && (
              <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full border", sportCfg)}>{intel.sport}</span>
            )}
            {intel.team !== "Unknown" && <span className="text-xs text-slate-500">{intel.team}</span>}
            {intel.status === "injured" && (
              <span className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">INJURED</span>
            )}
          </div>
        </div>
        <div className={cn("flex-shrink-0 px-3 py-2 rounded-xl border text-sm font-bold whitespace-nowrap", hotCfg.color)}>
          {hotCfg.label}
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-3">{intel.newsSummary}</p>

      <div className={cn("flex items-center gap-2 p-2.5 rounded-xl border text-sm", impactCfg.color)}>
        <span className="font-bold text-xs">{impactCfg.label}</span>
        <span className="text-slate-400 text-xs">· {intel.cardImpactReason}</span>
      </div>

      {intel.highlights?.length > 0 && (
        <div className="mt-3 space-y-1">
          {intel.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500/60 flex-shrink-0 mt-0.5" />
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Search Page ─────────────────────────────────────────────────────────

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [inputVal, setInputVal] = useState(query);
  const [tab, setTab] = useState("sold");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const fetchData = useCallback(async (q) => {
    if (!q.trim()) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      setData(await res.json());
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) fetchData(query);
  }, [query, fetchData]);

  function handleSearch(q) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
    setTab("sold");
  }

  const TABS = [
    { id: "sold",    label: loading ? "Sold" : `Sold (${data?.market.sold.length ?? 0})` },
    { id: "forsale", label: loading ? "For Sale" : `For Sale (${data?.market.active.length ?? 0})` },
    { id: "predict", label: "AI Predict" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-30 bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-white/8 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="search"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(inputVal)}
              placeholder="Search player or card..."
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium",
                "bg-[#0d1526] border border-white/10 text-slate-100 placeholder:text-slate-600",
                "focus:outline-none focus:border-blue-500/40 transition-all"
              )}
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          <button
            onClick={() => handleSearch(inputVal)}
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold transition-colors min-h-[44px]"
          >
            Go
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Error */}
        {error && !loading && (
          <div className="flex items-start gap-3 p-4 mb-4 rounded-2xl bg-red-500/8 border border-red-500/15 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Search failed</p>
              <p className="text-xs mt-0.5 text-red-400/70">{error}</p>
            </div>
          </div>
        )}

        {/* Player header */}
        {(loading || data?.intel) && <PlayerHeader intel={data?.intel ?? null} loading={loading} />}

        {/* Empty state */}
        {!query && !loading && (
          <div className="text-center py-16 text-slate-600">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Search for a player to see market data</p>
          </div>
        )}

        {/* Tabs */}
        {(loading || data) && query && (
          <>
            <div className="flex border-b border-white/8 -mx-4">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex-1 py-3 text-sm font-semibold transition-all border-b-2 -mb-px",
                    tab === id ? "text-blue-400 border-blue-500" : "text-slate-500 border-transparent"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="-mx-4 bg-[#0d1526]/50">
              {tab === "sold"    && <SoldTab    market={data?.market ?? null} loading={loading} />}
              {tab === "forsale" && <ForSaleTab market={data?.market ?? null} loading={loading} />}
              {tab === "predict" && <PredictTab query={query} avgSold={data?.market?.stats?.avgSold30d ?? 0} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
