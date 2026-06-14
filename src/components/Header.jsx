import { useMemo, useState } from "react";
import { useApp } from "../store.jsx";
import { SHIFTS, SHIFT_STYLE, cx } from "../data.js";
import { ShiftIcon, UsersIcon, BoltIcon, SunIcon, MoonIcon } from "./Icons.jsx";
import logoUrl from "../assets/algo-logo.svg";

export function Header({ t, user, onLogout }) {
  const {
    activeTab,
    setActiveTab,
    currentUpdater,
    setCurrentUpdater,
    updaters,
    setModal,
    serverOnline,
    isDark,
    setIsDark,
    companies,
    drivers,
    resetBoardReviewed,
  } = useApp();

  // Step-1 shift filter: pick your shift first, then your name.
  const [shiftFilter, setShiftFilter] = useState(null);

  // Updaters visible in the dropdown — filtered to the selected shift (or all).
  const visibleUpdaters = useMemo(
    () => (shiftFilter ? updaters.filter((u) => u.shift === shiftFilter) : updaters),
    [updaters, shiftFilter],
  );

  // Company ids for the active board, used by "Reset Done".
  const boardCompanyIds = useMemo(() => {
    if (activeTab === "mgmt") return new Set();
    return new Set(companies.filter((c) => c.board === activeTab).map((c) => c.id));
  }, [companies, activeTab]);

  const reviewedCount = useMemo(
    () => drivers.filter((d) => boardCompanyIds.has(d.companyId) && d.isReviewed).length,
    [drivers, boardCompanyIds],
  );

  const handleShiftClick = (shift) => {
    // Toggle off if clicking the same shift again.
    setShiftFilter((f) => (f === shift ? null : shift));
    // Clear selected updater if they don't belong to the newly chosen shift.
    if (currentUpdater && currentUpdater.shift !== shift) setCurrentUpdater(null);
  };

  const tabs = [
    { k: "A", l: "Board A" },
    { k: "B", l: "Board B" },
    { k: "mgmt", l: "Mgmt & Logs" },
  ];

  return (
    <header className={cx("fixed top-0 left-0 right-0 z-40 h-12 flex items-center gap-2 px-4", t.headerCls)}>
      {/* Logo */}
      <div className="flex items-center shrink-0">
        <img src={logoUrl} alt="AG" draggable={false} className="h-6 w-auto" />
      </div>

      {/* Server status */}
      <div className="flex items-center gap-1 shrink-0" title={serverOnline ? "Server connected" : "Server offline"}>
        <span className={cx("w-2 h-2 rounded-full", serverOnline ? "bg-emerald-500" : "bg-rose-500 animate-pulse")} />
        <span className={cx("text-xs hidden lg:inline", t.textMut)}>{serverOnline ? "Live" : "Offline"}</span>
      </div>

      {/* Board tabs */}
      <nav className="flex items-center gap-0.5 shrink-0">
        {tabs.map(({ k, l }) => (
          <button
            key={k}
            onClick={() => setActiveTab(k)}
            className={cx(
              "px-2.5 py-1 rounded-lg text-xs font-semibold btn-press whitespace-nowrap",
              activeTab === k ? t.tabActive : t.tabInactive,
            )}
          >
            {l}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* ── Shift filter pills ── pick your shift first */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        {SHIFTS.map((shift) => {
          const active = shiftFilter === shift;
          return (
            <button
              key={shift}
              onClick={() => handleShiftClick(shift)}
              className={cx(
                "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold btn-press border transition-colors",
                active
                  ? cx(SHIFT_STYLE[shift].pill, "border-current/20 shadow-sm")
                  : cx(t.btnSec, "opacity-70 hover:opacity-100"),
              )}
              title={`Filter to ${shift} shift`}
            >
              <ShiftIcon shift={shift} size={11} />
              {shift}
            </button>
          );
        })}
      </div>

      {/* ── Updater select (filtered by chosen shift) ── */}
      <select
        value={currentUpdater?.id ?? ""}
        onChange={(e) => {
          const found = updaters.find((u) => u.id === Number(e.target.value)) ?? null;
          setCurrentUpdater(found);
          // Auto-set shift filter to the chosen person's shift.
          if (found) setShiftFilter(found.shift);
        }}
        className={cx(
          "border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 min-w-[130px] max-w-[160px]",
          t.inputCls,
          currentUpdater && SHIFT_STYLE[currentUpdater.shift]?.ring,
        )}
        title="Select yourself as the current updater"
      >
        <option value="">— Who are you? —</option>
        {shiftFilter
          ? visibleUpdaters.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nickname}
              </option>
            ))
          : SHIFTS.map((shift) => {
              const people = updaters.filter((u) => u.shift === shift);
              if (!people.length) return null;
              return (
                <optgroup key={shift} label={`${shift} Shift`}>
                  {people.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nickname}
                    </option>
                  ))}
                </optgroup>
              );
            })}
      </select>

      {/* Dark mode toggle */}
      <button
        onClick={() => setIsDark((v) => !v)}
        className={cx("w-8 h-8 rounded-lg flex items-center justify-center btn-press shrink-0", t.glassIcon, t.textPri)}
        title={isDark ? "Light mode" : "Dark mode"}
      >
        {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      </button>

      {/* Team Stats */}
      {activeTab !== "mgmt" && (
        <button
          onClick={() => setModal({ type: "teamStats" })}
          className={cx("hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs btn-press shrink-0", t.btnSec)}
        >
          <UsersIcon size={15} /> Stats
        </button>
      )}

      {/* Reset Done — unmark all reviewed drivers on this board */}
      {activeTab !== "mgmt" && (
        <button
          onClick={() => reviewedCount > 0 && resetBoardReviewed(boardCompanyIds)}
          disabled={reviewedCount === 0}
          title={reviewedCount > 0 ? `Uncheck all ${reviewedCount} completed drivers on this board` : "No completed drivers"}
          className={cx(
            "hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs btn-press whitespace-nowrap shrink-0",
            reviewedCount > 0
              ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 border border-amber-400/30"
              : "bg-slate-400/20 text-slate-400 cursor-not-allowed border border-transparent",
          )}
        >
          ↺ Reset Done{reviewedCount > 0 ? ` (${reviewedCount})` : ""}
        </button>
      )}

      {/* Assign All */}
      {activeTab !== "mgmt" && (
        <button
          onClick={() => currentUpdater && setModal({ type: "confirmAssignAll" })}
          disabled={!currentUpdater}
          className={cx(
            "hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs btn-press whitespace-nowrap shrink-0",
            currentUpdater ? t.btnPri : "bg-slate-400/30 text-slate-400 cursor-not-allowed",
          )}
        >
          <BoltIcon size={14} /> Assign All
        </button>
      )}

      {/* User / Logout */}
      {user && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cx("text-xs font-semibold hidden lg:inline", t.textSec)} title={`Signed in as ${user.username}`}>
            {user.name || user.username}
          </span>
          <button
            onClick={onLogout}
            className={cx("px-2.5 py-1 rounded-lg font-semibold text-xs btn-press", t.btnSec)}
            title="Log out"
          >
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
