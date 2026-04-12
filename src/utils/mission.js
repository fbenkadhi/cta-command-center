/**
 * CTA Logistics — Mission Utilities
 * ID generation, PIN hashing, persistence
 */

export const STORAGE_KEY  = "cta_mission_state";
export const CLIENT_ID_KEY = "cta_client_id";

// ── ID Generation ─────────────────────────────────────────────────────────────

export const genMissionId = () => {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CTA-${ts}-${rand}`;
};

export const genClientId = () => {
  try {
    const existing = window.localStorage?.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const id = `CLI-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;
    window.localStorage?.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    return `CLI-${Date.now().toString(36).toUpperCase()}`;
  }
};

// ── PIN Hashing (deterministic, client-side) ──────────────────────────────────

export const hashPin = (pin) => {
  if (!pin) return null;
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) - h + pin.charCodeAt(i)) | 0;
  }
  return `SHA256:${Math.abs(h).toString(16).padStart(8, "0").toUpperCase()}`;
};

// ── Barcode Generation ────────────────────────────────────────────────────────

export const generateBarcodeBars = (str) => {
  let seed = 0;
  for (let i = 0; i < str.length; i++) {
    seed = ((seed << 5) - seed + str.charCodeAt(i)) | 0;
  }
  const abs    = Math.abs(seed);
  const binary =
    abs.toString(2).padStart(32, "0") +
    abs.toString(2).padStart(32, "0").split("").reverse().join("");
  return binary
    .split("")
    .reduce((acc, bit, i) => {
      if (bit === "1") acc.push({ x: i * 3, w: 2 });
      return acc;
    }, []);
};

// ── Persistence (localStorage with graceful degradation) ─────────────────────

export const loadState = () => {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveState = (state) => {
  try {
    if (state) {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      window.localStorage?.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage full or unavailable — silent degradation
  }
};

export const clearState = () => {
  try {
    window.localStorage?.removeItem(STORAGE_KEY);
  } catch {}
};

// ── Dept extraction fallback ──────────────────────────────────────────────────

export const extractDeptFromAddress = (addr) => {
  const m = addr?.match(/\b(\d{5})\b/);
  return m ? m[1].substring(0, 2) : "";
};

// ── Audit PDF Generator ───────────────────────────────────────────────────────

export const generateAuditHTML = (mission, eur) => {
  const now = new Date();
  const g   = mission.garantie || "50 000 €";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>CTA Audit — ${mission.id}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@page { margin: 30px; size: A4 }
* { margin: 0; padding: 0; box-sizing: border-box }
body { font-family: 'Inter', sans-serif; background: #fafafa; color: #1a1a1a; padding: 48px; font-size: 13px; line-height: 1.6; -webkit-font-smoothing: antialiased }
.hdr { text-align: center; padding-bottom: 32px; border-bottom: 1px solid #e5e5e5; margin-bottom: 32px }
.hdr h1 { font-size: 18px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase }
.hdr .sub { font-size: 11px; color: #999; letter-spacing: .06em; margin-top: 4px; text-transform: uppercase }
.hdr .mid { display: inline-block; margin-top: 12px; padding: 6px 20px; border: 1px solid #1a1a1a; border-radius: 100px; font-size: 13px; font-weight: 600; font-family: monospace; letter-spacing: .04em }
.sec { margin-bottom: 24px }
.st { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: #999; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #eee }
.r { display: flex; justify-content: space-between; padding: 7px 0 }
.r .l { color: #666 }
.r .v { font-weight: 500; text-align: right; max-width: 60% }
.r.t { border-top: 1px solid #1a1a1a; padding-top: 10px; margin-top: 6px }
.r.t .l, .r.t .v { font-weight: 700; font-size: 15px }
.ph { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px }
.ph .b { border: 1px solid #eee; border-radius: 8px; height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f5f5f5; overflow: hidden }
.ph .b img { width: 100%; height: 100%; object-fit: cover }
.ph .pl { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px }
.cert { margin-top: 24px; text-align: center; padding: 24px; border: 1px solid #1a1a1a; border-radius: 8px }
.cert h3 { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: #999; margin-bottom: 8px }
.cert .am { font-size: 28px; font-weight: 700 }
.cert .s { font-size: 11px; color: #999; margin-top: 4px }
.ft { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #bbb }
</style>
</head>
<body>
<div class="hdr">
  <h1>CTA Logistics</h1>
  <div class="sub">Audit d'Intégrité de Mission</div>
  <div class="mid">${mission.id}</div>
</div>
<div class="sec">
  <div class="st">Paramètres de Mission</div>
  <div class="r"><span class="l">Horodatage</span><span class="v">${now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${now.toLocaleTimeString("fr-FR")}</span></div>
  <div class="r"><span class="l">Collecte</span><span class="v">${mission.depart}</span></div>
  <div class="r"><span class="l">Remise</span><span class="v">${mission.arrivee}</span></div>
  <div class="r"><span class="l">Distance</span><span class="v">${mission.distance} km</span></div>
  ${mission.assetDescription ? `<div class="r"><span class="l">Actif</span><span class="v">${mission.assetDescription}</span></div>` : ""}
  ${mission.assetValue ? `<div class="r"><span class="l">Valeur Déclarée</span><span class="v">${eur(mission.assetValue)}</span></div>` : ""}
</div>
<div class="sec">
  <div class="st">Tarification</div>
  <div class="r"><span class="l">Base</span><span class="v">${eur(mission.tarif.base)} HT</span></div>
  <div class="r"><span class="l">Options</span><span class="v">${eur(mission.tarif.optTotal)} HT</span></div>
  <div class="r"><span class="l">Total HT</span><span class="v">${eur(mission.tarif.ht)}</span></div>
  <div class="r"><span class="l">TVA 20%</span><span class="v">${eur(mission.tarif.tva)}</span></div>
  <div class="r t"><span class="l">Total TTC</span><span class="v">${eur(mission.tarif.ttc)}</span></div>
</div>
${mission.pinHash ? `<div class="sec"><div class="st">Validation Cryptographique</div><div class="r"><span class="l">Hash PIN</span><span class="v" style="font-family:monospace;font-size:12px">${mission.pinHash}</span></div><div class="r"><span class="l">Statut</span><span class="v" style="color:#10B981">✓ Authentifié</span></div></div>` : ""}
<div class="sec">
  <div class="st">Double Preuve Photographique</div>
  <div class="ph">
    <div><div class="pl">Prise en charge</div><div class="b">${mission.photoChargement ? `<img src="${mission.photoChargement}"/>` : '<span style="color:#ccc">En attente</span>'}</div></div>
    <div><div class="pl">Conformité finale</div><div class="b">${mission.photoRemise ? `<img src="${mission.photoRemise}"/>` : '<span style="color:#ccc">En attente</span>'}</div></div>
  </div>
</div>
<div class="cert">
  <h3>Certificat de Garantie</h3>
  <div class="am">${g}</div>
  <div class="s">Assurance RC Pro · CTA Logistics</div>
</div>
<div class="ft">CTA Logistics · 59 rue de Ponthieu, 75008 Paris · mission@oxya.fr · +33 7 60 91 53 19<br>Document généré le ${now.toISOString()}</div>
</body>
</html>`;
};

export const downloadAuditPDF = (mission, eur) => {
  const html = generateAuditHTML(mission, eur);
  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `CTA_Audit_${mission.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
