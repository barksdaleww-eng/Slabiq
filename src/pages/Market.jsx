import { TrendingUp } from "lucide-react";
export default function MarketPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
        <TrendingUp className="w-8 h-8 text-emerald-400" />
      </div>
      <h1 className="text-xl font-black text-white mb-2">Market Overview</h1>
      <p className="text-slate-500 text-sm">Coming soon — trending cards, hot movers, and market heat maps.</p>
    </div>
  );
}
