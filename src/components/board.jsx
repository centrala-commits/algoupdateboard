import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../store.jsx";
import {
  SHIFTS,
  SHIFT_STYLE,
  STATUS_COLOR,
  STATUSES,
  cx,
  nowTime,
} from "../data.js";
import { EldDot } from "./ui.jsx";
import { DeliveryPicker } from "./DeliveryPicker.jsx";
import { ShiftIcon, TrashIcon, TruckIcon } from "./Icons.jsx";

// Small inline notes input — saves on blur, syncs when Supabase data arrives.
function NotesCell({ value, driverId, t }) {
  const { updateDriver } = useApp();
  const [draft, setDraft] = useState(value ?? "");
  const focused = useRef(false);

  // Sync draft when external value changes (Supabase load / real-time update),
  // but never overwrite text the user is actively typing.
  useEffect(() => {
    if (!focused.current) setDraft(value ?? "");
  }, [value]);

  const save = useCallback(() => {
    focused.current = false;
    if (draft !== (value ?? "")) updateDriver(driverId, { notes: draft });
  }, [draft, value, driverId, updateDriver]);

  return (
    <input
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={() => { focused.current = true; }}
      onBlur={save}
      placeholder="Notes…"
      className={cx("text-xs px-1.5 py-0.5 rounded border w-full min-w-0 focus:outline-none focus:ring-1 bg-transparent", t.inputCls)}
    />
  );
}

