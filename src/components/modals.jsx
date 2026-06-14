import { useMemo, useState } from "react";
import { useApp } from "../store.jsx";
import { SHIFTS, SHIFT_STYLE, cx } from "../data.js";
import { ShiftIcon, BoltIcon } from "./Icons.jsx";

// Shared modal shell: overlay + rounded window, no entry animation.
function ModalShell({ t, size = "max-w-sm", children }) {
  return (
    <div className={cx("fixed inset-0 z-50 flex items-center justify-center", t.overlay)}>
      <div className={cx("relative w-full mx-4 rounded-2xl shadow-2xl overflow-hidden", size, t.modalCls)}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ t, title, onClose }) {
  return (
    <div className={cx("flex items-center justify-between px-5 py-3", t.blockHd)}>
      <span className="font-bold text-sm">{title}</span>
      <button onClick={onClose} className="text-xl leading-none hover:opacity-70 btn-press">
        ×
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team Stats — per-updater assignment / review progress for the active board.
// ---------------------------------------------------------------------------
export function TeamStatsModal({ t, onClose }) {
  const { currentUpdater, drivers, companies, updaters, activeBoard, assignAllOnBoard } = useApp();

  const boardCompanyIds = useMemo(
    () => new Set(companies.filter((c) => c.board === activeBoard).map((c) => c.id)),
    [companies, activeBoard],
  );
  const boardDrivers = useMemo(
    () => drivers.filter((d) => boardCompanyIds.has(d.companyId)),
    [drivers, boardCompanyIds],
  );

  const stats = useMemo(
    () =>
      updaters
        .map((u) => {
          const assigned = boardDrivers.filter((d) => d.updatedBy === u.nickname).length;
          const reviewed = boardDrivers.filter((d) => d.updatedBy === u.nickname && d.isReviewed).length;
          return { ...u, assigned, reviewed, pct: assigned ? Math.round((reviewed / assigned) * 100) : 0 };
        })
        .sort((a, b) => b.assigned - a.assigned),
    [updaters, boardDrivers],
  );

  const massAssign = () => {
    if (!currentUpdater) return;
    assignAllOnBoard(boardCompanyIds, currentUpdater);
    onClose();
  };

  return (
    <ModalShell t={t} size="max-w-2xl">
      <ModalHeader t={t} title={`Team Stats — Board ${activeBoard}`} onClose={onClose} />

      <div className="p-5 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {SHIFTS.map((shift) => {
            const people = updaters.filter((u) => u.shift === shift);
            return people.length ? (
              <span key={shift} className={cx("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold", SHIFT_STYLE[shift].pill)}>
                <ShiftIcon shift={shift} size={12} /> {shift}: {people.map((p) => p.nickname).join(", ")}
              </span>
            ) : null;
          })}
        </div>

        <div className={cx("flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl", t.formCard.replace("rounded-xl", ""))}>
          <div>
            <p className={cx("text-xs font-semibold mb-0.5", t.textSec)}>Mass-assign as</p>
            <p className={cx("text-base font-bold", t.textPri)}>
              {currentUpdater?.nickname ?? <span className="opacity-40">No updater selected</span>}
            </p>
          </div>
          <button
            onClick={massAssign}
            disabled={!currentUpdater}
            className={cx(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm btn-press",
              currentUpdater ? t.btnPri : "bg-slate-400/30 text-slate-400 cursor-not-allowed",
            )}
          >
            <BoltIcon size={15} /> Assign Me to ALL {boardDrivers.length} Drivers
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={t.tblHead}>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Updater</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Shift</th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">Assigned</th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">Reviewed</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider min-w-[100px]">Progress</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const pct = s.assigned ? Math.round((s.reviewed / s.assigned) * 100) : 0;
                const bar =
                  pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : s.assigned > 0 ? "bg-rose-500" : "bg-slate-300";
                const txt =
                  pct >= 80 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : s.assigned > 0 ? "text-rose-500" : t.textMut;
                return (
                  <tr key={s.id} className={cx(t.tblRow, t.tblHover)}>
                    <td className={cx("px-3 py-2 font-semibold text-xs", t.textPri)}>
                      {s.nickname}
                      {s.id === currentUpdater?.id && (
                        <span className="ml-1.5 text-xs bg-emerald-600/15 text-emerald-700 px-1.5 py-0.5 rounded">you</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={cx("inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full", SHIFT_STYLE[s.shift]?.pill)}>
                        <ShiftIcon shift={s.shift} size={12} /> {s.shift}
                      </span>
                    </td>
                    <td className={cx("px-3 py-2 text-center text-xs font-bold", s.assigned > 0 ? "text-emerald-700" : t.textMut)}>
                      {s.assigned}
                    </td>
                    <td className={cx("px-3 py-2 text-center text-xs font-bold", txt)}>{s.reviewed}</td>
                    <td className="px-3 py-2">
                      {s.assigned > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200/60 rounded-full h-1.5 min-w-[56px]">
                            <div className={cx("h-1.5 rounded-full transition-all duration-500", bar)} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={cx("text-xs font-semibold", txt)}>{pct}%</span>
                        </div>
                      ) : (
                        <span className={cx("text-xs", t.textMut)}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cx("px-5 pb-4 flex justify-end pt-3 border-t", t.divider)}>
        <button onClick={onClose} className={cx("px-4 py-1.5 rounded-lg font-semibold text-sm btn-press", t.btnSec)}>
          Close
        </button>
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Confirm: assign the current updater to every driver on the active board.
// ---------------------------------------------------------------------------
export function ConfirmAssignAllModal({ t, onClose }) {
  const { currentUpdater, drivers, companies, activeBoard, assignAllOnBoard } = useApp();

  const boardCompanyIds = useMemo(
    () => new Set(companies.filter((c) => c.board === activeBoard).map((c) => c.id)),
    [companies, activeBoard],
  );
  const count = useMemo(
    () => drivers.filter((d) => boardCompanyIds.has(d.companyId)).length,
    [drivers, boardCompanyIds],
  );

  const confirm = () => {
    if (!currentUpdater) return;
    assignAllOnBoard(boardCompanyIds, currentUpdater);
    onClose();
  };

  return (
    <ModalShell t={t} size="max-w-xs">
      <div className="p-5">
        <p className={cx("text-sm font-semibold mb-1.5", t.textPri)}>
          Assign <span className="text-emerald-700 font-semibold">{currentUpdater?.nickname}</span> to all <strong>{count}</strong> drivers on Board{" "}
          {activeBoard}?
        </p>
        <p className={cx("text-xs mb-4", t.textSec)}>
          Sets the Responsible Updater field only. Status and review marks stay unchanged.
        </p>
        <div className="flex gap-2">
          <button onClick={confirm} className={cx("flex-1 py-2 rounded-lg font-semibold text-sm btn-press", t.btnPri)}>
            Yes, Assign All
          </button>
          <button onClick={onClose} className={cx("flex-1 py-2 rounded-lg font-semibold text-sm btn-press", t.btnSec)}>
            Cancel
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Delete Company — confirm removing a company and all of its drivers.
// ---------------------------------------------------------------------------
export function DeleteCompanyModal({ t, company, onClose }) {
  const { drivers, removeCompany } = useApp();
  const count = useMemo(() => drivers.filter((d) => d.companyId === company.id).length, [drivers, company.id]);

  const confirm = () => {
    removeCompany(company.id);
    onClose();
  };

  return (
    <ModalShell t={t} size="max-w-xs">
      <div className="p-5">
        <p className={cx("text-sm font-semibold mb-1.5", t.textPri)}>
          Delete <span className="text-rose-600">{company.name}</span>?
        </p>
        <p className={cx("text-xs mb-4", t.textSec)}>
          This permanently removes the company{count > 0 ? ` and its ${count} driver${count === 1 ? "" : "s"}` : ""} from
          Board {company.board}. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button onClick={confirm} className={cx("flex-1 py-2 rounded-lg font-bold text-sm btn-press", t.btnDanger)}>
            Delete
          </button>
          <button onClick={onClose} className={cx("flex-1 py-2 rounded-lg font-semibold text-sm btn-press", t.btnSec)}>
            Cancel
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Add Company (quick modal from a board).
// ---------------------------------------------------------------------------
export function AddCompanyModal({ t, defaultBoard, onClose }) {
  const { addCompany } = useApp();
  const [form, setForm] = useState({ name: "", board: defaultBoard || "A" });
  const inputCls = cx("w-full border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2", t.inputCls);
  const labelCls = cx("block text-xs font-semibold mb-1", t.formLabel);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addCompany({ name: form.name.trim(), board: form.board });
    onClose();
  };

  return (
    <ModalShell t={t} size="max-w-sm">
      <ModalHeader t={t} title="Add Company" onClose={onClose} />
      <form onSubmit={submit} className="p-5 space-y-3">
        <div>
          <label className={labelCls}>Company Name</label>
          <input
            type="text"
            autoFocus
            placeholder="e.g., Apex Freight Inc."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Board</label>
          <div className="flex gap-2">
            {["A", "B"].map((b) => (
              <button
                type="button"
                key={b}
                onClick={() => setForm((f) => ({ ...f, board: b }))}
                className={cx("flex-1 py-2 rounded-lg font-bold text-sm btn-press", form.board === b ? t.btnPri : t.btnSec)}
              >
                Board {b}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" className={cx("flex-1 py-2 rounded-lg font-semibold text-sm btn-press", t.btnPri)}>
            Add Company
          </button>
          <button type="button" onClick={onClose} className={cx("flex-1 py-2 rounded-lg font-semibold text-sm btn-press", t.btnSec)}>
            Cancel
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Add Driver (quick modal from a company card).
// ---------------------------------------------------------------------------
export function AddDriverModal({ t, defaultCompanyId, onClose }) {
  const { companies, addDriver } = useApp();
  const [form, setForm] = useState({ name: "", truck: "", companyId: String(defaultCompanyId || ""), eldId: "" });
  const inputCls = cx("w-full border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2", t.inputCls);
  const labelCls = cx("block text-xs font-semibold mb-1", t.formLabel);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.truck.trim() || !form.companyId) return;
    addDriver({
      name: form.name.trim(),
      truck: form.truck.trim(),
      companyId: parseInt(form.companyId),
      eldId: form.eldId.trim() || `ELD-${Date.now()}`,
    });
    onClose();
  };

  return (
    <ModalShell t={t} size="max-w-sm">
      <ModalHeader t={t} title="Add Driver" onClose={onClose} />
      <form onSubmit={submit} className="p-5 space-y-3">
        <div>
          <label className={labelCls}>Driver Name</label>
          <input
            type="text"
            autoFocus
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputCls}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Truck #</label>
            <input
              type="text"
              placeholder="TRK-XXX"
              value={form.truck}
              onChange={(e) => setForm((f) => ({ ...f, truck: e.target.value }))}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>ELD ID</label>
            <input
              type="text"
              placeholder="ELD-XXX (opt.)"
              value={form.eldId}
              onChange={(e) => setForm((f) => ({ ...f, eldId: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Company</label>
          <select
            value={form.companyId}
            onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
            className={inputCls}
            required
          >
            <option value="" style={{ color: "#0f172a", background: "#ffffff" }}>— Select company —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id} style={{ color: "#0f172a", background: "#ffffff" }}>
                {c.name} (Board {c.board})
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" className={cx("flex-1 py-2 rounded-lg font-semibold text-sm btn-press", t.btnPri)}>
            Add Driver
          </button>
          <button type="button" onClick={onClose} className={cx("flex-1 py-2 rounded-lg font-semibold text-sm btn-press", t.btnSec)}>
            Cancel
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
