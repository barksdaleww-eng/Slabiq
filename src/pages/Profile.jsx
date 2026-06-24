import { User } from "lucide-react";
export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mb-4">
        <User className="w-8 h-8 text-slate-400" />
      </div>
      <h1 className="text-xl font-black text-white mb-2">Profile</h1>
      <p className="text-slate-500 text-sm">Coming soon — track your collection, watchlist, and alerts.</p>
    </div>
  );
}
