import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function fmt$(n, compact = false) {
  if (!n || isNaN(n)) return "$0";
  if (compact && n >= 1000) {
    return "$" + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function fmtPct(n) {
  const sign = n >= 0 ? "+" : "";
  return sign + n.toFixed(1) + "%";
}

export const SPORT_COLORS = {
  NFL:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  NBA:  "bg-orange-500/15 text-orange-400 border-orange-500/30",
  MLB:  "bg-red-500/15 text-red-400 border-red-500/30",
  NHL:  "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  WNBA: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  MLS:  "bg-green-500/15 text-green-400 border-green-500/30",
};

export const HOT_COLD_CONFIG = {
  hot:     { label: "🔥 Hot",     color: "text-orange-400 bg-orange-500/10 border-orange-500/25" },
  warm:    { label: "📈 Warm",    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25" },
  neutral: { label: "➡️ Neutral",  color: "text-slate-400 bg-white/5 border-white/12" },
  cold:    { label: "📉 Cold",    color: "text-blue-400 bg-blue-500/10 border-blue-500/25" },
  icy:     { label: "🧊 Icy",     color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25" },
};

export const IMPACT_CONFIG = {
  "strong-buy":  { label: "⬆⬆ Strong Buy",  color: "text-emerald-400 bg-emerald-500/8 border-emerald-500/20" },
  "buy":         { label: "⬆ Buy",           color: "text-green-400 bg-green-500/8 border-green-500/20" },
  "hold":        { label: "➡ Hold",          color: "text-yellow-400 bg-yellow-500/8 border-yellow-500/20" },
  "sell":        { label: "⬇ Sell",          color: "text-orange-400 bg-orange-500/8 border-orange-500/20" },
  "strong-sell": { label: "⬇⬇ Strong Sell", color: "text-red-400 bg-red-500/8 border-red-500/20" },
};
