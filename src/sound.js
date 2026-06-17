// ---------------------------------------------------------------------------
// Tiny Web Audio "ping" — a short, soft click for tactile confirmation when a
// driver is marked reviewed. No assets to load; synthesised on the fly.
// ---------------------------------------------------------------------------

let ctx = null;

// Lazily create (and resume) a shared AudioContext. Browsers require this to be
// kicked off from a user gesture — marking a driver reviewed counts as one.
function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// Short two-tone "tick" — pleasant, not annoying, ~120ms total.
export function playPing() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  gain.connect(ac.destination);

  const osc = ac.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(880, now);       // A5
  osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // up to ~E6
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.16);
}
