import { useMemo, useState } from "react";
import { useApp } from "../store.jsx";
import { SHIFTS, SHIFT_STYLE, cx } from "../data.js";
import { ShiftIcon } from "./Icons.jsx";

// ---------------------------------------------------------------------------
// Shift Responsibles manager.
//
// FIX: adding here now creates a *real* updater (see store.addUpdater), so the
// new person immediately shows up in the header picker, the per-driver Updater
// dropdown, Team Stats and the activity log — i.e. you can actually select and
// assign them.
// ---------------------------------------------------------------------------
function ShiftResponsibles({ t }) {
  const { updaters, addUpdater, removeUpdater } = useApp();
  const [draft, setDraft] = useState({ name: "", shift: "Day" });
  const [flash, setFlash] = useState("");

  const inputCls = cx("flex-1 border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2", t.inputCls);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    addUpdater({ nickname: draft.name.trim(), shift: draft.shift });
    setDraft((d) => ({ ...d, name: "" }));
    setFlash("Added!");
    setTimeout(() => setFlash(""), 1800);
  };

  return (
    <div className={cx("relative overflow-hidden p-4", t.formCard)}>
      <h3 className={cx("relative z-10 font-bold text-sm mb-1", t.textPri)}>Shift Responsibles</h3>
      <p className={cx("relative z-10 text-xs mb-3", t.textMut)}>
        Anyone added here becomes a selectable updater you can assign to drivers.
      </p>

      <form onSubmit={submit} className="relative z-10 flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Full name"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className={inputCls}
          required
        />
        <div className="flex gap-1">
          {SHIFTS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setDraft((d) => ({ ...d, shift: s }))}
              className={cx(
                "px-2.5 py-1.5 rounded-lg text-xs font-bold btn-press transition-all inline-flex items-center gap-1.5",
                draft.shift === s ? t.btnPri : t.btnSec,
              )}
            >
              <ShiftIcon shift={s} size={13} /> {s}
            </button>
          ))}
        </div>
        <button type="submit" className={cx("px-3 py-1.5 rounded-lg font-semibold text-sm btn-press", t.btnGreen)}>
          + Add
        </button>
        {flash && <span className="text-emerald-500 text-xs font-semibold fade-in">{flash}</span>}
      </form>

      <div className="relative z-10 grid grid-cols-3 gap-3">
        {SHIFTS.map((shift) => {
          const people = updaters.filter((u) => u.shift === shift);
          const style = SHIFT_STYLE[shift];
          return (
            <div key={shift}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className={style.pill.split(" ")[1]}><ShiftIcon shift={shift} size={15} /></span>
                <span className={cx("text-xs font-bold uppercase tracking-wider", style.pill.split(" ")[1])}>{shift}</span>
                <span className={cx("text-xs", t.textMut)}>({people.length})</span>
              </div>
              <div className="space-y-1.5">
                {people.map((u) => (
                  <div
                    key={u.id}
                    className={cx("flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs", style.pill)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cx("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                      <span className="font-semibold">{u.nickname}</span>
                    </div>
                    <button
                      onClick={() => removeUpdater(u.id)}
                      className="opacity-30 hover:opacity-80 transition-opacity text-base leading-none font-bold btn-press"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {people.length === 0 && <div className={cx("text-xs italic px-1", t.textMut)}>None assigned</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full "Mgmt & Logs" tab.
// ---------------------------------------------------------------------------
export function ManagementView({ t }) {
  const { companies, updaters, drivers, activityLog, addCompany, addDriver } = useApp();
  const [companyForm, setCompanyForm] = useState({ name: "", board: "A" });
  const [driverForm, setDriverForm] = useState({ name: "", truck: "", companyId: "", eldId: "" });
  const [companyFlash, setCompanyFlash] = useState("");
  const [driverFlash, setDriverFlash] = useState("");

  const submitCompany = (e) => {
    e.preventDefault();
    if (!companyForm.name.trim()) return;
    addCompany({ name: companyForm.name.trim(), board: companyForm.board });
    setCompanyForm({ name: "", board: "A" });
    setCompanyFlash("Company added!");
    setTimeout(() => setCompanyFlash(""), 2500);
  };

  const submitDriver = (e) => {
    e.preventDefault();
    if (!driverForm.name.trim() || !driverForm.truck.trim() || !driverForm.companyId) return;
    addDriver({
      name: driverForm.name.trim(),
      truck: driverForm.truck.trim(),
      companyId: parseInt(driverForm.companyId),
      eldId: driverForm.eldId.trim() || `ELD-${Date.now()}`,
    });
    setDriverForm({ name: "", truck: "", companyId: "", eldId: "" });
    setDriverFlash("Driver added!");
    setTimeout(() => setDriverFlash(""), 2500);
  };

  const activity = useMemo(
    () =>
      updaters.map((u) => {
        const log = activityLog.find((e) => e.id === u.id);
        const reviewed = drivers.filter((d) => d.updatedBy === u.nickname && d.isReviewed).length;
        return { ...u, updates: log?.updates ?? 0, lastAt: log?.lastAt ?? "—", reviewed };
      }),
    [updaters, activityLog, drivers],
  );

  const inputCls = cx("w-full border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2", t.inputCls);
  const labelCls = cx("block text-xs font-semibold mb-1", t.formLabel);

  return (
    <div className="relative z-10 px-4 py-3 space-y-4">
      <ShiftResponsibles t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Add company */}
          <div className={cx("relative overflow-hidden p-4", t.formCard)}>
            <h3 className={cx("relative z-10 font-bold text-sm mb-3", t.textPri)}>Add New Company</h3>
            <form onSubmit={submitCompany} className="relative z-10 space-y-3">
              <div>
                <label className={labelCls}>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g., Apex Freight Inc."
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))}
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
                      onClick={() => setCompanyForm((f) => ({ ...f, board: b }))}
                      className={cx(
                        "flex-1 py-2 rounded-lg font-bold text-sm btn-press",
                        companyForm.board === b ? t.btnPri : t.btnSec,
                      )}
                    >
                      Board {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className={cx("px-4 py-1.5 rounded-lg font-semibold text-sm btn-press", t.btnPri)}>
                  Add Company
                </button>
                {companyFlash && <span className="text-emerald-500 text-xs font-semibold fade-in">{companyFlash}</span>}
              </div>
            </form>
          </div>

          {/* Add driver */}
          <div className={cx("relative overflow-hidden p-4", t.formCard)}>
            <h3 className={cx("relative z-10 font-bold text-sm mb-3", t.textPri)}>Add New Driver</h3>
            <form onSubmit={submitDriver} className="relative z-10 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Driver Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={driverForm.name}
                    onChange={(e) => setDriverForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Truck #</label>
                  <input
                    type="text"
                    placeholder="TRK-XXX"
                    value={driverForm.truck}
                    onChange={(e) => setDriverForm((f) => ({ ...f, truck: e.target.value }))}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Company</label>
                  <select
                    value={driverForm.companyId}
                    onChange={(e) => setDriverForm((f) => ({ ...f, companyId: e.target.value }))}
                    className={inputCls}
                    required
                  >
                    <option value="">— Select —</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Board {c.board})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>
                    ELD ID <span className={t.textMut}>(opt.)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ELD-XXX"
                    value={driverForm.eldId}
                    onChange={(e) => setDriverForm((f) => ({ ...f, eldId: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className={cx("px-4 py-1.5 rounded-lg font-semibold text-sm btn-press", t.btnPri)}>
                  Add Driver
                </button>
                {driverFlash && <span className="text-emerald-500 text-xs font-semibold fade-in">{driverFlash}</span>}
              </div>
            </form>
          </div>
        </div>

        {/* Updater activity */}
        <div className={cx("relative overflow-hidden rounded-xl", t.formCard)}>
          <div className={cx("relative overflow-hidden px-4 py-2.5 font-bold text-sm rounded-t-xl", t.blockHd)}>
            <span className={t.sheen} />
            <span className="relative z-10">Updater Activity — All Shifts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={t.tblHead}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Nickname</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Shift</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">Updates</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">Reviewed</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((a) => {
                  const style = SHIFT_STYLE[a.shift];
                  return (
                    <tr key={a.id} className={cx(t.tblRow, t.tblHover)}>
                      <td className={cx("px-3 py-2 font-semibold text-xs", t.textPri)}>{a.nickname}</td>
                      <td className="px-3 py-2">
                        <span className={cx("inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full", style?.pill)}>
                          <ShiftIcon shift={a.shift} size={12} /> {a.shift}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={cx("text-xs font-bold", a.updates > 0 ? "text-emerald-700" : t.textMut)}>
                          {a.updates}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={cx("text-xs font-bold", a.reviewed > 0 ? "text-emerald-500" : t.textMut)}>
                          {a.reviewed}
                        </span>
                      </td>
                      <td className={cx("px-3 py-2 text-xs", t.textMut)}>{a.lastAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