// ---------------------------------------------------------------------------
// One driver row.
// ---------------------------------------------------------------------------
const DriverRow = memo(function DriverRow({ driver, t }) {
  const { currentUpdater, updateDriver, bumpLog, updaters, assignDriverUpdater } = useApp();

  // Marking reviewed (with an updater selected) attributes the row to that
  // updater and logs one update. Un-checking just clears the flag — it does not
  // re-stamp or count as an update. With no current updater we never write a
  // sentinel into updatedBy (that previously desynced the Updater <select>).
  const toggleReview = useCallback(() => {
    const next = !driver.isReviewed;
    if (next && currentUpdater) {
      updateDriver(driver.id, { isReviewed: true, updatedBy: currentUpdater.nickname, updatedAt: nowTime() });
      bumpLog(currentUpdater);
    } else {
      updateDriver(driver.id, { isReviewed: next });
    }
  }, [driver.id, driver.isReviewed, currentUpdater, updateDriver, bumpLog]);

  const changeStatus = useCallback(
    (e) => {
      const status = e.target.value;
      if (currentUpdater) {
        updateDriver(driver.id, { status, updatedBy: currentUpdater.nickname, updatedAt: nowTime() });
        bumpLog(currentUpdater);
      } else {
        updateDriver(driver.id, { status });
      }
    },
    [driver.id, currentUpdater, updateDriver, bumpLog],
  );

  // NEW: assign a specific responsible updater to just this driver.
  const changeUpdater = useCallback(
    (e) => {
      const nick = e.target.value;
      assignDriverUpdater(driver.id, nick ? updaters.find((u) => u.nickname === nick) ?? null : null);
    },
    [driver.id, updaters, assignDriverUpdater],
  );

  const setDelivery = useCallback(
    (date) => updateDriver(driver.id, { deliveryDate: date }),
    [driver.id, updateDriver],
  );

  // ELD link lives in the (repurposed) notes field. Click opens it; if none is
  // set yet it prompts for one. Double-click always lets you edit/replace it.
  const eldUrl = driver.notes ?? "";
  const openEld = useCallback(() => {
    if (eldUrl) {
      window.open(/^https?:\/\//i.test(eldUrl) ? eldUrl : `https://${eldUrl}`, "_blank", "noopener");
    } else {
      const v = window.prompt(`Paste the ELD link for ${driver.name}:`, "");
      if (v && v.trim()) updateDriver(driver.id, { notes: v.trim() });
    }
  }, [eldUrl, driver.id, driver.name, updateDriver]);
  const editEld = useCallback(() => {
    const v = window.prompt(`ELD link for ${driver.name} (clear to remove):`, eldUrl);
    if (v !== null) updateDriver(driver.id, { notes: v.trim() });
  }, [eldUrl, driver.id, driver.name, updateDriver]);

  // A driver assigned to someone since removed from the roster — keep showing them.
  const orphan = driver.updatedBy && !updaters.some((u) => u.nickname === driver.updatedBy);

  return (
    <tr className={cx(t.tblRow, t.tblHover, "transition-opacity duration-200", driver.isReviewed && "row-fade")}>
      <td className="px-2 py-1.5 text-center w-16">
        <button
          onClick={toggleReview}
          className={cx(
            "w-7 h-7 rounded-full border-2 text-xs font-bold flex items-center justify-center mx-auto btn-press",
            driver.isReviewed
              ? "bg-emerald-500 border-emerald-500 text-white check-bounce"
              : cx("border-slate-400 text-transparent hover:border-emerald-600", t.textPri),
          )}
        >
          {driver.isReviewed ? "✓" : ""}
        </button>
      </td>

      <td className={cx("px-3 py-1.5 w-52", t.textPri)}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={openEld}
            onDoubleClick={editEld}
            title={eldUrl ? `Open ELD: ${eldUrl}  (double-click to edit)` : "Click to add an ELD link"}
            className={cx(
              "shrink-0 w-6 h-6 flex items-center justify-center rounded-md btn-press border",
              eldUrl
                ? "text-emerald-600 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20"
                : cx(t.textMut, "border-transparent hover:bg-white/30"),
            )}
          >
            <TruckIcon size={15} />
          </button>
          <div className="min-w-0">
            <div className="font-semibold text-sm leading-snug truncate">{driver.name}</div>
            <div className={cx("text-xs font-mono tracking-wider", t.textMut)}>{driver.truck}</div>
          </div>
        </div>
      </td>

      <td className="px-2 py-1.5 w-36">
        <select
          value={driver.status}
          onChange={changeStatus}
          className={cx(
            "text-sm font-bold border rounded px-1.5 py-1.5 w-full cursor-pointer btn-press focus:outline-none focus:ring-1",
            t.inputCls,
          )}
          style={{ color: STATUS_COLOR[driver.status] }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} style={{ color: STATUS_COLOR[s], background: "#ffffff" }}>
              {s}
            </option>
          ))}
        </select>
      </td>

      <td className="px-3 py-1.5 w-36">
        <div className="flex items-center gap-2">
          <EldDot />
          <span className={cx("text-xs font-mono", t.textMut)}>API needed</span>
        </div>
      </td>

      <td className="px-3 py-1.5 w-32">
        <DeliveryPicker value={driver.deliveryDate} onChange={setDelivery} t={t} />
      </td>

      <td className="px-3 py-1.5 w-44">
        <select
          value={driver.updatedBy ?? ""}
          onChange={changeUpdater}
          className={cx(
            "text-xs font-semibold border rounded px-1.5 py-1 w-full cursor-pointer btn-press focus:outline-none focus:ring-1",
            t.inputCls,
            driver.updatedBy ? t.accentText : "",
          )}
          title="Assign responsible updater"
        >
          <option value="" style={{ color: "#0f172a", background: "#ffffff" }}>— Unassigned —</option>
          {SHIFTS.map((shift) => (
            <optgroup key={shift} label={`${shift} Shift`} style={{ color: "#0f172a", background: "#ffffff" }}>
              {updaters
                .filter((u) => u.shift === shift)
                .map((u) => (
                  <option key={u.id} value={u.nickname} style={{ color: "#0f172a", background: "#ffffff" }}>
                    {u.nickname}
                  </option>
                ))}
            </optgroup>
          ))}
          {orphan && <option value={driver.updatedBy} style={{ color: "#0f172a", background: "#ffffff" }}>{driver.updatedBy} (former)</option>}
        </select>
        {driver.updatedAt && <div className={cx("text-xs mt-0.5", t.textMut)}>{driver.updatedAt}</div>}
      </td>
    </tr>
  );
});

