// Helpers de formatação (datas/horas em pt-BR, sem depender de timezone do runtime).

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// "2026-02-18" -> { y, m, d } sem conversão de fuso.
function parseISODate(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return { y, m, d };
}

// "2026-02-18" -> "18/02"
export function formatDayMonth(dateStr) {
  if (!dateStr) return "";
  const { m, d } = parseISODate(dateStr);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

// "19:30:00" | "19:30" -> "19:30"
export function formatTime(timeStr) {
  if (!timeStr) return "";
  return String(timeStr).slice(0, 5);
}

// "2026-07-18" -> "2026-07" (chave estável para agrupar por mês)
export function monthKey(dateStr) {
  const { y, m } = parseISODate(dateStr);
  return `${y}-${String(m).padStart(2, "0")}`;
}

// "2026-07-18" -> "Julho" (ou "Julho 2026" se não for o ano corrente)
export function monthLabel(dateStr) {
  const { y, m } = parseISODate(dateStr);
  const name = MONTHS[m - 1] || "";
  return y === new Date().getFullYear() ? name : `${name} ${y}`;
}

// Data de hoje em ISO (YYYY-MM-DD), no fuso local.
export function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Percentual de mesas ocupadas (0–100). "Ocupada" ≈ mesa com reserva vinculada ao
// evento (aproximado por `reservations`); total de mesas = ocupadas + `empty_tables`.
export function tableOccupancyPercent(ocupation) {
  if (!ocupation) return 0;
  const total = ocupation.reservations + ocupation.empty_tables;
  if (!total) return 0;
  const pct = (ocupation.reservations / total) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function toISO(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Range da semana corrente (segunda a domingo) contendo `dateISO`.
export function weekRangeISO(dateISO) {
  const { y, m, d } = parseISODate(dateISO);
  const date = new Date(y, m - 1, d);
  const mondayOffset = (date.getDay() + 6) % 7; // dias desde a segunda-feira
  const monday = new Date(y, m - 1, d - mondayOffset);
  const sunday = new Date(y, m - 1, d - mondayOffset + 6);
  return {
    from: toISO(monday.getFullYear(), monday.getMonth() + 1, monday.getDate()),
    to: toISO(sunday.getFullYear(), sunday.getMonth() + 1, sunday.getDate()),
  };
}

// Range do mês corrente (1º ao último dia) contendo `dateISO`.
export function monthRangeISO(dateISO) {
  const { y, m } = parseISODate(dateISO);
  const lastDay = new Date(y, m, 0).getDate();
  return { from: toISO(y, m, 1), to: toISO(y, m, lastDay) };
}

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

// "2026-07-26" -> "Sábado"
export function weekdayLabel(dateISO) {
  const { y, m, d } = parseISODate(dateISO);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

// "neptunia-mario-quintana" -> "Neptunia Mario Quintana"
export function titleFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Resolve um filtro de período em { from, to, label } (pt-BR) para as reservas.
export function resolveDateFilter(mode, customDate) {
  const today = todayISO();

  if (mode === "week") {
    return { ...weekRangeISO(today), label: "Esta semana" };
  }
  if (mode === "month") {
    return { ...monthRangeISO(today), label: "Este mês" };
  }
  if (mode === "custom" && customDate) {
    return {
      from: customDate,
      to: customDate,
      label: formatDayMonth(customDate),
    };
  }
  return { from: today, to: today, label: "Hoje" };
}
