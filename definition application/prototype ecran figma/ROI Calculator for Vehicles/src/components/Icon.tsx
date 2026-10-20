import type { ReactNode } from "react";

export type IconName =
  | "brand"
  | "dashboard"
  | "car"
  | "chart"
  | "database"
  | "plus"
  | "calendar"
  | "fuel"
  | "leaf"
  | "droplet"
  | "clock"
  | "chevron"
  | "arrow"
  | "check"
  | "close"
  | "download"
  | "upload"
  | "help"
  | "warning";

const paths: Record<IconName, ReactNode> = {
  brand: <><path d="M6.8 15.8c-3-3-2.6-7.8-2.6-7.8s4.8-.4 7.8 2.6 2.6 7.8 2.6 7.8-4.8-.4-7.8-2.6Z"/><path d="M9 12.8 15.2 19"/><path d="M14.8 8.5c.8-3.7 4.4-5.7 4.4-5.7s2.4 3.4 1.1 6.7c-1 2.5-3.5 3.6-5.1 4"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  car: <><path d="M5 17h14l-1.2-6.1a2 2 0 0 0-2-1.6H8.2a2 2 0 0 0-2 1.6L5 17Z"/><path d="M3.5 14v5M20.5 14v5M7 17v2M17 17v2M8 13h8"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
  fuel: <><path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h15M8 7h5v5H8z"/><path d="m16 8 3 3v6a2 2 0 0 0 4 0V9l-2-2"/></>,
  leaf: <><path d="M5 19C1.5 10 7.5 4 20 3c0 11-5 16-15 16Z"/><path d="M5 19c3-5 7-8 12-11"/></>,
  droplet: <path d="M12 2S5 9.5 5 15a7 7 0 0 0 14 0c0-5.5-7-13-7-13Z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.1.9-1.1 1.7M12 17h.01"/></>,
  warning: <><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v4M12 17h.01"/></>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