// ---------------------------------------------------------------------------
// One company card (header + driver table).
// ---------------------------------------------------------------------------
const CompanyBlock = memo(function CompanyBlock({ company, drivers, t, onAddDriver, onDelete, onAssignCompany }) {
  const { currentUpdater } = useApp();
  const reviewed = drivers.filter((d) => d.isReviewed).length;
  const pct = drivers.length ? Math.round((reviewed / drivers.length) * 100) : 0;

  return (
    <div className={cx("mb-3 rounded-xl overflow-hidden", t.blockCls)}>
      <div className={cx("flex items-center justify-between px-4 py-2.5 gap-3", t.blockHd)}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-bold text-sm tracking-wide truncate">{company.name}</span>
          <span className="text-xs opacity-50 shrink-0">{drivers.length} drivers</span>
          {reviewed > 0 && (
            <span className="text-xs bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded-full font-semibold shrink-0">
              {pct}% done
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Assign current updater to all drivers in this company only */}
          <button
            onClick={() => currentUpdater && onAssignCompany(company.id)}
            disabled={!currentUpdater}
            title={currentUpdater ? `Assign ${currentUpdater.nickname} to all drivers in ${company.name}` : "Select yourself first"}
            className={cx(
              "text-xs px-2.5 py-1 rounded-lg font-semibold btn-press whitespace-nowrap",
              currentUpdater ? t.blockBtn : "opacity-40 cursor-not-allowed " + t.blockBtn,
            )}
          >
            Assign this company
          </button>
          <button
            onClick={() => onAddDriver(company.id)}
            className={cx("text-xs px-2.5 py-1 rounded-lg font-semibold btn-press", t.blockBtn)}
          >
            + Driver
          </button>
          <button
            onClick={() => onDelete(company)}
            title="Delete company"
            className={cx("w-7 h-7 flex items-center justify-center rounded-lg btn-press", t.btnDanger)}
          >
            <TrashIcon size={15} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[760px]">
          <thead>
            <tr className={t.tblHead}>
              <th className="px-2 py-1.5 text-center text-xs font-semibold w-16 uppercase tracking-wider">Done</th>
              <th className="px-3 py-1.5 text-left text-xs font-semibold w-52 uppercase tracking-wider">Driver / Truck</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold w-36 uppercase tracking-wider">Status</th>
              <th className="px-3 py-1.5 text-left text-xs font-semibold w-36 uppercase tracking-wider">ELD</th>
              <th className="px-3 py-1.5 text-left text-xs font-semibold w-32 uppercase tracking-wider">Delivery</th>
              <th className="px-3 py-1.5 text-left text-xs font-semibold w-44 uppercase tracking-wider">Updater</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={5} className={cx("px-4 py-6 text-center text-xs italic", t.textMut)}>
                  No drivers — click "+ Driver" to add one.
                </td>
              </tr>
            ) : (
              drivers.map((d) => <DriverRow key={d.id} driver={d} t={t} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// A board (A or B): shift-responsible pills + company cards.
// ---------------------------------------------------------------------------
export function BoardView({ board, t }) {
  const { companies, drivers, setModal, updaters, assignCompanyDrivers, currentUpdater } = useApp();
  const boardCompanies = useMemo(() => companies.filter((c) => c.board === board), [companies, board]);
  const companyIds = useMemo(() => new Set(boardCompanies.map((c) => c.id)), [boardCompanies]);
  const driverCount = useMemo(
    () => drivers.filter((d) => companyIds.has(d.companyId)).length,
    [drivers, companyIds],
  );

  return (
    <div className="relative z-10 px-4 py-3">
      {/* who is responsible on each shift */}
      <div className="flex gap-3 mb-3 flex-wrap">
        {SHIFTS.map((shift) => {
          const people = updaters.filter((u) => u.shift === shift);
          if (people.length === 0) return null;
          return (
            <div
              key={shift}
              className={cx(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border border-current/10",
                SHIFT_STYLE[shift].pill,
              )}
            >
              <ShiftIcon shift={shift} size={14} />
              <span className="font-bold">{shift}:</span>
              <span className="opacity-80">{people.map((p) => p.nickname).join(", ")}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-3 gap-4">
        <div>
          <h2 className={cx("text-base font-bold", t.textPri)}>Board {board}</h2>
          <p className={cx("text-xs", t.textSec)}>
            {boardCompanies.length} companies · {driverCount} drivers
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "addCompany", board })}
          className={cx("text-sm px-3 py-1.5 rounded-lg font-semibold btn-press", t.btnGreen)}
        >
          + Add Company
        </button>
      </div>

      {boardCompanies.length === 0 ? (
        <div className={cx("text-center py-24 text-sm italic", t.textMut)}>No companies on Board {board} yet.</div>
      ) : (
        boardCompanies.map((c) => (
          <CompanyBlock
            key={c.id}
            company={c}
            drivers={drivers.filter((d) => d.companyId === c.id)}
            t={t}
            onAddDriver={(companyId) => setModal({ type: "addDriver", companyId })}
            onDelete={(company) => setModal({ type: "deleteCompany", company })}
            onAssignCompany={(companyId) => assignCompanyDrivers(companyId, currentUpdater)}
          />
        ))
      )}
    </div>
  );
}
