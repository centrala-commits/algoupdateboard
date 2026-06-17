import { useState } from "react";
import { authenticate } from "../auth.js";
import { THEME } from "../theme.js";
import { cx } from "../data.js";
import { WindowDecor, HeaderBubbles } from "./ui.jsx";
import { SunIcon, MoonIcon } from "./Icons.jsx";
import logoSvg from "../assets/algo-logo.svg";

export function Login({ onLogin }) {
  // Login has its own light/dark toggle (it renders before the AppProvider).
  const [isDark, setIsDark] = useState(false);
  const t = THEME[isDark ? "dark" : "light"];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const user = authenticate(username, password);
    if (!user) {
      setError("Wrong username or password.");
      return;
    }
    setError("");
    onLogin(user);
  };

  const inputCls = cx(
    "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2",
    t.inputCls,
  );

  return (
    <div className={cx("min-h-screen relative flex items-center justify-center overflow-hidden", t.appBg)}>
      {/* Dashboard-style giant logo watermark, centred behind everything */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <img
          src={logoSvg}
          alt=""
          draggable={false}
          className={isDark ? "logo-mark-dark" : "logo-mark-light"}
          style={{ width: "clamp(420px, 58vw, 820px)", height: "auto" }}
        />
      </div>

      {/* drifting indigo orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full blur-3xl orb-drift"
          style={{ width: 600, height: 600, top: "-12%", left: "-6%", background: "rgba(99,102,241,0.18)" }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{ width: 480, height: 480, bottom: "-10%", right: "-8%", background: "rgba(129,140,248,0.16)", animation: "orbDrift 24s ease-in-out infinite reverse" }}
        />
      </div>

      {/* Light / dark toggle */}
      <button
        onClick={() => setIsDark((v) => !v)}
        className={cx("fixed top-4 right-4 z-20 w-9 h-9 rounded-lg flex items-center justify-center btn-press", t.glassIcon, t.textPri)}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle colour theme"
      >
        {isDark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
      </button>

      <div className={cx("relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl modal-pop overflow-hidden", t.modalCls)}>
        <WindowDecor accent={t.accent} />

        <div className={cx("relative flex items-center gap-2.5 px-5 py-3.5 overflow-hidden", t.blockHd)}>
          <span className={t.sheen} />
          <HeaderBubbles color={t.accent} />
          <img src={logoSvg} alt="ALGO" draggable={false} className="relative z-10 h-7 w-auto" />
          <span className={cx("relative z-10 text-xs font-semibold", t.textSec)}>Dispatch · Logistics Control</span>
        </div>

        <form onSubmit={submit} className="relative z-10 p-5 space-y-3">
          <div>
            <h1 className={cx("text-base font-bold", t.textPri)}>Sign in</h1>
            <p className={cx("text-xs", t.textSec)}>Private dispatch board — authorized users only.</p>
          </div>

          <div>
            <label className={cx("block text-xs font-semibold mb-1", t.formLabel)}>Username</label>
            <input
              type="text"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className={inputCls}
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className={cx("block text-xs font-semibold mb-1", t.formLabel)}>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className={inputCls}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-500 fade-in bg-rose-500/10 border border-rose-400/30 rounded-lg px-2.5 py-1.5">
              {error}
            </p>
          )}

          <button type="submit" className={cx("w-full py-2 rounded-lg font-bold text-sm btn-press", t.btnPri)}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
