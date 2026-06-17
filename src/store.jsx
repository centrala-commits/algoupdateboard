import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  SEED_COMPANIES,
  SEED_DRIVERS,
  SEED_UPDATERS,
  fakeEldPing,
  nowTime,
} from "./data.js";
import { THEME } from "./theme.js";
import { dbEnabled } from "./supabase.js";
import {
  loadAll,
  dbAddCompany,
  dbDeleteCompany,
  dbAddDriver,
  dbUpdateDriver,
  dbDeleteDriver,
  dbAddUpdater,
  dbDeleteUpdater,
  dbAssignDrivers,
  dbLoadAccounts,
  dbAddAccount,
  dbDeleteAccount,
} from "./db.js";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

function localLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children, user }) {
  const [isDark, setIsDark] = useState(false);
  const t = THEME[isDark ? "dark" : "light"];

  // Optional click sound when marking a driver reviewed (persisted locally).
  const [soundOn, setSoundOn] = useState(() => localLoad("agb_sound", false));
  useEffect(() => { localStorage.setItem("agb_sound", JSON.stringify(soundOn)); }, [soundOn]);

  // Local suggestion box (kept on this device only — see ManagementView).
  const [suggestions, setSuggestions] = useState(() => localLoad("agb_suggestions", []));
  useEffect(() => { localStorage.setItem("agb_suggestions", JSON.stringify(suggestions)); }, [suggestions]);
  const addSuggestion = useCallback((text, author) => {
    const entry = { id: Date.now(), text, author: author || "Anonymous", at: nowTime() };
    setSuggestions((list) => [entry, ...list]);
  }, []);
  const removeSuggestion = useCallback((id) => {
    setSuggestions((list) => list.filter((s) => s.id !== id));
  }, []);

  const [activeTab, setActiveTab] = useState("A");
  // With Supabase configured we start empty and load from the DB; otherwise we
  // persist to localStorage so data survives page refreshes.
  const [companies, setCompanies] = useState(() => dbEnabled ? [] : localLoad("agb_companies", SEED_COMPANIES));
  const [drivers, setDrivers] = useState(() => dbEnabled ? [] : localLoad("agb_drivers", SEED_DRIVERS));
  const [updaters, setUpdaters] = useState(() => dbEnabled ? [] : localLoad("agb_updaters", SEED_UPDATERS));
  const [currentUpdater, setCurrentUpdater] = useState(() => {
    if (dbEnabled) return null;
    const saved = localLoad("agb_updaters", SEED_UPDATERS);
    return saved[0] ?? null;
  });
  const [activityLog, setActivityLog] = useState([]);
  const [modal, setModal] = useState(null);
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(dbEnabled);

  // Shared monotonic id source (in-memory mode only).
  const nextId = useRef(200);
  // Always-current snapshot of drivers so the mount-only poll loop also pings
  // drivers added after mount (avoids a stale closure over `drivers`).
  const driversRef = useRef(drivers);
  driversRef.current = drivers;
  const activeBoard = activeTab; // "A" | "B" | "mgmt"

  // --- BroadcastChannel: real-time cross-tab sync (non-DB mode) ---------------
  // Tracks how many incoming BC messages are pending so we don't echo them back.
  const bcRef = useRef(null);
  const bcPendingRef = useRef({ companies: 0, drivers: 0, updaters: 0 });

  useEffect(() => {
    if (dbEnabled) return;
    const bc = new BroadcastChannel("agb_sync");
    bcRef.current = bc;
    bc.onmessage = ({ data: { type, payload } }) => {
      if (type === "drivers") { bcPendingRef.current.drivers++; setDrivers(payload); }
      else if (type === "companies") { bcPendingRef.current.companies++; setCompanies(payload); }
      else if (type === "updaters") { bcPendingRef.current.updaters++; setUpdaters(payload); }
    };
    return () => { bc.close(); bcRef.current = null; };
  }, []);

  // --- initial load from Supabase --------------------------------------------
  useEffect(() => {
    if (!dbEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await loadAll();
        if (cancelled) return;
        setCompanies(data.companies);
        setUpdaters(data.updaters);
        setDrivers(data.drivers);
        setCurrentUpdater(data.updaters[0] ?? null);
      } catch (e) {
        console.error("Supabase load failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist to localStorage and broadcast to other tabs on every state change.
  useEffect(() => {
    if (dbEnabled) return;
    localStorage.setItem("agb_companies", JSON.stringify(companies));
    if (bcPendingRef.current.companies > 0) { bcPendingRef.current.companies--; return; }
    bcRef.current?.postMessage({ type: "companies", payload: companies });
  }, [companies]);

  useEffect(() => {
    if (dbEnabled) return;
    localStorage.setItem("agb_drivers", JSON.stringify(drivers));
    if (bcPendingRef.current.drivers > 0) { bcPendingRef.current.drivers--; return; }
    bcRef.current?.postMessage({ type: "drivers", payload: drivers });
  }, [drivers]);

  useEffect(() => {
    if (dbEnabled) return;
    localStorage.setItem("agb_updaters", JSON.stringify(updaters));
    if (bcPendingRef.current.updaters > 0) { bcPendingRef.current.updaters--; return; }
    bcRef.current?.postMessage({ type: "updaters", payload: updaters });
  }, [updaters]);

  // --- fake "server connection" heartbeat ------------------------------------
  useEffect(() => {
    const handle = setInterval(() => setServerOnline(Math.random() > 0.04), 30000);
    return () => clearInterval(handle);
  }, []);

  // --- driver mutations ------------------------------------------------------
  const updateDriver = useCallback((id, patch) => {
    setDrivers((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    if (dbEnabled) dbUpdateDriver(id, patch).catch((e) => console.error("updateDriver:", e));
  }, []);

  const bumpLog = useCallback((updater, count = 1) => {
    if (!updater) return;
    const at = nowTime();
    setActivityLog((log) =>
      log.find((e) => e.id === updater.id)
        ? log.map((e) => (e.id === updater.id ? { ...e, updates: e.updates + count, lastAt: at } : e))
        : [...log, { id: updater.id, nickname: updater.nickname, shift: updater.shift, updates: count, lastAt: at }],
    );
  }, []);

  // Assign (or clear) the responsible updater on a single driver row.
  const assignDriverUpdater = useCallback(
    (driverId, updater) => {
      if (!updater) {
        updateDriver(driverId, { updatedBy: null, updatedAt: null });
        return;
      }
      updateDriver(driverId, { updatedBy: updater.nickname, updatedAt: nowTime() });
      bumpLog(updater);
    },
    [updateDriver, bumpLog],
  );

  // Bulk-assign the current updater to every driver on a board.
  const assignAllOnBoard = useCallback(
    (companyIdSet, updater) => {
      if (!updater) return;
      const at = nowTime();
      const ids = driversRef.current.filter((d) => companyIdSet.has(d.companyId)).map((d) => d.id);
      setDrivers((list) =>
        list.map((d) => (companyIdSet.has(d.companyId) ? { ...d, updatedBy: updater.nickname, updatedAt: at } : d)),
      );
      bumpLog(updater, ids.length);
      if (dbEnabled) dbAssignDrivers(ids, { updatedBy: updater.nickname, updatedAt: at }).catch((e) => console.error("assignAll:", e));
    },
    [bumpLog],
  );

  // Assign the current updater to every driver in a single company.
  const assignCompanyDrivers = useCallback(
    (companyId, updater) => {
      if (!updater) return;
      const at = nowTime();
      const ids = driversRef.current.filter((d) => d.companyId === companyId).map((d) => d.id);
      setDrivers((list) =>
        list.map((d) => (d.companyId === companyId ? { ...d, updatedBy: updater.nickname, updatedAt: at } : d)),
      );
      bumpLog(updater, ids.length);
      if (dbEnabled) dbAssignDrivers(ids, { updatedBy: updater.nickname, updatedAt: at }).catch((e) => console.error("assignCompany:", e));
    },
    [bumpLog],
  );

  // Reset isReviewed to false for all drivers on the given board (by company id set).
  const resetBoardReviewed = useCallback((companyIdSet) => {
    const ids = driversRef.current.filter((d) => companyIdSet.has(d.companyId)).map((d) => d.id);
    setDrivers((list) =>
      list.map((d) => companyIdSet.has(d.companyId) ? { ...d, isReviewed: false } : d),
    );
    if (dbEnabled) {
      ids.forEach((id) => dbUpdateDriver(id, { isReviewed: false }).catch(console.error));
    }
  }, []);

  // --- company / driver creation ---------------------------------------------
  const addCompany = useCallback(async (c) => {
    if (dbEnabled) {
      try {
        const row = await dbAddCompany(c);
        setCompanies((list) => [...list, row]);
      } catch (e) {
        console.error("addCompany:", e);
      }
    } else {
      setCompanies((list) => [...list, { id: nextId.current++, ...c }]);
    }
  }, []);

  // Delete a company and every driver that belonged to it (DB cascades).
  const removeCompany = useCallback((id) => {
    setCompanies((list) => list.filter((c) => c.id !== id));
    setDrivers((list) => list.filter((d) => d.companyId !== id));
    if (dbEnabled) dbDeleteCompany(id).catch((e) => console.error("removeCompany:", e));
  }, []);

  const addDriver = useCallback(async (d) => {
    if (dbEnabled) {
      try {
        const row = await dbAddDriver(d);
        setDrivers((list) => [...list, row]);
      } catch (e) {
        console.error("addDriver:", e);
      }
    } else {
      setDrivers((list) => [
        ...list,
        {
          id: nextId.current++,
          companyId: d.companyId,
          name: d.name,
          truck: d.truck,
          eldId: d.eldId,
          status: "All good",
          eldActive: false,
          location: "Fetching…",
          deliveryDate: null,
          isReviewed: false,
          updatedBy: null,
          updatedAt: null,
        },
      ]);
    }
  }, []);

  // Delete a single driver (DB row + local state).
  const removeDriver = useCallback((id) => {
    setDrivers((list) => list.filter((d) => d.id !== id));
    if (dbEnabled) dbDeleteDriver(id).catch((e) => console.error("removeDriver:", e));
  }, []);

  // --- updaters (a.k.a. shift responsibles) ----------------------------------
  const addUpdater = useCallback(async ({ nickname, shift }) => {
    if (dbEnabled) {
      try {
        const row = await dbAddUpdater({ nickname, shift });
        setUpdaters((list) => [...list, row]);
      } catch (e) {
        console.error("addUpdater:", e);
      }
    } else {
      setUpdaters((list) => [...list, { id: nextId.current++, nickname, shift }]);
    }
  }, []);

  const removeUpdater = useCallback((id) => {
    setUpdaters((list) => list.filter((u) => u.id !== id));
    setCurrentUpdater((cur) => (cur?.id === id ? null : cur));
    if (dbEnabled) dbDeleteUpdater(id).catch((e) => console.error("removeUpdater:", e));
  }, []);

  // --- user accounts (admin only, Supabase) ----------------------------------
  const [accounts, setAccounts] = useState([]);
  const isAdmin = !user?.role || user?.role === "admin";

  useEffect(() => {
    if (!dbEnabled || !isAdmin) return;
    let cancelled = false;
    dbLoadAccounts()
      .then((data) => { if (!cancelled) setAccounts(data); })
      .catch((e) => console.error("loadAccounts:", e));
    return () => { cancelled = true; };
  }, [isAdmin]);

  const addAccount = useCallback(async ({ username, name, password, role }) => {
    const row = await dbAddAccount({ username, name, password, role });
    setAccounts((list) => [...list, row]);
    return row;
  }, []);

  const removeAccount = useCallback(async (id) => {
    await dbDeleteAccount(id);
    setAccounts((list) => list.filter((a) => a.id !== id));
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo(
    () => ({
      t,
      isDark,
      setIsDark,
      soundOn,
      setSoundOn,
      suggestions,
      addSuggestion,
      removeSuggestion,
      activeTab,
      setActiveTab,
      activeBoard,
      companies,
      setCompanies,
      drivers,
      setDrivers,
      updaters,
      addUpdater,
      removeUpdater,
      currentUpdater,
      setCurrentUpdater,
      activityLog,
      setActivityLog,
      modal,
      setModal,
      serverOnline,
      dbEnabled,
      loading,
      updateDriver,
      assignDriverUpdater,
      assignAllOnBoard,
      assignCompanyDrivers,
      resetBoardReviewed,
      bumpLog,
      addCompany,
      removeCompany,
      addDriver,
      removeDriver,
      closeModal,
      user,
      accounts,
      addAccount,
      removeAccount,
    }),
    [
      t, isDark, soundOn, suggestions, addSuggestion, removeSuggestion,
      activeTab, activeBoard, companies, drivers, updaters, currentUpdater,
      activityLog, modal, serverOnline, loading, addUpdater, removeUpdater, updateDriver,
      assignDriverUpdater, assignAllOnBoard, assignCompanyDrivers, resetBoardReviewed,
      bumpLog, addCompany, removeCompany, addDriver, removeDriver, closeModal,
      user, accounts, addAccount, removeAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
