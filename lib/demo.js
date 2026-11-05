// Simulação 100% client-side usada pela página /demo. Não toca na API nem no
// banco: o estado vive em memória e some ao recarregar a página.

import { addDaysISO, todayISO } from "lib/format";
import { normalizePhone } from "lib/whatsapp";

export const DEMO_RESTAURANT = "Bistrô Aurora";

// Ordem do array = ordem de criação (critério de desempate da alocação).
const TABLES = [
  { id: "t1", name: "Mesa 1", min_capacity: 1, max_capacity: 2 },
  { id: "t2", name: "Mesa 2", min_capacity: 1, max_capacity: 2 },
  { id: "t3", name: "Mesa 3", min_capacity: 2, max_capacity: 4 },
  { id: "t4", name: "Mesa 4", min_capacity: 2, max_capacity: 4 },
  { id: "t5", name: "Mesa 5", min_capacity: 3, max_capacity: 4 },
  { id: "t6", name: "Mesa 6", min_capacity: 4, max_capacity: 6 },
  { id: "t7", name: "Mesa 7", min_capacity: 4, max_capacity: 6 },
  { id: "t8", name: "Varanda 1", min_capacity: 6, max_capacity: 8 },
  { id: "t9", name: "Varanda 2", min_capacity: 6, max_capacity: 10 },
  { id: "t10", name: "Salão VIP", min_capacity: 8, max_capacity: 12 },
];

const SEED_GUESTS = [
  { guest_name: "Ana Souza", party_size: 2, reservation_time: "19:00" },
  { guest_name: "Bruno Lima", party_size: 4, reservation_time: "19:00" },
  { guest_name: "Carla Mendes", party_size: 6, reservation_time: "20:30" },
  { guest_name: "Diego Ramos", party_size: 2, reservation_time: "20:30" },
  { guest_name: "Elisa Prado", party_size: 8, reservation_time: "22:00" },
];

export class DemoError extends Error {
  constructor(message, action, kind) {
    super(message);
    this.action = action;
    this.kind = kind;
  }
}

// Próxima sexta-feira (nunca hoje), para a data do evento sempre estar no futuro.
export function nextFridayISO(from = todayISO()) {
  const [y, m, d] = from.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  const diff = (5 - weekday + 7) % 7 || 7;
  return addDaysISO(from, diff);
}

function randomCode(length) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// Mesmo critério de `models/table.js#findAvailableForEvent`:
// mesas ativas, livres no evento e que comportam o grupo, ordenadas por
// max_capacity ASC, min_capacity DESC e ordem de criação.
export function findAvailableTable(tables, reservations, partySize) {
  const taken = new Set(reservations.map((r) => r.table_id));
  const candidates = tables
    .filter(
      (t) =>
        t.active &&
        !taken.has(t.id) &&
        partySize >= t.min_capacity &&
        partySize <= t.max_capacity,
    )
    .sort(
      (a, b) =>
        a.max_capacity - b.max_capacity || b.min_capacity - a.min_capacity,
    );
  return { table: candidates[0] || null, candidates };
}

export function createReservation(state, input) {
  const partySize = Number(input.party_size);
  const phone = normalizePhone(input.guest_phone);

  if (state.reservations.some((r) => normalizePhone(r.guest_phone) === phone)) {
    throw new DemoError(
      "Já existe uma reserva com esse número de telefone para essa data.",
      "Use outro número para testar de novo.",
      "duplicate",
    );
  }

  const { table, candidates } = findAvailableTable(
    state.tables,
    state.reservations,
    partySize,
  );

  if (!table) {
    throw new DemoError(
      `Não há mesa disponível para ${partySize} pessoas.`,
      "Tente outra data disponível.",
      "no-table",
    );
  }

  const reservation = {
    id: `r-${randomCode(8)}`,
    guest_name: input.guest_name.trim(),
    guest_phone: input.guest_phone,
    party_size: partySize,
    reservation_time: input.reservation_time,
    table_id: table.id,
    table_name: table.name,
    created_at: Date.now(),
    public_token: `TBF-${randomCode(4)}`,
  };

  return { reservation, allocation: { partySize, table, candidates } };
}

export function createDemoState() {
  const event = {
    name: "Jantar de Sexta",
    event_date: nextFridayISO(),
    event_times: ["19:00", "20:30", "22:00"],
  };
  let state = {
    event,
    tables: TABLES.map((t) => ({ ...t, active: true })),
    reservations: [],
  };

  const now = Date.now();
  SEED_GUESTS.forEach((guest, i) => {
    const { reservation } = createReservation(state, {
      ...guest,
      guest_phone: `5190000000${i}`,
    });
    reservation.created_at = now - (SEED_GUESTS.length - i) * 37 * 60 * 1000;
    state = { ...state, reservations: [...state.reservations, reservation] };
  });

  return state;
}

export function occupancy(state) {
  const activeTables = state.tables.filter((t) => t.active).length;
  const reserved = state.reservations.length;
  const people = state.reservations.reduce((sum, r) => sum + r.party_size, 0);
  return {
    reservations: reserved,
    people,
    totalTables: activeTables,
    percent: activeTables
      ? Math.min(100, Math.round((reserved / activeTables) * 100))
      : 0,
  };
}
