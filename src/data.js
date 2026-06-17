// ---------------------------------------------------------------------------
// ALGO ELD Update Board System — static config + seed data
// ---------------------------------------------------------------------------

export const SHIFTS = ["Day", "Main", "Night"];

export const SHIFT_EMOJI = { Day: "☀️", Main: "🌤", Night: "🌙" };

// Per-shift colour tokens (pill / dot / focus ring).
export const SHIFT_STYLE = {
  Day: { pill: "bg-amber-500/15 text-amber-700", dot: "bg-amber-500", ring: "ring-amber-500/40" },
  Main: { pill: "bg-sky-500/15 text-sky-700", dot: "bg-sky-500", ring: "ring-sky-500/40" },
  Night: { pill: "bg-indigo-500/15 text-indigo-700", dot: "bg-indigo-500", ring: "ring-indigo-500/40" },
};

// ---------------------------------------------------------------------------
// Status colour system — SINGLE SOURCE OF TRUTH. Colour encodes meaning.
// Red is reserved for genuine emergencies only — never routine/pending states.
// ---------------------------------------------------------------------------
export const STATUS = {
  ok:        { text: "#0F766E", tint: "#F0FDFA", dot: "#0F766E" },
  pending:   { text: "#B45309", tint: "#FFFBEB", dot: "#F59E0B" }, // e.g. "API needed"
  attention: { text: "#C2410C", tint: "#FFF7ED", dot: "#EA580C" },
  emergency: { text: "#B91C1C", tint: "#FEF2F2", dot: "#DC2626" },
  // Neutral states (not ok/pending/attention/emergency) — kept calm, never red.
  offline:   { text: "#64748B", tint: "#F8FAFC", dot: "#94A3B8" },
  cycle:     { text: "#7C3AED", tint: "#F5F3FF", dot: "#8B5CF6" },
};

export const STATUSES = ["All good", "Need to check", "Offline", "Cycle", "Check PF"];

// Each board status maps to exactly one semantic token above.
export const STATUS_TOKEN = {
  "All good":      STATUS.ok,
  "Need to check": STATUS.attention,
  "Offline":       STATUS.offline,
  "Cycle":         STATUS.cycle,
  "Check PF":      STATUS.emergency,
};

// Back-compat flat map (status string -> text colour) consumed by the cells.
export const STATUS_COLOR = Object.fromEntries(
  STATUSES.map((s) => [s, (STATUS_TOKEN[s] ?? STATUS.ok).text]),
);

// ---------------------------------------------------------------------------
// Updaters  (a.k.a. "shift responsibles")
//
// IMPORTANT: this used to be TWO disconnected lists — a fixed "updaters" list
// that fed the picker, and a cosmetic "responsibles" list you could add to but
// never actually select or assign.  They are now ONE editable list, so anyone
// you add becomes a real, selectable, assignable shift responsible.
// ---------------------------------------------------------------------------
export const SEED_UPDATERS = [
  { id: 1, nickname: "Alex", shift: "Day" },
  { id: 2, nickname: "Jordan", shift: "Day" },
  { id: 3, nickname: "Taylor", shift: "Day" },
  { id: 4, nickname: "Mike O.", shift: "Day" },
  { id: 5, nickname: "Sara K.", shift: "Day" },
  { id: 6, nickname: "Sam", shift: "Main" },
  { id: 7, nickname: "Casey", shift: "Main" },
  { id: 8, nickname: "Quinn", shift: "Main" },
  { id: 9, nickname: "Chris B.", shift: "Main" },
  { id: 10, nickname: "Riley", shift: "Night" },
  { id: 11, nickname: "Morgan", shift: "Night" },
  { id: 12, nickname: "Drew", shift: "Night" },
  { id: 13, nickname: "Dana W.", shift: "Night" },
];

export const SEED_COMPANIES = [
  { id: 1, name: "FastRoute Logistics", board: "A" },
  { id: 2, name: "Eagle Transport", board: "A" },
  { id: 3, name: "Horizon Freight", board: "A" },
  { id: 4, name: "Atlas Shipping", board: "A" },
  { id: 5, name: "Summit Carriers", board: "B" },
  { id: 6, name: "Pacific Movers", board: "B" },
  { id: 7, name: "Midwest Express", board: "B" },
];

const driver = (id, companyId, name, truck, eldId, status, eldActive, location) => ({
  id,
  companyId,
  name,
  truck,
  eldId,
  status,
  eldActive,
  location,
  deliveryDate: null, // "YYYY-MM-DD" weekday, or null
  isReviewed: false,
  updatedBy: null,
  updatedAt: null,
});

