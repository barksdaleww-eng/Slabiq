import { Scan } from "lucide-react";
export default function ScanPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
        <Scan className="w-8 h-8 text-blue-400" />
      </div>
      <h1 className="text-xl font-black text-white mb-2">Card Scanner</h1>
      <p className="text-slate-500 text-sm">Coming soon — point your camera at any card to get instant pricing.</p>
    </div>
  );
}
