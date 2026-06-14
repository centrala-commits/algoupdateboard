# AG Dispatch — Logistics Control

A logistics dispatch board (Board A / Board B + Mgmt & Logs) built with **React 19 + Vite + Tailwind CSS v4**.

This is the **editable source rebuild** of the app. Only a minified production `dist/` bundle existed
before; the source below was reconstructed from it and then extended with the requested fixes.

## Run it

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Project layout

```
index.html
vite.config.js          # Vite + @vitejs/plugin-react + @tailwindcss/vite
public/favicon.svg      # browser tab icon (purple bolt)
src/
  assets/algo-logo.svg  # Algo Service logo (green AG monogram) — background watermark.
                        # Drop the original file in as assets/algo-logo.png to use it instead.
  main.jsx              # React entry
  index.css             # Tailwind import + liquid-glass styles + keyframes
  data.js               # constants, seed data, helpers (cx, nowTime, fakeEldPing)
  theme.js              # light (white glass, default) + dark theme tokens
  auth.js               # front-end login gate (USERS list + session helpers)
  store.jsx             # AppProvider / useApp — all state + handlers
  App.jsx               # login gate + layout shell
  components/
    ui.jsx              # Background orbs, Algo Service logo watermark, ELD dot, WindowDecor, HeaderBubbles
    Login.jsx           # username/password sign-in screen
    Header.jsx          # top bar: tabs, updater picker, theme toggle, assign-all, log out
    board.jsx           # BoardView, CompanyBlock, DriverRow (updater select + delivery)
    DeliveryPicker.jsx  # weekday-only delivery-day calendar (portal popover)
    management.jsx      # Shift Responsibles manager + add forms + activity log
    modals.jsx          # Team Stats, Confirm Assign-All, Add Company, Add Driver
```

## Login

The app opens on a username / password screen. Accounts live in `src/auth.js` (the `USERS` list) —
**change the passwords before deploying**. Seeded logins:

| Username     | Password       |
|--------------|----------------|
| `admin`      | `dispatch2026` |
| `dispatcher` | `ag-team`      |

A session is kept in `localStorage` (stay signed in); the header has a **Log out** button.

> ⚠️ This is a *client-side* gate: on a static site the credentials ship inside the JS bundle, so it
> keeps unintended visitors out but is **not** strong security. For real privacy put the site behind a
> hosting access wall — see **Hosting** below.

## Delivery day

Each driver row has a **Delivery** column (next to ELD / Location). Click it to open a small calendar
that shows **only weekday numbers** (weekends are omitted); pick a day, navigate months with ‹ / ›, or
**Clear**. The chosen date is stored on the driver as `deliveryDate`.

## Hosting — free and private

This is a static site (`npm run build` → `dist/`), so it hosts for free. To keep it **private** with a
real login wall at no cost, the recommended path is **Cloudflare Pages + Cloudflare Access** (Zero Trust):

1. Push this project to a GitHub repo (or use `npx wrangler pages deploy dist`).
2. In the Cloudflare dashboard → **Workers & Pages → Create → Pages** → connect the repo.
   Build command `npm run build`, output directory `dist`. Free, no credit card.
3. Open **Zero Trust → Access → Applications → Add (Self-hosted)**, point it at your `*.pages.dev`
   domain, and add a policy that **allows only your team's emails** (one-time email PIN login).
   Free for up to 50 users. Now the whole site is private — visitors must pass Cloudflare's login first.

Cloudflare Access is the actual security boundary; the in-app login above is just convenience on top.
(Netlify and Vercel also host free, but their built-in password protection is a paid feature, which is
why Cloudflare is the free + private pick.)

## What changed in this rebuild

1. **Liquid glass is white, not dark.** The light theme is the default and every surface now reads as
   white frosted glass. The panel / modal / section title bars that used to be dark navy
   (`bg-slate-800/90 text-white`) now use a frosted-white treatment (`.glass-bar-light`) with dark text.
   Dark mode is still available behind the ☀️/🌙 toggle.

2. **Real, selectable, assignable shift responsibles.** Previously "Shift Responsibles" was a cosmetic
   list, separate from the internal "updaters" list — so anyone you added could never be picked or
   assigned. There is now **one unified, editable `updaters` list**: a person added under
   *Mgmt & Logs → Shift Responsibles* immediately shows up in the header updater picker, the board shift
   pills, Team Stats, the activity log, and — new — the **per-driver "Updater" dropdown**, where you can
   assign any updater to an individual driver. Removing the current updater resets the selection.

3. **Circle design + non-standard animations on the windows.** Modals and cards now carry decorative
   circular accents — blurred corner bubbles, counter-rotating conic-gradient rings, and a breathing
   orbit dot (`WindowDecor`) — plus motion that isn't off-the-shelf: a light **sheen sweep** across title
   bars, **floating bubbles** rising through modal headers, ring spin, and a spring `modal-pop`. All of it
   is `pointer-events: none`, so it never blocks clicks or inputs.

> Note: `npm run build` regenerates `dist/`, so the original minified bundle has been replaced by the
> build of this source.
# algoupdateboard
