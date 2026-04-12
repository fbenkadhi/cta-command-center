/**
 * CTA Logistics — Pricing Engine
 * Forfait base 120€ HT · +1.80€/km hors IDF · TVA 20%
 */

export const IDF_DEPTS = ["75", "77", "78", "91", "92", "93", "94", "95"];
export const SEUIL_IDF_KM = 50;
export const FORFAIT_BASE = 120;
export const PRIX_KM = 1.80;
export const TVA_RATE = 0.20;

export const OPTIONS = [
  { id: "pin",      label: "Authentification PIN Destinataire",    price: 25,  category: "security" },
  { id: "atmo",     label: "Atmosphère Protégée",                  price: 85,  category: "logistics" },
  { id: "hub",      label: "Transit J+1 · Sécurisation Hub",       price: 60,  category: "logistics" },
  { id: "garantie", label: "Extension Garantie Ad Valorem 150k€",  price: 120, category: "insurance" },
];

/**
 * Détermine si le trajet est éligible au forfait IDF
 * Règle : les deux départements doivent être en IDF ET distance ≤ 50km
 */
export const isIleDeFrance = (departDept, arriveeDept, distanceKm) => {
  const bothIDF =
    IDF_DEPTS.includes(String(departDept)) &&
    IDF_DEPTS.includes(String(arriveeDept));
  return bothIDF && distanceKm <= SEUIL_IDF_KM;
};

/**
 * Calcule le tarif complet d'une mission
 * @param {number} distanceKm
 * @param {string} departDept  - ex: "75"
 * @param {string} arriveeDept - ex: "92"
 * @param {Object} selectedOptions - { pin: true, atmo: false, ... }
 * @returns {{ base, optTotal, ht, tva, ttc, isIDF, breakdown }}
 */
export const computeTarif = (distanceKm, departDept, arriveeDept, selectedOptions = {}) => {
  const idf = isIleDeFrance(departDept, arriveeDept, distanceKm);

  // Base tarifaire
  const base = idf
    ? FORFAIT_BASE
    : FORFAIT_BASE + (distanceKm * PRIX_KM);

  // Options actives
  const activeOptions = OPTIONS.filter((o) => selectedOptions[o.id]);
  const optTotal = activeOptions.reduce((sum, o) => sum + o.price, 0);

  const ht  = base + optTotal;
  const tva = ht * TVA_RATE;
  const ttc = ht + tva;

  // Détail lisible pour l'audit
  const breakdown = {
    forfaitBase: FORFAIT_BASE,
    kmSupplement: idf ? 0 : distanceKm * PRIX_KM,
    options: activeOptions.map((o) => ({ label: o.label, price: o.price })),
  };

  return {
    base:     Math.round(base * 100) / 100,
    optTotal: Math.round(optTotal * 100) / 100,
    ht:       Math.round(ht * 100) / 100,
    tva:      Math.round(tva * 100) / 100,
    ttc:      Math.round(ttc * 100) / 100,
    isIDF:    idf,
    breakdown,
  };
};

/**
 * Formatters
 */
export const eur = (n) =>
  new Intl.NumberFormat("fr-FR", {
    style:    "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n ?? 0);

export const formatDateFR = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
  });
};

export const getMinDate = () => new Date().toISOString().split("T")[0];

export const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const h = 7 + i;
  return `${String(h).padStart(2, "0")}:00 – ${String(h + 1).padStart(2, "0")}:00`;
});

export const TRACKING_STEPS = [
  { id: 1, label: "Mission Initiée",     desc: "Ordre validé par le Command Center" },
  { id: 2, label: "Agent Déployé",       desc: "Unité de Transit en approche" },
  { id: 3, label: "Prise en Charge",     desc: "Audit photographique · Scellement" },
  { id: 4, label: "Transit Sécurisé",    desc: "Actif en déplacement · Intégrité surveillée" },
  { id: 5, label: "Remise & Conformité", desc: "Validation finale · Photo de conformité" },
];

export const STATUS_MAP = {
  1: { label: "Initiée",        color: "#3B82F6" },
  2: { label: "Déployé",        color: "#3B82F6" },
  3: { label: "Prise en Charge", color: "#C9A55C" },
  4: { label: "En Transit",     color: "#C9A55C" },
  5: { label: "Remise",         color: "#10B981" },
};
