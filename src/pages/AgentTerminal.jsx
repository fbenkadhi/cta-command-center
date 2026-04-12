/**
 * CTA Logistics — Agent Terminal
 * Gestion terrain · Upload POD · PIN blocking conditionnel
 */

import { useState } from "react";
import {
  Camera, CheckCircle2, ScanLine, AlertCircle, Check,
  ChevronRight, Lock, Phone, Calendar, Pill as PillIcon,
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import { Button, Pill, Spinner, T } from "../components/ui/primitives";
import { TRACKING_STEPS, eur, formatDateFR } from "../utils/pricing";

const PhotoUpload = ({ field, label, captured, onCapture }) => (
  <div style={{ marginTop: 16 }}>
    {captured ? (
      <div style={{ position: "relative" }}>
        <img src={captured} alt={label} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, border: `1px solid rgba(255,255,255,0.05)` }} />
        <Pill color={T.success} style={{ position: "absolute", top: 12, right: 12 }}>
          <Check size={10} strokeWidth={2.5} /> Capturé
        </Pill>
      </div>
    ) : (
      <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40, border: `1.5px dashed rgba(255,255,255,0.10)`, borderRadius: 12, cursor: "pointer" }}>
        <input type="file" accept="image/*" capture="environment" onChange={onCapture} style={{ display: "none" }} />
        <Camera size={28} strokeWidth={1.2} color={T.muted} />
        <span style={{ fontSize: 13, color: T.secondary, fontFamily: T.font }}>{label}</span>
      </label>
    )}
  </div>
);

