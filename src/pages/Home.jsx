import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Zap, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";

const TRENDING = [
  { name: "Patrick Mahomes", sport: "NFL", emoji: "🏈" },
  { name: "LeBron James",    sport: "NBA", emoji: "🏀" },
  { name: "Shohei Ohtani",   sport: "MLB", emoji: "⚾" },
  { name: "Connor McDavid",  sport: "NHL", emoji: "🏒" },
  { name: "Caitlin Clark",   sport: "WNBA", emoji: "🏀" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function go(q) {
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 pt-12 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-black text-lg tracking-tight">
            <span className="text-white">Slab</span>
            <span className="gradient-text">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-[clamp(2rem,8vw,3rem)] font-black leading-[1.05] tracking-tight mb-3">
              <span className="text-white">Know What Your</span>
              <br />
              <span className="gradient-text">Cards Are Worth</span>
            </h1>
            <p className="text-slate-400 text-base">
              Real eBay sold prices + AI predictions, instantly.
            </p>
          </div>

          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go(query)}
              placeholder="Search any player or card..."
              className={cn(
                "w-full pl-12 pr-4 py-4 rounded-2xl text-base font-medium",
                "bg-[#0d1526] border border-white/10 text-slate-100 placeholder:text-slate-600",
                "focus:outline-none focus:border-blue-500/50",
                "transition-all duration-200"
              )}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          <button
            onClick={() => go(query)}
            disabled={!query.trim()}
            className={cn(
              "w-full py-4 rounded-2xl text-base font-bold transition-all duration-200",
              "bg-blue-500 hover:bg-blue-400 text-white",
              "shadow-xl shadow-blue-500/25",
              "disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            )}
          >
            Search Cards
          </button>

          <div className="mt-8">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Trending Now
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {TRENDING.map((p) => (
                <button
                  key={p.name}
                  onClick={() => go(p.name)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
                    "bg-[#0d1526] border border-white/8 text-slate-300",
                    "hover:border-blue-500/30 hover:text-white hover:bg-[#111c30]",
                    "active:scale-95 transition-all duration-150 min-h-[44px]"
                  )}
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-xs text-slate-700 text-center">
            Real eBay data · Claude AI · Updated every 15 min
          </p>
        </div>
      </div>
    </div>
  );
}
