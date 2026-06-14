import { useApp } from "../store.jsx";
import { cx } from "../data.js";
import logoSvg from "../assets/algo-logo.svg";

// If the original raster logo file is dropped in as src/assets/algo-logo.png
// (or .jpg/.webp), it is preferred automatically over the SVG recreation.
const logoOverride = import.meta.glob("../assets/algo-logo.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});
const logoUrl = Object.values(logoOverride)[0] ?? logoSvg;

// ---------------------------------------------------------------------------
// Animated background orbs (one per app, behind everything).
// ---------------------------------------------------------------------------
export function Background({ isDark }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {isDark ? (
        <>
          <div className="absolute rounded-full orb-drift"
            style={{ width: 800, height: 800, top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(52,211,153,0.13) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute rounded-full"
            style={{ width: 600, height: 600, top: "15%", right: "-15%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", filter: "blur(40px)", animation: "orbDrift 24s ease-in-out infinite reverse" }} />
          <div className="absolute rounded-full"
            style={{ width: 500, height: 500, bottom: "-10%", left: "25%", background: "radial-gradient(circle, rgba(56,189,248,0.09) 0%, transparent 70%)", filter: "blur(40px)", animation: "orbDrift 28s ease-in-out infinite 4s" }} />
        </>
      ) : (
        <>
          <div className="absolute rounded-full orb-drift"
            style={{ width: 900, height: 900, top: "-22%", left: "-12%", background: "radial-gradient(circle, rgba(52,211,153,0.45) 0%, rgba(16,185,129,0.20) 40%, transparent 70%)", filter: "blur(48px)" }} />
          <div className="absolute rounded-full"
            style={{ width: 700, height: 700, top: "10%", right: "-15%", background: "radial-gradient(circle, rgba(167,139,250,0.40) 0%, rgba(139,92,246,0.18) 40%, transparent 70%)", filter: "blur(48px)", animation: "orbDrift 24s ease-in-out infinite reverse" }} />
          <div className="absolute rounded-full"
            style={{ width: 600, height: 600, bottom: "-12%", left: "20%", background: "radial-gradient(circle, rgba(56,189,248,0.38) 0%, rgba(14,165,233,0.16) 40%, transparent 70%)", filter: "blur(48px)", animation: "orbDrift 30s ease-in-out infinite 6s" }} />
          <div className="absolute rounded-full"
            style={{ width: 400, height: 400, top: "55%", left: "-5%", background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)", filter: "blur(40px)", animation: "orbDrift 22s ease-in-out infinite 2s reverse" }} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Giant Algo Service logo (green AG monogram) watermark centred behind the
// content. Upscaled only; dark mode applies a CSS filter, light mode shows
// the artwork untouched.
// ---------------------------------------------------------------------------
export function AGWatermark() {
  const { isDark } = useApp();
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <img
        src={logoUrl}
        alt=""
        draggable={false}
        className={isDark ? "logo-mark-dark" : "logo-mark-light"}
        style={{ width: "clamp(280px, 38vw, 640px)", height: "auto" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ELD status LED.
// ---------------------------------------------------------------------------
export function EldDot() {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-rose-500 led-red"
      title="ELD Offline"
    />
  );
}

// ---------------------------------------------------------------------------
// Decorative circles for the "windows" (modals + cards):
//   - blurred accent bubbles drifting in the corners
//   - thin conic-gradient rings rotating in opposite directions
//   - a breathing orbit dot
// All non-interactive and clipped to the parent's rounded corners.
// ---------------------------------------------------------------------------
export function WindowDecor({ accent = "#2563eb", className }) {
  return (
    <div
      className={cx("absolute inset-0 overflow-hidden pointer-events-none", className)}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <div
        className="deco-bubble"
        style={{ width: 150, height: 150, top: -50, right: -36, background: accent, opacity: 0.16 }}
      />
      <div
        className="deco-bubble"
        style={{ width: 190, height: 190, bottom: -70, left: -54, background: "#a855f7", opacity: 0.12 }}
      />
      <div
        className="deco-ring"
        style={{ width: 120, height: 120, top: -34, right: -28, color: accent }}
      />
      <div
        className="deco-ring rev"
        style={{ width: 90, height: 90, bottom: -22, left: 22, color: "#a855f7", opacity: 0.4 }}
      />
      <div
        className="deco-orbit"
        style={{ width: 10, height: 10, top: 18, left: 26, background: accent, opacity: 0.5 }}
      />
    </div>
  );
}

// Floating bubbles emitted from a header strip — purely decorative motion.
export function HeaderBubbles({ color = "#ffffff" }) {
  const seeds = [
    { left: "12%", size: 6, delay: "0s", dur: "5s" },
    { left: "34%", size: 4, delay: "1.4s", dur: "6.2s" },
    { left: "58%", size: 7, delay: "2.6s", dur: "4.6s" },
    { left: "78%", size: 5, delay: "0.8s", dur: "5.8s" },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {seeds.map((b, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: b.left,
            bottom: 0,
            width: b.size,
            height: b.size,
            background: color,
            opacity: 0.35,
            animation: `bubbleFloat ${b.dur} ease-in ${b.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
