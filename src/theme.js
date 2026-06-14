// ---------------------------------------------------------------------------
// Theme tokens.  `light` is the default white "liquid glass" skin; `dark` is
// the optional zinc skin behind the ☀️/🌙 toggle.
//
// FIX (white, not dark): the light theme's panel / modal title bars used to be
// `bg-slate-800/90 text-white` — dark navy bars on a white app.  They now use
// the frosted-white `glass-bar-light` treatment with dark text, so every light
// surface actually reads as white glass.
// ---------------------------------------------------------------------------

export const THEME = {
  // Serious, brand-aligned palette: deep Algo green as the single accent on a
  // neutral slate ground (no candy blue). Status hues stay semantic.
  light: {
    accent: "#15784d",
    appBg: "bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200",
    headerCls: "glass-header-light",
    blockCls: "glass-light",
    blockHd: "glass-bar-light text-slate-800",
    blockBtn: "bg-slate-900/5 hover:bg-slate-900/10 text-slate-700 border border-slate-900/10",
    tblHead: "bg-white/50 text-slate-500 border-b border-slate-200/60",
    tblRow: "bg-white/55 border-b border-slate-100/80",
    tblHover: "hover:bg-white/85",
    formCard: "glass-light rounded-xl",
    formLabel: "text-slate-700",
    inputCls: "bg-white/80 border-slate-300 text-slate-800 focus:ring-emerald-600",
    modalCls: "glass-modal-light",
    overlay: "bg-slate-900/30 backdrop-blur-sm",
    textPri: "text-slate-900",
    textSec: "text-slate-500",
    textMut: "text-slate-400",
    accentText: "text-emerald-700",
    btnPri: "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-800/30",
    btnSec: "bg-white/70 hover:bg-white/90 text-slate-700 border border-slate-200/80",
    btnGreen: "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-800/30",
    btnDanger: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 border border-rose-400/30",
    tabActive: "bg-emerald-700 text-white shadow-sm shadow-emerald-800/40",
    tabInactive: "text-slate-600 hover:text-slate-900 hover:bg-white/60",
    divider: "border-slate-200/60",
    sheen: "sheen",
    glassIcon: "glass-icon",
  },
  dark: {
    accent: "#34d399",
    appBg: "bg-zinc-950",
    headerCls: "glass-header-dark",
    blockCls: "glass-dark",
    blockHd: "bg-zinc-800/80 text-zinc-100",
    blockBtn: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    tblHead: "bg-zinc-800/50 text-zinc-400 border-b border-zinc-700/60",
    tblRow: "bg-zinc-900/50 border-b border-zinc-800/50",
    tblHover: "hover:bg-zinc-800/60",
    formCard: "glass-dark rounded-xl",
    formLabel: "text-zinc-300",
    inputCls: "bg-zinc-800/70 border-zinc-700 text-zinc-100 focus:ring-emerald-500",
    modalCls: "glass-modal-dark",
    overlay: "bg-black/60 backdrop-blur-sm",
    textPri: "text-zinc-100",
    textSec: "text-zinc-400",
    textMut: "text-zinc-600",
    accentText: "text-emerald-400",
    btnPri: "bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-800/20",
    btnSec: "bg-zinc-700/80 hover:bg-zinc-600/80 text-zinc-100 border border-zinc-600/50",
    btnGreen: "bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-800/20",
    btnDanger: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30",
    tabActive: "bg-emerald-700 text-white shadow-sm shadow-emerald-800/30",
    tabInactive: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
    divider: "border-zinc-700/50",
    sheen: "sheen dark",
    glassIcon: "glass-icon-dark",
  },
};
