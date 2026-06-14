import { useState } from "react";
import { authenticate } from "../auth.js";
import { THEME } from "../theme.js";
import { cx } from "../data.js";
import { WindowDecor, HeaderBubbles } from "./ui.jsx";

const t = THEME.light;

export function Login({ onLogin }) {
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
      {/* drifting orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute rounded-full blur-3xl bg-emerald-400/18 orb-drift" style={{ width: 600, height: 600, top: "-12%", left: "-6%" }} />
        <div
          className="absolute rounded-full blur-3xl bg-violet-400/16"
          style={{ width: 480, height: 480, bottom: "-10%", right: "-8%", animation: "orbDrift 24s ease-in-out infinite reverse" }}
        />
      </div>

      <div className={cx("relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl modal-pop overflow-hidden", t.modalCls)}>
        <WindowDecor accent={t.accent} />

        <div className={cx("relative flex items-center gap-2 px-5 py-3 overflow-hidden", t.blockHd)}>
          <span className={t.sheen} />
          <HeaderBubbles color={t.accent} />
          <span className="relative z-10 font-black text-base tracking-tighter text-slate-900">AG</span>
          <span className="relative z-10 text-xs font-semibold text-slate-500">Dispatch · Logistics Control</span>
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
