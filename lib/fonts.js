import { Manrope, Space_Grotesk } from "next/font/google";

// Fonte de UI/texto — mapeada em `--font-sans` (usada por Tailwind `font-sans`).
// Design system: Manrope para corpo, labels e rótulos (400/500/800).
export const fontSans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// Fonte de display — nomes, números e títulos (Space Grotesk 700).
// Mapeada em `--font-display` (`font-display`) e reaproveitada em `--font-mono`
// para os pontos numéricos que antes usavam a mono.
export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});
