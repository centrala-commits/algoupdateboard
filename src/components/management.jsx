import { useMemo, useState } from "react";
import { useApp } from "../store.jsx";
import { SHIFTS, SHIFT_STYLE, STATUS_COLOR, cx } from "../data.js";
import { ShiftIcon, TrashIcon, PencilIcon } from "./Icons.jsx";

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
// Driver roster manager — list every driver grouped by company. Each row can be
// edited inline (name + truck #) or deleted (via the shared DeleteDriverModal).
// ---------------------------------------------------------------------------
function DriverManager({ t }) {
  const { companies, drivers, updateDriver, setModal } = useApp();
  const [boardFilter, setBoardFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({ name: "", truck: "" });

  const startEdit = (d) => { setEditId(d.id); setDraft({ name: d.name, truck: d.truck ?? "" }); };
  const saveEdit = (d) => {
    const name = draft.name.trim();
    const truck = draft.truck.trim();
    if (!name) return; // name is required
    const patch = {};
    if (name !== d.name) patch.name = name;
    if (truck !== (d.truck ?? "")) patch.truck = truck;
    if (Object.keys(patch).length) updateDriver(d.id, patch);
    setEditId(null);
  };
  const onKey = (e, d) => {
    if (e.key === "Enter") saveEdit(d);
    else if (e.key === "Escape") setEditId(null);
  };

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies
      .filter((c) => boardFilter === "all" || c.board === boardFilter)
      .map((c) => ({
        company: c,
        rows: drivers.filter(
          (d) =>
            d.companyId === c.id &&
            (!q || d.name.toLowerCase().includes(q) || (d.truck ?? "").toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.rows.length > 0);
  }, [companies, drivers, boardFilter, query]);

  const editCls = cx("border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2", t.inputCls);

  return (
    <div className={cx("relative overflow-hidden p-4", t.formCard)}>
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className={cx("font-bold text-sm", t.textPri)}>Drivers — Edit / Remove</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {["all", "A", "B"].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBoardFilter(b)}
                className={cx(
                  "px-2.5 py-1 rounded-lg text-xs font-bold btn-press",
                  boardFilter === b ? t.btnPri : t.btnSec,
                )}
              >
                {b === "all" ? "All" : `Board ${b}`}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search name / truck…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cx("border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 w-44", t.inputCls)}
          />
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className={cx("relative z-10 text-xs italic", t.textMut)}>No drivers match.</p>
      ) : (
        <div className="relative z-10 space-y-4 max-h-[62vh] overflow-y-auto pr-1">
          {grouped.map(({ company, rows }) => (
            <div key={company.id}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cx("text-xs font-bold uppercase tracking-wider", t.textSec)}>{company.name}</span>
                <span className={cx("text-xs", t.textMut)}>Board {company.board} · {rows.length}</span>
              </div>
              <div className="space-y-1">
                {rows.map((d) => (
                  <div
                    key={d.id}
                    className={cx("flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg", t.tblRow)}
                  >
                    {editId === d.id ? (
                      <>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <input
                            autoFocus
                            value={draft.name}
                            onChange={(e) => setDraft((f) => ({ ...f, name: e.target.value }))}
                            onKeyDown={(e) => onKey(e, d)}
                            placeholder="Driver name"
                            className={cx(editCls, "flex-1 min-w-0")}
                          />
                          <input
                            value={draft.truck}
                            onChange={(e) => setDraft((f) => ({ ...f, truck: e.target.value }))}
                            onKeyDown={(e) => onKey(e, d)}
                            placeholder="Truck #"
                            className={cx(editCls, "w-24 font-mono")}
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => saveEdit(d)}
                            title="Save"
                            className="w-7 h-7 flex items-center justify-center rounded-lg btn-press bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 font-bold"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            title="Cancel"
                            className={cx("w-7 h-7 flex items-center justify-center rounded-lg btn-press", t.btnSec)}
                          >
                            ×
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cx("font-semibold text-xs truncate", t.textPri)}>{d.name}</span>
                          <span className={cx("text-xs font-mono", t.textMut)}>{d.truck}</span>
                          <span className="text-xs font-semibold" style={{ color: STATUS_COLOR[d.status] }}>
                            {d.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(d)}
                            title={`Edit ${d.name}`}
                            className={cx("w-7 h-7 flex items-center justify-center rounded-lg btn-press", t.btnSec)}
                          >
                            <PencilIcon size={13} />
                          </button>
                          <button
                            onClick={() => setModal({ type: "deleteDriver", driver: d, companyName: company.name })}
                            title={`Remove ${d.name}`}
                            className={cx("w-7 h-7 flex items-center justify-center rounded-lg btn-press", t.btnDanger)}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Suggestions box — anyone can drop an idea; it's kept on this device and can
// also be sent straight to the maker on Telegram (@trusdedwho).
// ---------------------------------------------------------------------------
const TELEGRAM_HANDLE = "trusdedwho";

function SuggestionsBox({ t }) {
  const { suggestions, addSuggestion, removeSuggestion, currentUpdater } = useApp();
  const [text, setText] = useState("");
  const [flash, setFlash] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addSuggestion(text.trim(), currentUpdater?.nickname);
    setText("");
    setFlash("Saved!");
    setTimeout(() => setFlash(""), 1800);
  };

  const sendTelegram = () => {
    const msg = text.trim()
      ? `Suggestion for the ALGO ELD Update Board:\n\n${text.trim()}`
      : "Hi! I have a suggestion for the ALGO ELD Update Board:";
    window.open(`https://t.me/${TELEGRAM_HANDLE}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <div className={cx("relative overflow-hidden p-4", t.formCard)}>
      <h3 className={cx("relative z-10 font-bold text-sm mb-1", t.textPri)}>Suggestions</h3>
      <p className={cx("relative z-10 text-xs mb-3", t.textMut)}>
        Got an idea to improve the board? Drop it here, or send it to me directly on Telegram.
      </p>

      <form onSubmit={submit} className="relative z-10 space-y-2 mb-3">
        <textarea
          rows={3}
          placeholder="Your suggestion…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={cx("w-full border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 resize-none", t.inputCls)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className={cx("px-3 py-1.5 rounded-lg font-semibold text-sm btn-press", t.btnGreen)}>
            + Add suggestion
          </button>
          <button
            type="button"
            onClick={sendTelegram}
            className={cx("px-3 py-1.5 rounded-lg font-semibold text-sm btn-press inline-flex items-center gap-1.5", t.btnSec)}
            title={`Open Telegram chat with @${TELEGRAM_HANDLE}`}
          >
            ✈ Send on Telegram
          </button>
          <a
            href={`https://t.me/${TELEGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cx("text-xs font-semibold", t.accentText)}
          >
            @{TELEGRAM_HANDLE}
          </a>
          {flash && <span className="text-emerald-500 text-xs font-semibold fade-in">{flash}</span>}
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="relative z-10 space-y-1.5 max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <div key={s.id} className={cx("flex items-start justify-between gap-2 px-2.5 py-1.5 rounded-lg", t.tblRow)}>
              <div className="min-w-0">
                <p className={cx("text-xs whitespace-pre-wrap break-words", t.textPri)}>{s.text}</p>
                <p className={cx("text-[10px] mt-0.5", t.textMut)}>{s.author} · {s.at}</p>
              </div>
              <button
                onClick={() => removeSuggestion(s.id)}
                title="Remove suggestion"
                className="shrink-0 opacity-40 hover:opacity-90 text-base leading-none font-bold btn-press"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full "Mgmt & Logs" tab — split into sections so it's not one long scroll.
// ---------------------------------------------------------------------------
const SECTIONS = [
  { k: "drivers", l: "Drivers" },
  { k: "add", l: "Add Company / Driver" },
  { k: "team", l: "Team & Shifts" },
  { k: "activity", l: "Activity Log" },
  { k: "suggestions", l: "Suggestions" },
];

export function ManagementView({ t }) {
  const { companies, updaters, drivers, activityLog, addCompany, addDriver } = useApp();
  const [section, setSection] = useState("drivers");
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
      <div className={cx("flex flex-wrap gap-1.5 p-1.5", t.formCard)}>
        {SECTIONS.map((s) => (
          <button
            key={s.k}
            type="button"
            onClick={() => setSection(s.k)}
            className={cx(
              "px-3 py-1.5 rounded-lg text-xs font-semibold btn-press whitespace-nowrap",
              section === s.k ? t.tabActive : t.tabInactive,
            )}
          >
            {s.l}
          </button>
        ))}
      </div>

      {section === "drivers" && <DriverManager t={t} />}
      {section === "team" && <ShiftResponsibles t={t} />}
      {section === "suggestions" && <SuggestionsBox t={t} />}

      {section === "add" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <option value="" style={{ color: "#0f172a", background: "#ffffff" }}>— Select —</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} style={{ color: "#0f172a", background: "#ffffff" }}>
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
      )}

      {section === "activity" && (
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
      )}
    </div>
  );
}
