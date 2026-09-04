// Camada de acesso à API do SaaS (base /api/v1).
// Autenticação por cookie httpOnly `session_id` (same-origin → enviado automaticamente;
// `credentials: "include"` por garantia). Erros seguem o schema `Error` do openapi.json:
// { name, message, action, status_code } — normalizados em ApiError.

const BASE = "/api/v1";

export class ApiError extends Error {
  constructor({ name, message, action, status_code }) {
    super(message || "Um erro inesperado aconteceu.");
    this.name = name || "InternalServerError";
    this.action = action ?? null;
    this.statusCode = status_code ?? 500;
  }
}

async function apiFetch(path, { headers, ...options } = {}) {
  const hasBody = options.body != null;

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      credentials: "include",
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...options,
    });
  } catch {
    throw new ApiError({
      name: "NetworkError",
      message: "Não foi possível conectar ao servidor.",
      action: "Verifique sua conexão e tente novamente.",
      status_code: 0,
    });
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      data && data.name
        ? data
        : {
            name: "InternalServerError",
            message: "Um erro inesperado aconteceu.",
            action: null,
            status_code: response.status,
          },
    );
  }

  return data;
}

const jsonBody = (body) => ({ body: JSON.stringify(body) });

export const auth = {
  me: () => apiFetch("/user"),
  login: (email, password) =>
    apiFetch("/sessions", { method: "POST", ...jsonBody({ email, password }) }),
  logout: () => apiFetch("/sessions", { method: "DELETE" }),
  register: ({ username, email, password }) =>
    apiFetch("/users", {
      method: "POST",
      ...jsonBody({ username, email, password }),
    }),
};

export const restaurants = {
  list: () => apiFetch("/restaurants"),
  create: ({ name }) =>
    apiFetch("/restaurants", {
      method: "POST",
      ...jsonBody({ name }),
    }),
};

export const tables = {
  list: (slug) => apiFetch(`/restaurants/${slug}/tables`),
  create: (slug, input) =>
    apiFetch(`/restaurants/${slug}/tables`, {
      method: "POST",
      ...jsonBody(input),
    }),
  update: (slug, id, input) =>
    apiFetch(`/restaurants/${slug}/tables/${id}`, {
      method: "PATCH",
      ...jsonBody(input),
    }),
};

export const events = {
  list: (slug) => apiFetch(`/restaurants/${slug}/events`),
  get: (slug, id) => apiFetch(`/restaurants/${slug}/events/${id}`),
  create: (slug, input) =>
    apiFetch(`/restaurants/${slug}/events`, {
      method: "POST",
      ...jsonBody(input),
    }),
  update: (slug, id, input) =>
    apiFetch(`/restaurants/${slug}/events/${id}`, {
      method: "PATCH",
      ...jsonBody(input),
    }),
};

export const presets = {
  list: (slug) => apiFetch(`/restaurants/${slug}/event-presets`),
  create: (slug, input) =>
    apiFetch(`/restaurants/${slug}/event-presets`, {
      method: "POST",
      ...jsonBody(input),
    }),
};

export const reservations = {
  listOwner: (slug, { from, to } = {}) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return apiFetch(`/restaurants/${slug}/reservations${qs ? `?${qs}` : ""}`);
  },
  // Rotas públicas (convidado, sem sessão) — ficam fora do prefixo /restaurants.
  create: (slug, input) =>
    apiFetch(`/${slug}/reservations`, { method: "POST", ...jsonBody(input) }),
  getByToken: (slug, token) => apiFetch(`/${slug}/reservations/${token}`),
};

export { apiFetch };
