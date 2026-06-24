import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Scan, TrendingUp, User } from "lucide-react";
import { cn } from "../lib/utils";

const TABS = [
  { to: "/",        icon: Home,       label: "Home" },
  { to: "/search",  icon: Search,     label: "Search" },
  { to: "/scan",    icon: Scan,       label: "Scan",   special: true },
  { to: "/market",  icon: TrendingUp, label: "Market" },
  { to: "/profile", icon: User,       label: "Profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-white/8"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
        {TABS.map(({ to, icon: Icon, label, special }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);

          if (special) {
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center justify-center -mt-5"
                aria-label={label}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[52px] min-h-[44px] px-2 py-1 rounded-xl transition-colors",
                active ? "text-blue-400" : "text-slate-600 active:text-slate-300"
              )}
              aria-label={label}
            >
              <Icon className={cn("w-5 h-5 transition-all", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
              <span className={cn("text-[10px] font-semibold tracking-wide", active ? "text-blue-400" : "text-slate-600")}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
