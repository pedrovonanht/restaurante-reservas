import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";

// Fonte de UI/texto — mapeada em `--font-sans` (usada por Tailwind `font-sans`).
export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// Fonte de dados (datas, horas, razões, slugs) — mapeada em `--font-mono` (`font-mono`).
export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
