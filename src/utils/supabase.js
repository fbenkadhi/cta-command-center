/**
 * CTA Logistics — Supabase Client
 * Pattern : Graceful degradation vers localStorage si Supabase indisponible
 */

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const isConfigured = SUPABASE_URL && !SUPABASE_URL.includes("YOUR_PROJECT");

/**
 * Fetch wrapper Supabase REST API
 */
export const supabaseFetch = async (path, options = {}) => {
  if (!isConfigured) {
    throw new Error("Supabase non configuré — mode offline activé");
  }

  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const headers = {
    apikey:          SUPABASE_ANON_KEY,
    Authorization:   `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type":  "application/json",
    Prefer:          options.prefer ?? "return=representation",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase ${res.status}: ${err}`);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
};

/**
 * Missions CRUD avec fallback localStorage automatique
 */
export const missionService = {
  /**
   * Récupère toutes les missions d'un client
   */
  async getByClientId(clientId, fallbackFn) {
    try {
      const data = await supabaseFetch(
        `/missions?client_id=eq.${clientId}&order=created_at.desc`
      );
      return data ?? [];
    } catch (err) {
      console.warn("[Supabase] getByClientId failed — fallback local:", err.message);
      return fallbackFn?.() ?? [];
    }
  },

  /**
   * Insère une mission
   */
  async insert(payload, fallbackFn) {
    try {
      await supabaseFetch("/missions", {
        method: "POST",
        body:   JSON.stringify(payload),
        prefer: "return=minimal",
      });
    } catch (err) {
      console.warn("[Supabase] insert failed — fallback local:", err.message);
      fallbackFn?.(payload);
    }
  },

  /**
   * Met à jour une mission (step, photos, pinVerified…)
   */
  async update(missionId, updates, fallbackFn) {
    try {
      await supabaseFetch(`/missions?mission_id=eq.${missionId}`, {
        method: "PATCH",
        body:   JSON.stringify(updates),
        prefer: "return=minimal",
      });
    } catch (err) {
      console.warn("[Supabase] update failed — fallback local:", err.message);
      fallbackFn?.(updates);
    }
  },
};