export const SEED_DRIVERS = [
  driver(1, 1, "Mike Johnson", "TRK-001", "ELD-001", "All good", true, "Chicago, IL"),
  driver(2, 1, "Sarah Williams", "TRK-002", "ELD-002", "Need to check", false, "Detroit, MI"),
  driver(3, 1, "Robert Davis", "TRK-003", "ELD-003", "All good", true, "Indianapolis, IN"),
  driver(4, 2, "James Wilson", "TRK-010", "ELD-010", "All good", true, "Columbus, OH"),
  driver(5, 2, "Linda Martinez", "TRK-011", "ELD-011", "Offline", false, "Pittsburgh, PA"),
  driver(6, 2, "Tom Anderson", "TRK-012", "ELD-012", "All good", true, "Cleveland, OH"),
  driver(7, 3, "Chris Thompson", "TRK-020", "ELD-020", "Need to check", true, "St. Louis, MO"),
  driver(8, 3, "Patricia Harris", "TRK-021", "ELD-021", "All good", true, "Kansas City, MO"),
  driver(9, 4, "David Clark", "TRK-030", "ELD-030", "All good", true, "Nashville, TN"),
  driver(10, 4, "Jennifer Lewis", "TRK-031", "ELD-031", "Offline", false, "Memphis, TN"),
  driver(11, 4, "Matthew Scott", "TRK-032", "ELD-032", "All good", true, "Atlanta, GA"),
  driver(12, 5, "Kevin Hall", "TRK-040", "ELD-040", "All good", true, "Denver, CO"),
  driver(13, 5, "Amanda Young", "TRK-041", "ELD-041", "Need to check", true, "Salt Lake City, UT"),
  driver(14, 5, "Brian White", "TRK-042", "ELD-042", "All good", false, "Phoenix, AZ"),
  driver(15, 6, "Michelle Lee", "TRK-050", "ELD-050", "All good", true, "Los Angeles, CA"),
  driver(16, 6, "Steven Garcia", "TRK-051", "ELD-051", "All good", true, "San Francisco, CA"),
  driver(17, 6, "Lisa Rodriguez", "TRK-052", "ELD-052", "Need to check", false, "Las Vegas, NV"),
  driver(18, 6, "Daniel Kim", "TRK-053", "ELD-053", "All good", true, "Seattle, WA"),
  driver(19, 7, "Mark Jackson", "TRK-060", "ELD-060", "All good", true, "Minneapolis, MN"),
  driver(20, 7, "Karen Martin", "TRK-061", "ELD-061", "Offline", false, "Milwaukee, WI"),
  driver(21, 7, "Paul Thompson", "TRK-062", "ELD-062", "All good", true, "Madison, WI"),
  driver(22, 7, "Nancy Wilson", "TRK-063", "ELD-063", "Need to check", true, "Des Moines, IA"),
];

const LOCATIONS = [
  "Chicago, IL", "Denver, CO", "Dallas, TX", "Miami, FL", "Houston, TX",
  "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "Nashville, TN", "Boston, MA",
  "Seattle, WA", "Charlotte, NC", "Portland, OR", "Las Vegas, NV", "Baltimore, MD",
  "Louisville, KY", "Memphis, TN",
];

// Fake "ELD ping" — simulates polling a telematics provider.
export async function fakeEldPing() {
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 200));
  return {
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    eldActive: Math.random() > 0.22,
  };
}

// Current wall-clock as HH:MM:SS (24h).
export const nowTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

// Join truthy class names.
export const cx = (...parts) => parts.filter(Boolean).join(" ");

// ---------------------------------------------------------------------------
// Per-driver metadata envelope, stored as JSON in the existing `notes` text
// column (so no DB migration is needed). Holds:
//   eld — ELD link (URL)
//   res — resources ok? omitted when true (the default "All provided")
//   tg  — Telegram / contact info
// Legacy rows that stored a raw ELD-link string are read as { eld: <string> }.
// ---------------------------------------------------------------------------
export function parseMeta(notes) {
  if (!notes || typeof notes !== "string") return {};
  const s = notes.trim();
  if (s.startsWith("{")) {
    try { return JSON.parse(s); } catch { return {}; }
  }
  return s ? { eld: s } : {};
}

export function serializeMeta(meta) {
  const out = {};
  if (meta.eld) out.eld = meta.eld;
  if (meta.res === false) out.res = false; // only persist the non-default state
  if (meta.tg) out.tg = meta.tg;
  return Object.keys(out).length ? JSON.stringify(out) : "";
}

// ---------------------------------------------------------------------------
// Contact-info envelope stored as a JSON string inside meta.tg.
// Fields: handle (Telegram @username / tg-phone), phone (regular), note (text).
// Legacy rows that stored a plain string are treated as { handle: <string> }.
// ---------------------------------------------------------------------------
export function parseTgInfo(tg) {
  if (!tg) return { handle: "", phone: "", note: "" };
  const s = String(tg).trim();
  if (s.startsWith("{")) {
    try {
      const p = JSON.parse(s);
      return { handle: p.handle || "", phone: p.phone || "", note: p.note || "" };
    } catch {}
  }
  return { handle: s, phone: "", note: "" };
}

export function serializeTgInfo({ handle = "", phone = "", note = "" }) {
  const h = handle.trim();
  const p = phone.trim();
  const n = note.trim();
  if (!h && !p && !n) return "";
  const obj = {};
  if (h) obj.handle = h.startsWith("@") ? h : `@${h}`;
  if (p) obj.phone = p;
  if (n) obj.note = n;
  return JSON.stringify(obj);
}
