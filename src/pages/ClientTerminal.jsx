/**
 * CTA Logistics — Client Terminal
 * Portail de réservation de mission · 4 phases + checkout
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MapPin, Navigation, ArrowRight, Clock, Calendar,
  Phone, PhoneCall, DollarSign, Lock, Eye, EyeOff,
  Fingerprint, Shield, Package, FileText, Check,
  CheckCircle2, Send, Plus, LayoutGrid, ArrowLeft,
  AlertCircle, RefreshCw,
} from "lucide-react";

import GlassCard from "../components/GlassCard";
import {
  Button, Label, Pill, Spinner, PriceRow, PhaseIndicator,
  INPUT_STYLE, INPUT_STYLE_PLAIN, SELECT_STYLE, T,
} from "../components/ui/primitives";
import {
  OPTIONS, TIME_SLOTS, computeTarif, eur, formatDateFR, getMinDate,
} from "../utils/pricing";
import {
  genMissionId, genClientId, hashPin,
  loadState, extractDeptFromAddress, downloadAuditPDF,
} from "../utils/mission";
import { missionService } from "../utils/supabase";

// ── Sub-components ─────────────────────────────────────────────────────────────

const DispatchConfirmation = ({ missionData, onNewMission, onDashboard }) => (
  <div style={{ animation: "ctaFadeIn 0.4s ease" }}>
    <GlassCard variant="success" padding={40} style={{ textAlign: "center", marginBottom: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.successMuted, border: `1.5px solid ${T.success}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <CheckCircle2 size={36} strokeWidth={1.2} color={T.success} />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: T.primary, fontFamily: T.font, letterSpacing: "-0.02em", marginBottom: 8 }}>Mission Déployée</h3>
      <p style={{ fontSize: 13, color: T.secondary, fontFamily: T.font, marginBottom: 16, lineHeight: 1.5 }}>
        L'ordre a été inscrit dans le registre sécurisé.<br />Dispatch silencieux confirmé.
      </p>
      <Pill color={T.gold} style={{ fontSize: 13, padding: "6px 18px" }}>{missionData.id}</Pill>
    </GlassCard>

    <GlassCard style={{ marginBottom: 16 }}>
      <PriceRow label="Tracking ID"     value={missionData.id}                              color={T.accent} />
      {missionData.pinHash && <PriceRow label="Hash Sécuritaire" value={missionData.pinHash} />}
      <PriceRow label="Collecte"        value={(missionData.depart || "").substring(0, 32) + "…"} />
      <PriceRow label="Remise"          value={(missionData.arrivee || "").substring(0, 32) + "…"} />
      {missionData.collecteDate && (
        <PriceRow label="Date Collecte" value={`${formatDateFR(missionData.collecteDate)} · ${missionData.collecteSlot}`} />
      )}
      {missionData.assetValue && (
        <PriceRow label="Valeur Déclarée" value={eur(missionData.assetValue)} color={T.gold} />
      )}
      <div style={{ height: 1, background: T.glassBorder, margin: "12px 0" }} />
      <PriceRow label="Investissement TTC" value={eur(missionData.tarif.ttc)} bold color={T.gold} />
    </GlassCard>

    <div style={{ display: "grid", gap: 10 }}>
      <Button variant="gold" onClick={onNewMission}><Plus size={16} /> Déployer un autre actif</Button>
      <Button variant="ghost" onClick={onDashboard}><LayoutGrid size={16} /> Voir le Dashboard</Button>
    </div>
  </div>
);

const DashboardCard = ({ missions, loading, onNew, onRefresh }) => {
  const STATUS_COLOR = { 1: T.accent, 2: T.accent, 3: T.gold, 4: T.gold, 5: T.success };
  const STATUS_LABEL = { 1: "Initiée", 2: "Déployé", 3: "Prise en Charge", 4: "En Transit", 5: "Remise" };

  if (loading) {
    return (
      <GlassCard style={{ textAlign: "center", padding: 60 }}>
        <Spinner size={28} color={T.gold} />
        <p style={{ fontSize: 13, color: T.secondary, fontFamily: T.font, marginTop: 16 }}>Chargement du registre…</p>
      </GlassCard>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.primary, fontFamily: T.font, letterSpacing: "-0.02em", margin: 0 }}>Registre des Missions</h2>
          <p style={{ fontSize: 11, color: T.muted, fontFamily: T.font, margin: "4px 0 0" }}>
            {missions.length} mission{missions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={onRefresh} style={{ width: 38, height: 38, borderRadius: T.radiusSm, background: T.elevated, border: `1px solid ${T.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.secondary }}>
          <RefreshCw size={16} strokeWidth={1.2} />
        </button>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        {missions.length === 0 && (
          <GlassCard style={{ textAlign: "center", padding: 48 }}>
            <AlertCircle size={28} strokeWidth={1.2} color={T.muted} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: T.secondary, fontFamily: T.font }}>Aucune mission enregistrée</p>
          </GlassCard>
        )}
        {missions.map((m) => {
          const s = m.step || 1;
          return (
            <GlassCard key={m.id || m.mission_id} interactive padding={18}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.primary, fontFamily: T.mono }}>{m.id || m.mission_id}</span>
                <Pill color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Collecte</div>
                  <div style={{ fontSize: 12, color: T.secondary, fontFamily: T.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.depart}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Remise</div>
                  <div style={{ fontSize: 12, color: T.secondary, fontFamily: T.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.arrivee}</div>
                </div>
              </div>
              {m.collecteDate && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={11} strokeWidth={1.2} color={T.muted} />
                  <span style={{ fontSize: 11, color: T.tertiary, fontFamily: T.font }}>{formatDateFR(m.collecteDate)} · {m.collecteSlot}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.glassBorder}` }}>
                <span style={{ fontSize: 12, color: T.tertiary }}>{m.distance} km{m.assetValue ? ` · ${eur(m.assetValue)}` : ""}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.gold, fontFamily: T.mono }}>
                  {m.tarif ? eur(m.tarif.ttc) : "—"}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <Button variant="gold" onClick={onNew}><Plus size={16} /> Nouvelle Mission</Button>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ClientTerminal({ mission, setMission }) {
  // Phase 1
  const [depart, setDepart]           = useState("");
  const [arrivee, setArrivee]         = useState("");
  const [departDept, setDepartDept]   = useState("");
  const [arriveeDept, setArriveeDept] = useState("");
  const [distance, setDistance]       = useState(null);
  const [duree, setDuree]             = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Phase 2
  const [collecteDate, setCollecteDate]   = useState("");
  const [collecteSlot, setCollecteSlot]   = useState("");
  const [livraisonDate, setLivraisonDate] = useState("");
  const [livraisonSlot, setLivraisonSlot] = useState("");

  // Phase 3
  const [assetDescription, setAssetDescription]       = useState("");
  const [assetValue, setAssetValue]                   = useState("");
  const [contactExpediteur, setContactExpediteur]     = useState("");
  const [contactDestinataire, setContactDestinataire] = useState("");
  const [notes, setNotes]                             = useState("");

  // Phase 4
  const [options, setOptions] = useState({});
  const [pin, setPin]         = useState("");
  const [showPin, setShowPin] = useState(false);

  // Flow
  const [phase, setPhase]             = useState(1);
  const [showRecap, setShowRecap]     = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchedMission, setDispatchedMission] = useState(null);
  const [view, setView]               = useState("auto");
  const [missions, setMissions]       = useState([]);
  const [dashLoading, setDashLoading] = useState(true);

  const clientId  = useMemo(() => genClientId(), []);
  const departRef = useRef(null);
  const arriveeRef= useRef(null);

  const pinRequired = !!options.pin;
  const pinReady    = !pinRequired || pin.length === 6;

  // ── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => { fetchMissions(); }, []);

  const fetchMissions = useCallback(async () => {
    setDashLoading(true);
    const local = loadState();
    const data  = await missionService.getByClientId(clientId, () => local ? [local] : []);
    setMissions(data);
    setDashLoading(false);
  }, [clientId]);

  // ── Google Places Autocomplete ────────────────────────────────────────────────
  useEffect(() => {
    if (!window.google?.maps?.places) return;
    const opts = { componentRestrictions: { country: "fr" }, types: ["address"] };

    const setup = (ref, setter, deptSetter) => {
      if (!ref.current) return;
      const ac = new window.google.maps.places.Autocomplete(ref.current, opts);
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place?.formatted_address) {
          setter(place.formatted_address);
          const pc = place.address_components?.find((c) => c.types.includes("postal_code"));
          if (pc) deptSetter(pc.long_name.substring(0, 2));
        }
      });
    };

    setup(departRef,  setDepart,  setDepartDept);
    setup(arriveeRef, setArrivee, setArriveeDept);
  }, [view]);

  // ── Distance Calculation ──────────────────────────────────────────────────────
  const calculateDistance = useCallback(() => {
    if (!depart.trim() || !arrivee.trim()) return;
    setCalculating(true);

    if (window.google?.maps?.DistanceMatrixService) {
      const svc = new window.google.maps.DistanceMatrixService();
      svc.getDistanceMatrix(
        { origins: [depart], destinations: [arrivee], travelMode: "DRIVING" },
        (res, status) => {
          if (status === "OK" && res.rows[0]?.elements[0]?.status === "OK") {
            const el = res.rows[0].elements[0];
            setDistance(Math.round(el.distance.value / 1000));
            setDuree(Math.round(el.duration.value / 60));
          }
          setCalculating(false);
          setPhase(2);
        }
      );
    } else {
      // Simulation fallback (sans API Google)
      if (!departDept)  setDepartDept(extractDeptFromAddress(depart));
      if (!arriveeDept) setArriveeDept(extractDeptFromAddress(arrivee));
      const simKm = 30 + ((depart.length * arrivee.length) % 500);
      setTimeout(() => {
        setDistance(simKm);
        setDuree(Math.round(simKm * 1.1));
        setCalculating(false);
        setPhase(2);
      }, 1200);
    }
  }, [depart, arrivee, departDept, arriveeDept]);

  // ── Tarif Live ────────────────────────────────────────────────────────────────
  const tarif = useMemo(() => {
    if (!distance) return null;
    return computeTarif(distance, departDept, arriveeDept, options);
  }, [distance, departDept, arriveeDept, options]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handlePinChange = (val) => { if (/^\d{0,6}$/.test(val)) setPin(val); };

  const toggleOpt = (id) => {
    setOptions((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (id === "pin" && !next.pin) setPin("");
      return next;
    });
  };

  // ── Dispatch ──────────────────────────────────────────────────────────────────
  const engage = async () => {
    if (!tarif || !pinReady) return;
    setDispatching(true);

    const missionId = genMissionId();
    const pinHash   = pinRequired ? hashPin(pin) : null;
    const optActive = OPTIONS.filter((o) => options[o.id]).map((o) => o.label);
    const garantie  = options.garantie ? "150 000 €" : "50 000 €";

    const missionData = {
      id: missionId, mission_id: missionId, client_id: clientId,
      depart, arrivee, departDept, arriveeDept, distance, duree,
      pin: pinRequired ? pin : null, pinHash, pinRequired,
      options, optionsLabels: optActive, tarif, garantie, step: 1,
      collecteDate, collecteSlot, livraisonDate, livraisonSlot,
      assetValue:         assetValue ? parseFloat(assetValue) : null,
      assetDescription:   assetDescription || null,
      contactExpediteur,
      contactDestinataire: contactDestinataire || null,
      notes:              notes || null,
      photoChargement:    null,
      photoRemise:        null,
      pinVerified:        false,
      timestamp:          new Date().toISOString(),
      created_at:         new Date().toISOString(),
    };

    setMission(missionData);

    // Supabase insert avec fallback silencieux
    await missionService.insert(
      {
        mission_id: missionId, client_id: clientId,
        depart, arrivee, depart_dept: departDept, arrivee_dept: arriveeDept,
        distance, duree, pin_hash: pinHash, pin_required: pinRequired,
        options_labels: optActive, tarif_base: tarif.base,
        tarif_ht: tarif.ht, tarif_tva: tarif.tva, tarif_ttc: tarif.ttc,
        is_idf: tarif.isIDF, garantie,
        collecte_date: collecteDate, collecte_slot: collecteSlot,
        livraison_date: livraisonDate, livraison_slot: livraisonSlot,
        asset_value: assetValue ? parseFloat(assetValue) : null,
        asset_description: assetDescription || null,
        contact_expediteur: contactExpediteur,
        contact_destinataire: contactDestinataire || null,
        notes: notes || null,
        step: 1, pin_verified: false,
      },
      null // pas de fallback local ici (déjà dans setMission)
    );

    setDispatchedMission(missionData);
    setDispatching(false);
    setView("confirmation");
  };

  const resetForm = () => {
    setDepart(""); setArrivee(""); setDepartDept(""); setArriveeDept("");
    setDistance(null); setDuree(null);
    setPin(""); setShowPin(false); setOptions({});
    setPhase(1); setShowRecap(false);
    setCollecteDate(""); setCollecteSlot(""); setLivraisonDate(""); setLivraisonSlot("");
    setAssetValue(""); setAssetDescription("");
    setContactExpediteur(""); setContactDestinataire(""); setNotes("");
    setDispatchedMission(null);
  };

  const handleNewMission  = () => { resetForm(); setView("form"); };
  const handleDashboard   = () => { fetchMissions(); setView("dashboard"); };

  // ── View Resolution ───────────────────────────────────────────────────────────
  const currentView = (() => {
    if (view === "confirmation" && dispatchedMission) return "confirmation";
    if (view === "form")        return "form";
    if (view === "dashboard")   return "dashboard";
    if (!dashLoading && missions.length > 0) return "dashboard";
    if (!dashLoading)           return "form";
    return "loading";
  })();

  // ── Renders ───────────────────────────────────────────────────────────────────

  if (currentView === "loading") return (
    <GlassCard style={{ textAlign: "center", padding: 60 }}>
      <Spinner size={28} color={T.gold} />
      <p style={{ fontSize: 13, color: T.secondary, fontFamily: T.font, marginTop: 16 }}>Initialisation…</p>
    </GlassCard>
  );

  if (currentView === "confirmation") return (
    <DispatchConfirmation missionData={dispatchedMission} onNewMission={handleNewMission} onDashboard={handleDashboard} />
  );

  if (currentView === "dashboard") return (
    <DashboardCard missions={missions} loading={dashLoading} onNew={handleNewMission} onRefresh={fetchMissions} />
  );

  // ── Recap Checkout ────────────────────────────────────────────────────────────

  if (showRecap && tarif) return (
    <div style={{ animation: "ctaFadeIn 0.3s ease" }}>
      <button onClick={() => setShowRecap(false)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.secondary, fontSize: 13, fontFamily: T.font, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={14} strokeWidth={1.5} /> Modifier la commande
      </button>

      <GlassCard variant="gold" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <CheckCircle2 size={18} strokeWidth={1.5} color={T.gold} />
          <span style={{ fontSize: 15, fontWeight: 700, color: T.primary, fontFamily: T.font }}>Récapitulatif de Mission</span>
        </div>

        {/* Itinéraire */}
        <div style={{ background: T.elevated, borderRadius: T.radiusSm, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Itinéraire</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
              <div style={{ width: 1, height: 20, background: T.glassBorder }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: T.primary, margin: "0 0 8px", fontFamily: T.font }}>{depart}</p>
              <p style={{ fontSize: 13, color: T.primary, margin: 0, fontFamily: T.font }}>{arrivee}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: T.tertiary, fontFamily: T.mono }}>{distance} km</span>
            <span style={{ fontSize: 12, color: T.tertiary, fontFamily: T.mono }}>{Math.floor(duree / 60)}h{String(duree % 60).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Planning */}
        <div style={{ background: T.elevated, borderRadius: T.radiusSm, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Planning</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: T.tertiary, marginBottom: 2 }}>Collecte</div>
              <div style={{ fontSize: 13, color: T.primary }}>{formatDateFR(collecteDate)}</div>
              <div style={{ fontSize: 12, color: T.accent, fontFamily: T.mono }}>{collecteSlot}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.tertiary, marginBottom: 2 }}>Livraison</div>
              <div style={{ fontSize: 13, color: T.primary }}>{formatDateFR(livraisonDate)}</div>
              <div style={{ fontSize: 12, color: T.gold, fontFamily: T.mono }}>{livraisonSlot}</div>
            </div>
          </div>
        </div>

        {/* Actif */}
        {(assetDescription || assetValue) && (
          <div style={{ background: T.elevated, borderRadius: T.radiusSm, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Actif Transporté</div>
            {assetDescription && <p style={{ fontSize: 13, color: T.primary, margin: "0 0 4px" }}>{assetDescription}</p>}
            {assetValue && <span style={{ fontSize: 14, fontWeight: 700, color: T.gold, fontFamily: T.mono }}>{eur(parseFloat(assetValue))}</span>}
          </div>
        )}

        {/* Contacts */}
        <div style={{ background: T.elevated, borderRadius: T.radiusSm, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Contacts</div>
          <div style={{ display: "grid", gridTemplateColumns: contactDestinataire ? "1fr 1fr" : "1fr", gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: T.tertiary, marginBottom: 2 }}>Expéditeur</div>
              <div style={{ fontSize: 13, color: T.primary, fontFamily: T.mono }}>{contactExpediteur}</div>
            </div>
            {contactDestinataire && (
              <div>
                <div style={{ fontSize: 11, color: T.tertiary, marginBottom: 2 }}>Destinataire</div>
                <div style={{ fontSize: 13, color: T.primary, fontFamily: T.mono }}>{contactDestinataire}</div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div style={{ background: T.elevated, borderRadius: T.radiusSm, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Instructions</div>
            <p style={{ fontSize: 13, color: T.secondary, margin: 0, lineHeight: 1.5 }}>{notes}</p>
          </div>
        )}

        {/* Options */}
        {OPTIONS.filter((o) => options[o.id]).length > 0 && (
          <div style={{ background: T.elevated, borderRadius: T.radiusSm, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Options Sécurité</div>
            {OPTIONS.filter((o) => options[o.id]).map((o) => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span style={{ fontSize: 12, color: T.secondary }}>{o.label}</span>
                <span style={{ fontSize: 12, color: T.gold, fontFamily: T.mono }}>+{eur(o.price)}</span>
              </div>
            ))}
            {pinRequired && (
              <div style={{ marginTop: 6, fontSize: 11, color: T.accent, fontFamily: T.mono }}>PIN Hash: {hashPin(pin)}</div>
            )}
          </div>
        )}

        <div style={{ height: 1, background: T.glassBorder, margin: "12px 0" }} />
        <PriceRow label="Base HT"             value={eur(tarif.base)} />
        {tarif.optTotal > 0 && <PriceRow label="Options HT" value={`+${eur(tarif.optTotal)}`} />}
        <PriceRow label="Total HT"             value={eur(tarif.ht)} bold />
        <PriceRow label="TVA 20%"              value={eur(tarif.tva)} />
        <PriceRow label="Investissement TTC"   value={eur(tarif.ttc)} bold color={T.gold} />
      </GlassCard>

      <Button variant="gold" onClick={engage} disabled={dispatching}>
        {dispatching
          ? <><Spinner size={16} color="#0A0A0B" /> Inscription en cours…</>
          : <><Send size={16} strokeWidth={1.2} /> Confirmer & Déployer la Mission</>
        }
      </Button>
    </div>
  );

  // ── Form View ─────────────────────────────────────────────────────────────────

  const phase2Ready = collecteDate && collecteSlot && livraisonDate && livraisonSlot;
  const phase3Ready = contactExpediteur.trim().length >= 10;

  return (
    <div>
      {missions.length > 0 && (
        <button onClick={handleDashboard} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.secondary, fontSize: 13, fontFamily: T.font, marginBottom: 16, padding: 0 }}>
          <ArrowLeft size={14} strokeWidth={1.5} /> Retour au Dashboard
        </button>
      )}

      {/* ── Phase 1 — Localisation ─────────────────────────────────────────── */}
      <GlassCard style={{ marginBottom: 16 }} active={phase === 1}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <PhaseIndicator done={phase > 1} active={phase === 1} number={1} />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.primary, fontFamily: T.font, letterSpacing: "-0.01em" }}>Localisation des Actifs</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label required>Point de Collecte</Label>
          <div style={{ position: "relative" }}>
            <MapPin size={16} strokeWidth={1.2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
            <input ref={departRef} type="text" value={depart} onChange={(e) => setDepart(e.target.value)} placeholder="Adresse de prise en charge" style={INPUT_STYLE} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Label required>Point de Remise</Label>
          <div style={{ position: "relative" }}>
            <Navigation size={16} strokeWidth={1.2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
            <input ref={arriveeRef} type="text" value={arrivee} onChange={(e) => setArrivee(e.target.value)} placeholder="Adresse de destination" style={INPUT_STYLE} />
          </div>
        </div>

        <Button onClick={calculateDistance} disabled={!depart.trim() || !arrivee.trim() || calculating}>
          {calculating
            ? <><Clock size={16} strokeWidth={1.2} /> Calcul en cours…</>
            : <><ArrowRight size={16} strokeWidth={1.2} /> Calculer la distance</>
          }
        </Button>
      </GlassCard>

      {/* Distance result */}
      {distance !== null && tarif && (
        <GlassCard variant="accent" style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
            {[
              { val: `${distance}`, unit: " km",  label: "Distance",                      color: T.primary },
              { val: `${Math.floor(duree / 60)}h${String(duree % 60).padStart(2,"0")}`, unit: "", label: "ETA", color: T.secondary },
              { val: eur(tarif.base), unit: "",    label: tarif.isIDF ? "Forfait IDF" : "Base + km", color: T.gold },
            ].map((d, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 700, color: d.color, fontFamily: T.font, letterSpacing: "-0.03em" }}>
                  {d.val}<span style={{ fontSize: 13, fontWeight: 400, color: T.tertiary }}>{d.unit}</span>
                </div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{d.label}</div>
              </div>
            ))}
          </div>
          {!tarif.isIDF && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: T.goldMuted, borderRadius: T.radiusSm, fontSize: 12, color: T.gold, fontFamily: T.mono, textAlign: "center" }}>
              120 € + ({distance} km × 1,80 €) = {eur(tarif.base)}
            </div>
          )}
        </GlassCard>
      )}

      {/* ── Phase 2 — Planification ────────────────────────────────────────── */}
      {phase >= 2 && (
        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <PhaseIndicator done={phase > 2} active={phase === 2} number={2} />
            <span style={{ fontSize: 14, fontWeight: 600, color: T.primary, fontFamily: T.font }}>Planification</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <Label required>Date de Collecte</Label>
              <input type="date" value={collecteDate} onChange={(e) => setCollecteDate(e.target.value)} min={getMinDate()} style={{ ...INPUT_STYLE_PLAIN, colorScheme: "dark", fontSize: 14 }} />
            </div>
            <div>
              <Label required>Créneau Collecte</Label>
              <select value={collecteSlot} onChange={(e) => setCollecteSlot(e.target.value)} style={SELECT_STYLE}>
                <option value="">Sélectionner</option>
                {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: phase2Ready && phase === 2 ? 16 : 0 }}>
            <div>
              <Label required>Date de Livraison</Label>
              <input type="date" value={livraisonDate} onChange={(e) => setLivraisonDate(e.target.value)} min={collecteDate || getMinDate()} style={{ ...INPUT_STYLE_PLAIN, colorScheme: "dark", fontSize: 14 }} />
            </div>
            <div>
              <Label required>Créneau Livraison</Label>
              <select value={livraisonSlot} onChange={(e) => setLivraisonSlot(e.target.value)} style={SELECT_STYLE}>
                <option value="">Sélectionner</option>
                {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {phase2Ready && phase === 2 && (
            <Button onClick={() => setPhase(3)}>
              <ArrowRight size={16} strokeWidth={1.2} /> Continuer
            </Button>
          )}
        </GlassCard>
      )}

      {/* ── Phase 3 — Détails Actif ────────────────────────────────────────── */}
      {phase >= 3 && (
        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <PhaseIndicator done={phase > 3} active={phase === 3} number={3} />
            <span style={{ fontSize: 14, fontWeight: 600, color: T.primary, fontFamily: T.font }}>Détails de l'Actif</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label>Description de l'actif</Label>
            <input type="text" value={assetDescription} onChange={(e) => setAssetDescription(e.target.value)} placeholder="Ex: Montre Cartier Santos, Robe Haute Couture…" style={INPUT_STYLE_PLAIN} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label>Valeur déclarée (€)</Label>
            <div style={{ position: "relative" }}>
              <DollarSign size={16} strokeWidth={1.2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
              <input type="number" min="0" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} placeholder="45 000" style={INPUT_STYLE} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <Label required>Tél. Expéditeur</Label>
              <div style={{ position: "relative" }}>
                <Phone size={14} strokeWidth={1.2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                <input type="tel" value={contactExpediteur} onChange={(e) => setContactExpediteur(e.target.value)} placeholder="06 12 34 56 78" style={INPUT_STYLE} />
              </div>
            </div>
            <div>
              <Label>Tél. Destinataire</Label>
              <div style={{ position: "relative" }}>
                <PhoneCall size={14} strokeWidth={1.2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                <input type="tel" value={contactDestinataire} onChange={(e) => setContactDestinataire(e.target.value)} placeholder="06 98 76 54 32" style={INPUT_STYLE} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: phase3Ready && phase === 3 ? 16 : 0 }}>
            <Label>Instructions spéciales</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Code d'accès, étage, personne à contacter, fragilité…"
              rows={3}
              style={{ ...INPUT_STYLE_PLAIN, resize: "vertical", minHeight: 70, fontFamily: T.font }}
            />
          </div>

          {phase3Ready && phase === 3 && (
            <Button onClick={() => setPhase(4)}>
              <ArrowRight size={16} strokeWidth={1.2} /> Continuer
            </Button>
          )}
        </GlassCard>
      )}

      {/* ── Phase 4 — Options Sécurité ─────────────────────────────────────── */}
      {phase >= 4 && tarif && (
        <>
          <GlassCard style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <PhaseIndicator done={false} active number={4} />
              <span style={{ fontSize: 14, fontWeight: 600, color: T.primary, fontFamily: T.font }}>Options de Sécurité</span>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {OPTIONS.map((opt) => {
                const Icon   = { pin: Fingerprint, atmo: Shield, hub: Package, garantie: FileText }[opt.id];
                const active = !!options[opt.id];
                return (
                  <div key={opt.id}>
                    <div
                      onClick={() => toggleOpt(opt.id)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: active ? T.accentMuted : "transparent",
                        border: `1px solid ${active ? T.accentBorder : T.glassBorder}`,
                        borderRadius: T.radiusSm,
                        borderBottomLeftRadius:  (opt.id === "pin" && active) ? 0 : T.radiusSm,
                        borderBottomRightRadius: (opt.id === "pin" && active) ? 0 : T.radiusSm,
                        padding: "14px 16px", cursor: "pointer", transition: "all 0.25s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${active ? T.accent : T.muted}`, background: active ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                          {active && <Check size={12} strokeWidth={2.5} color="#fff" />}
                        </div>
                        {Icon && <Icon size={16} strokeWidth={1.2} color={active ? T.accent : T.muted} />}
                        <span style={{ fontSize: 13, color: active ? T.primary : T.secondary, fontFamily: T.font, fontWeight: 500 }}>{opt.label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.gold, fontFamily: T.mono }}>+{opt.price} €</span>
                    </div>

                    {/* PIN inline input */}
                    {opt.id === "pin" && active && (
                      <div style={{ background: T.accentMuted, border: `1px solid ${T.accentBorder}`, borderTop: "none", borderRadius: `0 0 ${T.radiusSm}px ${T.radiusSm}px`, padding: 16 }}>
                        <Label style={{ marginBottom: 8 }}>Code PIN · 6 chiffres</Label>
                        <div style={{ position: "relative" }}>
                          <Lock size={16} strokeWidth={1.2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                          <input
                            type={showPin ? "text" : "password"}
                            value={pin}
                            onChange={(e) => handlePinChange(e.target.value)}
                            placeholder="• • • • • •"
                            maxLength={6}
                            inputMode="numeric"
                            style={{ ...INPUT_STYLE, padding: "13px 50px 13px 42px", fontSize: 22, fontFamily: T.mono, letterSpacing: "0.3em", textAlign: "center", borderColor: pin.length === 6 ? `${T.success}40` : T.glassBorder }}
                          />
                          <button onClick={() => setShowPin(!showPin)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 4 }}>
                            {showPin ? <EyeOff size={16} strokeWidth={1.2} /> : <Eye size={16} strokeWidth={1.2} />}
                          </button>
                        </div>
                        {pin.length === 6 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                            <Check size={14} strokeWidth={2} color={T.success} />
                            <span style={{ fontSize: 12, color: T.success }}>PIN enregistré</span>
                            <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, marginLeft: "auto" }}>{hashPin(pin)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Live pricing */}
          <GlassCard variant="gold" style={{ marginBottom: 16 }}>
            <PriceRow label={tarif.isIDF ? "Forfait IDF" : `Base (120 € + ${distance} km × 1,80 €)`} value={`${eur(tarif.base)} HT`} />
            {OPTIONS.filter((o) => options[o.id]).map((o) => (
              <PriceRow key={o.id} label={o.label} value={`+${eur(o.price)}`} />
            ))}
            <div style={{ height: 1, background: T.glassBorder, margin: "12px 0" }} />
            <PriceRow label="Total HT"           value={eur(tarif.ht)} bold />
            <PriceRow label="TVA 20%"             value={eur(tarif.tva)} />
            <PriceRow label="Investissement TTC"  value={eur(tarif.ttc)} bold color={T.gold} />
          </GlassCard>

          <Button variant="gold" onClick={() => setShowRecap(true)} disabled={!pinReady}>
            <CheckCircle2 size={16} strokeWidth={1.2} /> Vérifier & Confirmer
          </Button>
        </>
      )}
    </div>
  );
}
