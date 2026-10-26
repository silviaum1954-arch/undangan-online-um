export type ThemeId = "flora" | "noir" | "soft" | "gold";

export interface Theme {
  id: ThemeId;
  badge: string;
  name: string;
  description: string;
  /** gradient for picker cards, event covers and the invitation hero */
  hero: string;
  /** background of the phone screen in the editor preview */
  screen: string;
  dark?: boolean;
}

export const THEMES: Theme[] = [
  {
    id: "flora",
    badge: "Flora",
    name: "Violet Bloom",
    description: "Lavender & soft pink",
    hero: "from-purple-200 via-pink-100 to-purple-100",
    screen: "bg-[#faf8fc]",
  },
  {
    id: "noir",
    badge: "Noir",
    name: "Midnight",
    description: "Deep navy & champagne",
    hero: "from-slate-900 via-indigo-950 to-slate-800",
    screen: "bg-slate-950",
    dark: true,
  },
  {
    id: "soft",
    badge: "Soft",
    name: "Pastel",
    description: "Indigo, lilac & blush",
    hero: "from-indigo-100 via-purple-50 to-pink-100",
    screen: "bg-[#f7f6fd]",
  },
  {
    id: "gold",
    badge: "Gold",
    name: "Golden",
    description: "Ivory & warm gold",
    hero: "from-amber-200 via-orange-100 to-amber-100",
    screen: "bg-[#fdfaf3]",
  },
];

export const themeById = (id: string): Theme =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];
