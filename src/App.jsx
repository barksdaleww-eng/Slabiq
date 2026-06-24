import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import SearchPage from "./pages/Search";
import ScanPage from "./pages/Scan";
import MarketPage from "./pages/Market";
import ProfilePage from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-svh bg-[#0a0f1e] text-slate-100 antialiased">
        <main className="bottom-nav-offset">
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/search"  element={<SearchPage />} />
            <Route path="/scan"    element={<ScanPage />} />
            <Route path="/market"  element={<MarketPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
