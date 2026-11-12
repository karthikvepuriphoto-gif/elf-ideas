type IconProps = { size?: number };

function svg(size = 24) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    focusable: false as const,
  };
}

export function HeartIcon({ filled, size = 22 }: { filled?: boolean; size?: number }) {
  return (
    <svg {...svg(size)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
    </svg>
  );
}

export function SearchIcon({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function CloseIcon({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function BackIcon({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <path d="M15 5L8 12l7 7" />
    </svg>
  );
}

export function MenuIcon({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function GridIcon({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function CalendarIcon({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

export function DiceIcon({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

export function GripIcon({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <circle cx="9" cy="7" r="1" fill="currentColor" />
      <circle cx="15" cy="7" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="17" r="1" fill="currentColor" />
      <circle cx="15" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export function ShareIcon({ size = 42 }: IconProps) {
  return (
    <svg {...svg(size)}>
      <path d="M12 16V4" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

export function AddSquareIcon({ size = 42 }: IconProps) {
  return (
    <svg {...svg(size)}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function DotsIcon({ size = 42 }: IconProps) {
  return (
    <svg {...svg(size)}>
      <circle cx="12" cy="6" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function PhonePlusIcon({ size = 42 }: IconProps) {
  return (
    <svg {...svg(size)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
      <path d="M12 8v5M9.5 10.5h5" />
    </svg>
  );
}
