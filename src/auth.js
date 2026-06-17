// ---------------------------------------------------------------------------
// Lightweight front-end login gate.
//
// ⚠️ IMPORTANT: this is a *client-side* gate. Accounts come from .env
// (VITE_AUTH_USERS) or Supabase user_accounts table. Because this is a static
// Vite app the env values are baked into the JS bundle — they are NOT secret.
// The gate keeps casual visitors out; for REAL privacy put the site behind a
// hosting access wall (e.g. Cloudflare Access) — see README.
//
// Configure accounts in .env:  VITE_AUTH_USERS=user1:pass1,user2:pass2
// ---------------------------------------------------------------------------

import { dbEnabled } from "./supabase.js";
import { dbAuthenticateAccount } from "./db.js";

const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Parse "user:pass,user2:pass2" -> [{ username, password, name, role }]
function parseUsers(raw) {
  return (raw || "")
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf(":");
      if (i === -1) return null;
      const username = pair.slice(0, i).trim();
      const password = pair.slice(i + 1);
      return username && password
        ? { username, password, name: titleCase(username), role: "admin" }
        : null;
    })
    .filter(Boolean);
}

const ENV_USERS = parseUsers(import.meta.env.VITE_AUTH_USERS);

// Fall back to built-in defaults if .env is missing/empty.
export const USERS = ENV_USERS.length
  ? ENV_USERS
  : [
      { username: "admin", password: "dispatch2026", name: "Admin", role: "admin" },
      { username: "dispatcher", password: "ag-team", name: "Dispatcher", role: "specialist" },
    ];

const SESSION_KEY = "ag-dispatch-session";

// Synchronous check against hardcoded users only (used as fallback).
export function authenticate(username, password) {
  const u = USERS.find(
    (x) => x.username.toLowerCase() === username.trim().toLowerCase() && x.password === password,
  );
  return u ? { username: u.username, name: u.name, role: u.role ?? "admin" } : null;
}

// Async: tries Supabase user_accounts first (if enabled), then hardcoded fallback.
// This is what Login.jsx should call.
export async function authenticateAsync(username, password) {
  if (dbEnabled) {
    try {
      const account = await dbAuthenticateAccount(username, password);
      if (account) return { username: account.username, name: account.name, role: account.role };
    } catch (e) {
      console.error("Supabase auth failed:", e);
    }
  }
  return authenticate(username, password);
}

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    /* ignore storage errors (private mode etc.) */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
