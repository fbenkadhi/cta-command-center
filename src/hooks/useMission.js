/**
 * CTA Logistics — useMission Hook
 * Centralise la gestion d'état mission + persistence localStorage
 */

import { useState, useEffect, useCallback } from "react";
import { loadState, saveState, clearState } from "../utils/mission";

export function useMission() {
  const [mission, setMissionState] = useState(() => loadState());

  // Sync avec localStorage à chaque changement
  useEffect(() => {
    saveState(mission);
  }, [mission]);

  const setMission = useCallback((next) => {
    setMissionState(typeof next === "function" ? next : next);
  }, []);

  const updateMission = useCallback((updates) => {
    setMissionState((prev) => prev ? { ...prev, ...updates } : null);
  }, []);

  const resetMission = useCallback(() => {
    setMissionState(null);
    clearState();
  }, []);

  return { mission, setMission, updateMission, resetMission };
}