export default function AgentTerminal({ mission, setMission }) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanResult(mission
        ? { verified: true, missionId: mission.id }
        : { verified: false, error: "Aucune mission détectée" }
      );
    }, 2000);
  };

  if (!mission) {
    return (
      <GlassCard style={{ textAlign: "center", padding: 48 }}>
        <AlertCircle size={32} strokeWidth={1.2} color={T.muted} style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: T.secondary, fontFamily: T.font }}>Aucune mission active</p>
        <p style={{ fontSize: 13, color: T.muted, fontFamily: T.font, marginTop: 4 }}>Initiez une mission depuis le Terminal Client</p>
        <div style={{ marginTop: 24 }}>
          <Button variant="ghost" onClick={handleScan} disabled={scanning}>
            {scanning ? <><Spinner size={16} color={T.primary} /> Scan en cours…</> : <><ScanLine size={16} strokeWidth={1.5} /> Scanner un QR Mission</>}
          </Button>
        </div>
        {scanResult && !scanResult.verified && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: T.dangerMuted, borderRadius: T.radiusSm, border: `1px solid ${T.danger}25` }}>
            <p style={{ fontSize: 12, color: T.danger, fontFamily: T.font, margin: 0 }}>{scanResult.error}</p>
          </div>
        )}
      </GlassCard>
    );
  }

  const step        = mission.step || 1;
  const pinRequired = mission.pinRequired;
  const pinBlocking = pinRequired && !mission.pinVerified;

  const advanceStep = (n) => setMission({ ...mission, step: n });

  const handlePhoto = (field) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMission({ ...mission, [field]: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {/* Mission header */}
      <GlassCard style={{ marginBottom: 16, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Pill color={T.accent}>{mission.id}</Pill>
            <Pill color={T.success}>Étape {step}/5</Pill>
            {pinRequired && <Pill color={T.gold}>PIN Requis</Pill>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleScan}
              disabled={scanning}
              style={{ width: 38, height: 38, borderRadius: T.radiusSm, background: scanning ? T.accentMuted : T.elevated, border: `1px solid ${scanning ? T.accentBorder : T.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: scanning ? T.accent : T.secondary }}
            >
              {scanning ? <Spinner size={16} color={T.accent} /> : <ScanLine size={18} strokeWidth={1.5} />}
            </button>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.gold, fontFamily: T.mono }}>{eur(mission.tarif?.ttc)}</span>
          </div>
        </div>

        {scanResult?.verified && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: T.successMuted, borderRadius: T.radiusSm, border: `1px solid ${T.success}25`, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={14} strokeWidth={1.5} color={T.success} />
            <span style={{ fontSize: 12, color: T.success, fontFamily: T.font }}>QR validé · Mission {scanResult.missionId} authentifiée</span>
          </div>
        )}

        {/* Details card */}
        {(mission.collecteDate || mission.assetDescription || mission.contactExpediteur) && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: T.elevated, borderRadius: T.radiusSm }}>
            {mission.collecteDate && (
              <div style={{ fontSize: 11, color: T.tertiary, marginBottom: 4 }}>
                Collecte : {formatDateFR(mission.collecteDate)} · {mission.collecteSlot}
              </div>
            )}
            {mission.assetDescription && (
              <div style={{ fontSize: 11, color: T.tertiary, marginBottom: 4 }}>
                Actif : {mission.assetDescription}{mission.assetValue ? ` · ${eur(mission.assetValue)}` : ""}
              </div>
            )}
            {mission.contactExpediteur && (
              <div style={{ fontSize: 11, color: T.tertiary }}>
                Expéditeur : {mission.contactExpediteur}
              </div>
            )}
            {mission.notes && (
              <div style={{ fontSize: 11, color: T.gold, marginTop: 6 }}>📋 {mission.notes}</div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Tracking steps */}
      <div style={{ position: "relative", paddingLeft: 44 }}>
        <div style={{ position: "absolute", left: 17, top: 8, bottom: 8, width: 1, background: `linear-gradient(to bottom, ${T.success}60, ${T.glassBorder})` }} />

        {TRACKING_STEPS.map((s) => {
          const isDone   = s.id < step;
          const isActive = s.id === step;
          const isFuture = s.id > step;

          return (
            <div key={s.id} style={{ position: "relative", marginBottom: 12 }}>
              <div style={{
                position: "absolute", left: -36, top: 14,
                width: 24, height: 24, borderRadius: "50%",
                background: isDone ? T.successMuted : isActive ? T.accentMuted : T.elevated,
                border: `1.5px solid ${isDone ? T.success : isActive ? T.accent : T.glassBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s",
              }}>
                {isDone
                  ? <Check size={12} strokeWidth={2.5} color={T.success} />
                  : <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? T.accent : T.muted }}>{s.id}</span>
                }
              </div>

              <GlassCard
                padding={18}
                style={{ opacity: isFuture ? 0.3 : 1, borderColor: isActive ? T.accentBorder : T.glassBorder, pointerEvents: isFuture ? "none" : "auto" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, fontFamily: T.font, color: isDone ? T.success : isActive ? T.primary : T.muted }}>
                    {s.label}
                  </span>
                  {isDone   && <Pill color={T.success}>Validé</Pill>}
                  {isActive && <Pill color={T.accent}>En cours</Pill>}
                </div>
                <p style={{ fontSize: 12, color: T.tertiary, margin: 0, fontFamily: T.font }}>{s.desc}</p>

                {/* Step 3 — Photo prise en charge */}
                {s.id === 3 && isActive && (
                  <>
                    <PhotoUpload
                      field="photoChargement"
                      label="Photo d'Audit · Prise en Charge"
                      captured={mission.photoChargement}
                      onCapture={handlePhoto("photoChargement")}
                    />
                    {mission.photoChargement && (
                      <Button variant="success" onClick={() => advanceStep(4)} style={{ marginTop: 14 }}>
                        <CheckCircle2 size={16} strokeWidth={1.2} /> Valider → Transit
                      </Button>
                    )}
                  </>
                )}

                {/* Step 5 — Photo remise + PIN gate */}
                {s.id === 5 && isActive && (
                  <>
                    <PhotoUpload
                      field="photoRemise"
                      label="Photo de Conformité · Remise"
                      captured={mission.photoRemise}
                      onCapture={handlePhoto("photoRemise")}
                    />
                    {mission.photoRemise && pinBlocking && (
                      <div style={{ marginTop: 14, padding: 14, background: T.goldMuted, borderRadius: T.radiusSm, textAlign: "center", border: `1px solid ${T.gold}25` }}>
                        <Lock size={16} strokeWidth={1.5} color={T.gold} style={{ marginBottom: 6 }} />
                        <p style={{ fontSize: 13, color: T.gold, fontFamily: T.font, fontWeight: 600, margin: 0 }}>Mission verrouillée par PIN</p>
                        <p style={{ fontSize: 12, color: T.tertiary, fontFamily: T.font, margin: "4px 0 0" }}>Le destinataire doit valider son code PIN avant clôture</p>
                      </div>
                    )}
                    {mission.photoRemise && !pinBlocking && (
                      <Button variant="success" onClick={() => setMission({ ...mission, pinVerified: !pinRequired || mission.pinVerified, step: 5 })} style={{ marginTop: 14 }}>
                        <CheckCircle2 size={16} strokeWidth={1.2} /> Clôturer la Mission
                      </Button>
                    )}
                  </>
                )}

                {/* Steps 1, 2, 4 — simple advance */}
                {[1, 2, 4].includes(s.id) && isActive && (
                  <Button onClick={() => advanceStep(s.id + 1)} style={{ marginTop: 14 }}>
                    <ChevronRight size={16} strokeWidth={1.2} /> Étape suivante
                  </Button>
                )}
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
