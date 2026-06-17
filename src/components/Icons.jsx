// Serious monochrome line icons (inherit currentColor — "non color").
// Replaces the emoji stickers used across the app.

function Svg({ size = 16, stroke = 1.8, children, className, fill = "none" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const SunIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export const CloudIcon = (p) => (
  <Svg {...p}>
    <path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 0 8.5H7z" />
  </Svg>
);

export const MoonIcon = (p) => (
  <Svg {...p}>
    <path d="M21 12.8A8 8 0 1 1 11.2 3a6.2 6.2 0 0 0 9.8 9.8z" />
  </Svg>
);

export const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Svg>
);

export const UsersIcon = (p) => (
  <Svg {...p}>
    <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
    <circle cx="9.5" cy="7" r="3.2" />
    <path d="M21 19v-1a4 4 0 0 0-3-3.87M16.5 4.13a3.2 3.2 0 0 1 0 5.74" />
  </Svg>
);

export const BoltIcon = (p) => (
  <Svg {...p}>
    <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const TruckIcon = (p) => (
  <Svg {...p}>
    <path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17.5" cy="17.5" r="1.8" />
  </Svg>
);

export const SoundOnIcon = (p) => (
  <Svg {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M16.5 8.5a4 4 0 0 1 0 7M19 6a7 7 0 0 1 0 12" />
  </Svg>
);

export const SoundOffIcon = (p) => (
  <Svg {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M22 9l-5 6M17 9l5 6" />
  </Svg>
);

// Chain-link icon — used on the ELD-link button (it opens a URL).
export const LinkIcon = (p) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
);

// Live-signal icon — broadcast waves radiating from a center dot. Used on the
// ELD-link button to evoke a live telematics feed.
export const SignalIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
    <path d="M8.8 8.8a4.5 4.5 0 0 0 0 6.4" />
    <path d="M15.2 8.8a4.5 4.5 0 0 1 0 6.4" />
    <path d="M6.3 6.3a8 8 0 0 0 0 11.4" />
    <path d="M17.7 6.3a8 8 0 0 1 0 11.4" />
  </Svg>
);

const SHIFT_ICONS = { Day: SunIcon, Main: CloudIcon, Night: MoonIcon };

export function ShiftIcon({ shift, ...rest }) {
  const Comp = SHIFT_ICONS[shift] ?? SunIcon;
  return <Comp {...rest} />;
}
