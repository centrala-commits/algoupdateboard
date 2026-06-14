import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "../data.js";
import { CalendarIcon } from "./Icons.jsx";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const pad = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`; // m is 0-based
function parseISO(s) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return { y, m: m - 1, d };
}

// Lay a month's WEEKDAY days into rows of 5 columns (Mon..Fri); weekends omitted.
function weekdayRows(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  const rows = [];
  let row = [null, null, null, null, null];
  let used = false;
  for (let day = 1; day <= days; day++) {
    const wd = new Date(year, month, day).getDay(); // 0=Sun..6=Sat
    if (wd === 0 || wd === 6) continue; // skip weekend
    if (wd === 1 && used) {
      rows.push(row);
      row = [null, null, null, null, null];
      used = false;
    }
    row[wd - 1] = day; // Mon=0..Fri=4
    used = true;
  }
  if (used) rows.push(row);
  return rows;
}

export function DeliveryPicker({ value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const sel = useMemo(() => parseISO(value), [value]);
  const today = useMemo(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  }, []);
  const [view, setView] = useState(() => (sel ? { y: sel.y, m: sel.m } : { y: today.y, m: today.m }));

  const btnRef = useRef(null);
  const popRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Re-anchor the popover to the trigger (fixed coords escape table overflow).
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = 230;
    let left = r.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    setPos({ top: r.bottom + 6, left: Math.max(8, left) });
  }, [open]);

  // When opening, jump the view to the selected month (or today).
  useEffect(() => {
    if (open) setView(sel ? { y: sel.y, m: sel.m } : { y: today.y, m: today.m });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dismiss on outside click / escape / scroll / resize.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (popRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onMove = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open]);

  const rows = useMemo(() => weekdayRows(view.y, view.m), [view]);
  const label = sel ? `${MONTHS[sel.m]} ${sel.d}` : "Set day";
  const shiftMonth = (delta) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const pick = (day) => {
    onChange(toISO(view.y, view.m, day));
    setOpen(false);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Delivery day (weekdays only)"
        className={cx(
          "flex items-center gap-1 text-xs font-semibold border rounded px-1.5 py-1 w-full cursor-pointer btn-press focus:outline-none focus:ring-1",
          t.inputCls,
          sel ? "text-emerald-700" : t.textMut,
        )}
      >
        <CalendarIcon size={13} />
        <span className="truncate">{label}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            className={cx("fixed z-[60] rounded-xl shadow-2xl modal-pop overflow-hidden", t.modalCls)}
            style={{ top: pos.top, left: pos.left, width: 230 }}
          >
            <div className={cx("flex items-center justify-between px-3 py-2 overflow-hidden relative", t.blockHd)}>
              <span className={t.sheen} />
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="relative z-10 px-1.5 leading-none text-sm hover:opacity-70 btn-press"
              >
                ‹
              </button>
              <span className="relative z-10 text-xs font-bold">
                {MONTHS[view.m]} {view.y}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="relative z-10 px-1.5 leading-none text-sm hover:opacity-70 btn-press"
              >
                ›
              </button>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-5 gap-1 mb-1">
                {WEEKDAYS.map((w) => (
                  <div key={w} className={cx("text-center text-[10px] font-bold uppercase", t.textMut)}>
                    {w}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {rows.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-5 gap-1">
                    {row.map((day, ci) => {
                      if (!day) return <div key={ci} />;
                      const isSel = sel && sel.y === view.y && sel.m === view.m && sel.d === day;
                      const isToday = today.y === view.y && today.m === view.m && today.d === day;
                      return (
                        <button
                          key={ci}
                          type="button"
                          onClick={() => pick(day)}
                          className={cx(
                            "h-7 rounded-lg text-xs font-semibold btn-press transition-all",
                            isSel
                              ? "bg-emerald-700 text-white shadow-sm shadow-emerald-800/30"
                              : cx(t.tabInactive, isToday && "ring-1 ring-emerald-500/50"),
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className={cx("flex justify-between items-center px-3 py-2 border-t", t.divider)}>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className={cx("text-xs font-semibold btn-press", t.textSec, "hover:opacity-70")}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cx("text-xs font-semibold px-2 py-0.5 rounded-lg btn-press", t.btnSec)}
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
