// ---------------------------------------------------------------------------
// Lightweight front-end login gate.
//
// ⚠️ IMPORTANT: this is a *client-side* gate. Accounts come from .env
// (VITE_AUTH_USERS), but because this is a static Vite app those values are
// baked into the JS bundle at build time — they are NOT secret. The gate keeps
// casual visitors out; for REAL privacy put the site behind a hosting access
// wall (e.g. Cloudflare Access) — see README.
//
// Configure accounts in .env:  VITE_AUTH_USERS=user1:pass1,user2:pass2
// ---------------------------------------------------------------------------

const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Parse "user:pass,user2:pass2" -> [{ username, password, name }]
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
      return username && password ? { username, password, name: titleCase(username) } : null;
    })
    .filter(Boolean);
}

const ENV_USERS = parseUsers(import.meta.env.VITE_AUTH_USERS);

// Fall back to built-in defaults if .env is missing/empty.
export const USERS = ENV_USERS.length
  ? ENV_USERS
  : [
      { username: "admin", password: "dispatch2026", name: "Admin" },
      { username: "dispatcher", password: "ag-team", name: "Dispatcher" },
    ];

const SESSION_KEY = "ag-dispatch-session";

export function authenticate(username, password) {
  const u = USERS.find(
    (x) => x.username.toLowerCase() === username.trim().toLowerCase() && x.password === password,
  );
  return u ? { username: u.username, name: u.name } : null;
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
