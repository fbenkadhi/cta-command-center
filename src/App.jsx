/**
 * CTA Logistics — App Root + Router
 * React Router v6 · 3 portails : /client · /agent · /tracking
 */

import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import { User, Truck, Users } from "lucide-react";

import ErrorBoundary        from "./components/ErrorBoundary";
import ClientTerminal       from "./pages/ClientTerminal";
import AgentTerminal        from "./pages/AgentTerminal";
import TrackingTerminal     from "./pages/TrackingTerminal";
import { useMission }       from "./hooks/useMission";
import { T }                from "./components/ui/primitives";

// ── Global CSS Injection ──────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body {
      background: #0A0A0B;
      color: #E5E7EB;
      font-family: 'Inter', -apple-system, 'SF Pro Display', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    input, textarea, select { font-family: inherit; }
    input::placeholder, textarea::placeholder { color: #4B5563; }
    button { outline: none; }
    button:focus-visible { outline: 1px solid #3B82F6; outline-offset: 2px; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 4px; }
    select option { background: #0A0A0B; color: #E5E7EB; }

    @keyframes ctaSpin     { to { transform: rotate(360deg); } }
    @keyframes ctaScanLine { 0%,100% { top: 10%; } 50% { top: 85%; } }
    @keyframes ctaFadeIn   { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ctaSlideUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ctaPulse    { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  `}</style>
);

// ── Header ────────────────────────────────────────────────────────────────────

const Header = ({ mission, onReset }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header style={{
      borderBottom:        `1px solid rgba(255,255,255,0.05)`,
      padding:             "16px 20px",
      position:            "sticky",
      top:                 0,
      zIndex:              100,
      background:          "rgba(10,10,11,0.85)",
      backdropFilter:      "blur(40px)",
      WebkitBackdropFilter:"blur(40px)",
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.12em", color: "#E5E7EB", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            CTA <span style={{ fontWeight: 300, color: "#9CA3AF" }}>Logistics</span>
          </h1>
          <p style={{ fontSize: 10, color: "#4B5563", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
            Command Center · v4.1
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {mission && (
            <button
              onClick={onReset}
              style={{ background: "none", border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#4B5563", fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
            >
              Reset
            </button>
          )}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#E5E7EB", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>
              {time.toLocaleTimeString("fr-FR")}
            </div>
            <div style={{ fontSize: 10, color: "#4B5563", fontFamily: "'Inter', sans-serif" }}>
              {time.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.60)" }} />
        </div>
      </div>
    </header>
  );
};

// ── Navigation Tabs ───────────────────────────────────────────────────────────

const NAV_TABS = [
  { path: "/client",   label: "Client",      icon: User  },
  { path: "/agent",    label: "Agent",       icon: Truck },
  { path: "/tracking", label: "Destinataire", icon: Users },
];

const NavTabs = () => {
  const location = useLocation();
  const activeTab = NAV_TABS.find((t) => location.pathname.startsWith(t.path));

  return (
    <nav style={{
      display:             "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap:                 4,
      marginBottom:        24,
      background:          "#141415",
      borderRadius:        12,
      padding:             4,
    }}>
      {NAV_TABS.map((t) => {
        const Icon     = t.icon;
        const isActive = location.pathname.startsWith(t.path);
        return (
          <NavLink
            key={t.path}
            to={t.path}
            style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              gap:            4,
              background:     isActive ? "#1A1A1C" : "transparent",
              borderRadius:   8,
              padding:        "12px 8px",
              textDecoration: "none",
              border:         "none",
              cursor:         "pointer",
              transition:     "all 0.25s ease",
            }}
          >
            <Icon size={18} strokeWidth={1.2} color={isActive ? "#E5E7EB" : "#4B5563"} />
            <span style={{
              fontSize:    12,
              fontWeight:  isActive ? 600 : 400,
              color:       isActive ? "#E5E7EB" : "#4B5563",
              fontFamily:  "'Inter', sans-serif",
              letterSpacing: "-0.01em",
            }}>
              {t.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

// ── Mission Banner ────────────────────────────────────────────────────────────

const MissionBanner = ({ mission }) => {
  if (!mission) return null;
  return (
    <div style={{
      display:       "flex",
      alignItems:    "center",
      gap:           8,
      padding:       "10px 14px",
      marginBottom:  16,
      background:    "#141415",
      borderRadius:  8,
      border:        "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
      <span style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>Mission active</span>
      <span style={{ fontSize: 12, color: "#E5E7EB", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>
        {mission.id}
      </span>
    </div>
  );
};

// ── App Inner (needs router context for useLocation) ──────────────────────────

function AppInner() {
  const { mission, setMission, resetMission } = useMission();

  const handleReset = () => {
    resetMission();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B" }}>
      <GlobalStyles />
      <Header mission={mission} onReset={handleReset} />

      <main style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 80px" }}>
        <MissionBanner mission={mission} />
        <NavTabs />

        <ErrorBoundary>
          <Routes>
            <Route index element={<Navigate to="/client" replace />} />
            <Route path="/client"   element={<ClientTerminal   mission={mission} setMission={setMission} />} />
            <Route path="/agent"    element={<AgentTerminal    mission={mission} setMission={setMission} />} />
            <Route path="/tracking" element={<TrackingTerminal mission={mission} setMission={setMission} />} />
            <Route path="*"         element={<Navigate to="/client" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
