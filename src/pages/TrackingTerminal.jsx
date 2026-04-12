/**
 * CTA Logistics — Tracking Terminal (Destinataire)
 * PIN verification · Secure Pass · Audit PDF download
 */

import { useState, useMemo } from "react";
import {
  Lock, CheckCircle2, Fingerprint, Download,
  ScanLine, Camera, ArrowLeft, Delete, Check,
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import { Button, Pill, Spinner, PriceRow, T } from "../components/ui/primitives";
import { eur, formatDateFR } from "../utils/pricing";
import { hashPin, generateBarcodeBars, downloadAuditPDF } from "../utils/mission";

// ── Secure Pass ───────────────────────────────────────────────────────────────

const SecurePass = ({ missionId, pin, pinHash }) => {
  const bars = useMemo(() => generateBarcodeBars(missionId + pin), [missionId, pin]);
  const totalWidth = bars.length > 0 ? Math.max(...bars.map((b) => b.x + b.w)) + 6 : 200;

  return (
    <GlassCard style={{ textAlign: "center", padding: 32, borderColor: `${T.gold}30`, background: "rgba(20,20,21,0.85)" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.goldMuted, border: `1px solid ${T.gold}30`, borderRadius: 100, padding: "4px 14px", marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>Secure Pass</span>
        </div>
        <p style={{ fontSize: 11, color: T.tertiary, fontFamily: T.font, margin: 0 }}>Présentez ce pass à l'agent pour validation</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {pin.split("").map((digit, i) => (
          <div key={i} style={{ width: 44, height: 56, borderRadius: T.radiusSm, background: T.elevated, border: `1.5px solid ${T.gold}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: T.gold, fontFamily: T.mono }}>
            {digit}
          </div>
        ))}
      </div>

      <div style={{ background: T.primary, borderRadius: T.radiusSm, padding: "16px 12px 10px", marginBottom: 16, display: "inline-block" }}>
        <svg viewBox={`0 0 ${totalWidth} 60`} style={{ width: "100%", maxWidth: 260, height: 50 }} preserveAspectRatio="none">
          {bars.map((bar, i) => <rect key={i} x={bar.x} y={0} width={bar.w} height={50} fill="#0A0A0B" />)}
        </svg>
        <div style={{ fontSize: 10, fontFamily: T.mono, color: "#0A0A0B", letterSpacing: "0.15em", marginTop: 4, textAlign: "center" }}>{missionId}</div>
      </div>

      <div style={{ background: T.elevated, borderRadius: T.radiusSm, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, letterSpacing: "0.02em" }}>{pinHash}</span>
      </div>
    </GlassCard>
  );
};

// ── Numpad ────────────────────────────────────────────────────────────────────

const Numpad = ({ value, onChange, maxLen = 6 }) => {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"];
  const press = (k) => {
    if (k === "del") onChange(value.slice(0, -1));
    else if (k !== null && value.length < maxLen) onChange(value + String(k));
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxWidth: 300, margin: "0 auto" }}>
      {keys.map((k, i) => (
        <button
          key={i}
          onClick={() => k !== null && press(k)}
          disabled={k === null}
          style={{
            height: 58, borderRadius: T.radius,
            border:      k === null ? "none" : `1px solid ${T.glassBorder}`,
            background:  k === null ? "transparent" : T.elevated,
            color:       k === "del" ? T.danger : T.primary,
            fontSize:    k === "del" ? 0 : 22,
            fontWeight:  500, fontFamily: T.font,
            cursor:      k === null ? "default" : "pointer",
            transition:  "all 0.15s ease",
            display:     "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {k === "del" ? <Delete size={20} strokeWidth={1.2} /> : k}
        </button>
      ))}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function TrackingTerminal({ mission, setMission }) {
  const [inputPin, setInputPin] = useState("");
  const [verified, setVerified] = useState(mission?.pinVerified || false);
  const [error, setError]       = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [scanning, setScanning] = useState(false);

  if (!mission) {
    return (
      <GlassCard style={{ textAlign: "center", padding: 48 }}>
        <Lock size={32} strokeWidth={1.2} color={T.muted} style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: T.secondary, fontFamily: T.font }}>Terminal verrouillé</p>
        <p style={{ fontSize: 13, color: T.muted, fontFamily: T.font, marginTop: 4 }}>Aucune mission en attente</p>
      </GlassCard>
    );
  }

  const pinRequired = mission.pinRequired;

  // PIN not required → show open confirmation
  if (!pinRequired) {
    return (
      <GlassCard variant="success" style={{ textAlign: "center", padding: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.successMuted, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={32} strokeWidth={1.2} color={T.success} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: T.primary, fontFamily: T.font, letterSpacing: "-0.02em", marginBottom: 6 }}>Aucune Authentification Requise</h3>
        <p style={{ fontSize: 13, color: T.secondary, fontFamily: T.font, marginBottom: 12 }}>Cette mission ne nécessite pas de vérification PIN</p>
        <Pill color={T.success}>{mission.id}</Pill>
        {mission.livraisonDate && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: T.elevated, borderRadius: T.radiusSm }}>
            <div style={{ fontSize: 11, color: T.tertiary }}>
              Livraison prévue : {formatDateFR(mission.livraisonDate)} · {mission.livraisonSlot}
            </div>
          </div>
        )}
      </GlassCard>
    );
  }

  const verifyPin = () => {
    if (inputPin === mission.pin) {
      setVerified(true);
      setError(false);
      setMission({ ...mission, pinVerified: true, step: 5 });
    } else {
      setError(true);
      setInputPin("");
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleScanPin = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanMode(false);
      if (mission.pin) setInputPin(mission.pin);
    }, 2200);
  };

  // ── Verified State ────────────────────────────────────────────────────────

  if (verified) {
    return (
      <div>
        <GlassCard variant="success" style={{ textAlign: "center", padding: 40, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.successMuted, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={32} strokeWidth={1.2} color={T.success} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.primary, fontFamily: T.font, letterSpacing: "-0.02em", marginBottom: 6 }}>Mission Clôturée</h3>
          <p style={{ fontSize: 13, color: T.secondary, fontFamily: T.font, marginBottom: 4 }}>Authentification réussie · Intégrité confirmée</p>
          <Pill color={T.success} style={{ marginTop: 8 }}>{mission.id}</Pill>
        </GlassCard>

        <div style={{ marginBottom: 16 }}>
          <SecurePass missionId={mission.id} pin={mission.pin} pinHash={mission.pinHash} />
        </div>

        <GlassCard style={{ marginBottom: 16 }}>
          <PriceRow label="Distance"        value={`${mission.distance} km`} />
          <PriceRow label="Investissement"  value={eur(mission.tarif?.ttc)} color={T.gold} />
          <PriceRow label="Garantie"        value={mission.garantie}         color={T.success} />
          <PriceRow label="Authentification" value="Validée" bold             color={T.success} />
        </GlassCard>

        <Button variant="gold" onClick={() => downloadAuditPDF(mission, eur)}>
          <Download size={16} strokeWidth={1.2} /> Émettre l'Audit d'Intégrité
        </Button>
      </div>
    );
  }

  // ── Scan Mode ─────────────────────────────────────────────────────────────

  if (scanMode) {
    return (
      <div>
        <GlassCard style={{ textAlign: "center", padding: 48 }}>
          {scanning ? (
            <>
              <div style={{ width: 160, height: 160, margin: "0 auto 24px", borderRadius: T.radiusLg, border: `2px solid ${T.accent}40`, background: T.elevated, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", left: 8, right: 8, height: 2, background: T.accent, boxShadow: `0 0 12px ${T.accent}80`, animation: "ctaScanLine 1.5s ease-in-out infinite" }} />
                {[{ top: 8, left: 8 }, { top: 8, right: 8 }, { bottom: 8, left: 8 }, { bottom: 8, right: 8 }].map((pos, i) => (
                  <div key={i} style={{ position: "absolute", ...pos, width: 20, height: 20, borderTop: i < 2 ? `2px solid ${T.accent}` : "none", borderBottom: i >= 2 ? `2px solid ${T.accent}` : "none", borderLeft: i % 2 === 0 ? `2px solid ${T.accent}` : "none", borderRight: i % 2 === 1 ? `2px solid ${T.accent}` : "none" }} />
                ))}
                <ScanLine size={32} strokeWidth={1} color={T.accent} style={{ opacity: 0.3 }} />
              </div>
              <p style={{ fontSize: 14, color: T.primary, fontFamily: T.font, fontWeight: 600 }}>Lecture optique…</p>
              <p style={{ fontSize: 12, color: T.tertiary, fontFamily: T.font, marginTop: 4 }}>Alignez le QR Code dans le cadre</p>
            </>
          ) : (
            <>
              <ScanLine size={40} strokeWidth={1.2} color={T.accent} style={{ marginBottom: 20 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.primary, fontFamily: T.font, marginBottom: 8 }}>Scan Optique</h3>
              <p style={{ fontSize: 13, color: T.tertiary, fontFamily: T.font, marginBottom: 24 }}>Scannez le Secure Pass fourni par l'expéditeur</p>
              <Button onClick={handleScanPin}><Camera size={16} strokeWidth={1.2} /> Activer la Caméra</Button>
            </>
          )}
        </GlassCard>
        <div style={{ marginTop: 12 }}>
          <Button variant="ghost" onClick={() => setScanMode(false)}>
            <ArrowLeft size={14} strokeWidth={1.5} /> Saisie manuelle
          </Button>
        </div>
      </div>
    );
  }

  // ── PIN Entry ─────────────────────────────────────────────────────────────

  return (
    <div>
      <GlassCard style={{ textAlign: "center", padding: 40, marginBottom: 24 }}>
        <Lock size={28} strokeWidth={1.2} color={T.secondary} style={{ marginBottom: 16 }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.primary, fontFamily: T.font, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Authentification Requise
        </h3>
        <p style={{ fontSize: 13, color: T.tertiary, fontFamily: T.font }}>
          Saisissez le code PIN communiqué par l'expéditeur
        </p>
      </GlassCard>

      {/* PIN dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 42, height: 50, borderRadius: T.radiusSm,
              border: `1.5px solid ${error ? T.danger : i < inputPin.length ? T.accent : T.glassBorder}`,
              background: i < inputPin.length ? T.accentMuted : T.elevated,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 600, color: T.primary, fontFamily: T.mono,
              transition: "all 0.2s ease",
            }}
          >
            {i < inputPin.length ? "•" : ""}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: T.danger, fontFamily: T.font }}>Code incorrect · Réessayez</p>
        </div>
      )}

      <Numpad value={inputPin} onChange={setInputPin} />

      <div style={{ maxWidth: 300, margin: "20px auto 0", display: "grid", gap: 10 }}>
        <Button onClick={verifyPin} disabled={inputPin.length !== 6}>
          <Fingerprint size={16} strokeWidth={1.2} /> Vérifier
        </Button>
        <Button variant="ghost" onClick={() => setScanMode(true)}>
          <ScanLine size={16} strokeWidth={1.5} /> Scanner le QR Code
        </Button>
      </div>
    </div>
  );
}
