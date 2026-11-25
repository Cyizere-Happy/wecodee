/** A small line-icon set drawn on a 20px grid, matching the auth screens' weight. */
const paths = {
  home: "M3.5 9 10 3.5 16.5 9v7a1 1 0 0 1-1 1h-3.5v-5h-4v5H4.5a1 1 0 0 1-1-1z",
  bell: "M5 13.5V9a5 5 0 0 1 10 0v4.5l1.5 2h-13zM8 17.5a2 2 0 0 0 4 0",
  play: "M3 4.5h14v11H3zM8.5 7.5v5l4-2.5z",
  book: "M4 3.5h8.5L16 7v9.5H4zM12.5 3.5V7H16M7 10h6M7 13h4",
  calendar: "M3.5 5h13v11.5h-13zM3.5 8.5h13M7 3v3.5M13 3v3.5",
  quiz: "M4 3.5h12v13H4zM7 8l1.5 1.5L11 7M7 13h6",
  users: "M7.5 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 16.5c.4-2.8 2.4-4.5 5-4.5s4.6 1.7 5 4.5M13 3.7a3 3 0 0 1 0 5.6M15 12.3c1.4.6 2.3 2 2.5 4.2",
  clipboard: "M6.5 4.5H5v12h10v-12h-1.5M7.5 3h5v3h-5zM7.5 10h5M7.5 13h3",
  flag: "M4.5 17.5V3M4.5 3.5h10l-2 3.5 2 3.5h-10",
  user: "M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3.5 17c.6-3.3 3.1-5 6.5-5s5.9 1.7 6.5 5",
  award: "M10 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM7 11.2 6 17.5l4-2 4 2-1-6.3",
  inbox: "M3 11h4l1 2h4l1-2h4M3 11l2-7h10l2 7v5.5H3z",
  chart: "M3.5 16.5h13M5.5 13.5v-4M9 13.5V6M12.5 13.5V9M16 13.5V4.5",
  sliders: "M4 6h7M15 6h1M4 14h1M9 14h7M11 4v4M7 12v4",
  history: "M3.5 10a6.5 6.5 0 1 0 2-4.7M3.5 3.5v3h3M10 6.5V10l2.5 1.5",
  settings: "M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM16.2 11.8l-1.3-.8a5 5 0 0 0 0-2l1.3-.8-1.5-2.6-1.4.7a5 5 0 0 0-1.7-1V3.8h-3v1.5a5 5 0 0 0-1.7 1l-1.4-.7-1.5 2.6 1.3.8a5 5 0 0 0 0 2l-1.3.8 1.5 2.6 1.4-.7a5 5 0 0 0 1.7 1v1.5h3v-1.5a5 5 0 0 0 1.7-1l1.4.7z",
  search: "M9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM13.5 13.5 17 17",
  chevronRight: "M8 5l5 5-5 5",
  chevronDown: "M5 8l5 5 5-5",
  chevronUpDown: "M7 8l3-3 3 3M7 12l3 3 3-3",
  panel: "M3.5 4h13v12h-13zM8 4v12",
  menu: "M3.5 6h13M3.5 10h13M3.5 14h13",
  plus: "M10 4v12M4 10h12",
  x: "M5 5l10 10M15 5 5 15",
  check: "M4.5 10.5 8 14l7.5-8",
  copy: "M7 7h9.5v9.5H7zM13 7V3.5H3.5V13H7",
  external: "M11 3.5h5.5V9M16.5 3.5 9 11M14 12v4.5H3.5V6H8",
  download: "M10 3.5v9M6 9l4 4 4-4M3.5 16.5h13",
  logout: "M8 3.5H4v13h4M13 6.5l3.5 3.5-3.5 3.5M16.5 10H8",
  help: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8 8a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2v.5M10 14h.01",
  alert: "M10 3 2.5 16.5h15zM10 8v4M10 14.5h.01",
  clock: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM10 6v4l2.5 2",
  lock: "M5 9h10v8H5zM7 9V6.5a3 3 0 0 1 6 0V9",
  link: "M8.5 11.5a3 3 0 0 0 4.2 0l2.5-2.5a3 3 0 0 0-4.2-4.2l-1 1M11.5 8.5a3 3 0 0 0-4.2 0L4.8 11a3 3 0 0 0 4.2 4.2l1-1",
  trash: "M4 5.5h12M8 5.5V3.5h4v2M5.5 5.5l.7 11h7.6l.7-11",
  edit: "M12.5 4.5l3 3L7 16H4v-3zM11 6l3 3",
  file: "M5 3h7l3 3v11H5zM12 3v3h3",
  wifiOff: "M3 3l14 14M8.5 14.5a2 2 0 0 1 3 0M5.5 11.5a6 6 0 0 1 4-1.7M3 8.5a10 10 0 0 1 3.3-2M10 6a10 10 0 0 1 7 2.5M14.5 11.5a6 6 0 0 0-1.5-1",
  sparkle: "M10 3v3M10 14v3M3 10h3M14 10h3M5 5l2 2M13 13l2 2M5 15l2-2M13 7l2-2",
  arrowRight: "M4 10h12M11 5l5 5-5 5",
  whatsapp: "M4 16.5l1-3.2A6.5 6.5 0 1 1 7.3 15.6zM8 7.5c0 2.5 2 4.5 4.5 4.5l.8-1-1.5-.8-.6.6a3 3 0 0 1-1.8-1.8l.6-.6L9.2 7z",
  eye: "M2.5 10S5 4.5 10 4.5 17.5 10 17.5 10 15 15.5 10 15.5 2.5 10 2.5 10zM10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  filter: "M3.5 4.5h13l-5 6v5l-3 1.5v-6.5z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 14.5, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
