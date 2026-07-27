// Validadores leves de formulário. Cada função retorna um objeto
// { campo: "mensagem" }; objeto vazio = válido.

import { todayISO } from "lib/format";
import { normalizePhone } from "lib/whatsapp";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !email.trim()) errors.email = "Informe seu e-mail.";
  else if (!EMAIL_RE.test(email)) errors.email = "E-mail inválido.";
  if (!password) errors.password = "Informe sua senha.";
  return errors;
}

export function validateRegister({ username, email, password }) {
  const errors = {};
  if (!username || username.trim().length < 3)
    errors.username = "Use ao menos 3 caracteres.";
  if (!email || !EMAIL_RE.test(email)) errors.email = "E-mail inválido.";
  if (!password || password.length < 8)
    errors.password = "Use ao menos 8 caracteres.";
  return errors;
}

export function validateRestaurant({ name }) {
  const errors = {};
  if (!name || name.trim().length < 2)
    errors.name = "Use ao menos 2 caracteres.";
  return errors;
}

export function validateTable({ name, max_capacity, min_capacity }) {
  const errors = {};

  if (!name || name.trim().length < 2)
    errors.name = "Nome deve ter ao menos 2 caracteres.";
  else if (name.trim().length > 80)
    errors.name = "Nome deve ter no máximo 80 caracteres.";

  const max = Number(max_capacity);
  if (
    max_capacity === "" ||
    max_capacity == null ||
    !Number.isInteger(max) ||
    max <= 0
  )
    errors.max_capacity = "Informe uma capacidade máxima válida.";

  if (min_capacity !== "" && min_capacity != null) {
    const min = Number(min_capacity);
    if (!Number.isInteger(min) || min <= 0)
      errors.min_capacity = "Capacidade mínima deve ser um inteiro positivo.";
    else if (!errors.max_capacity && min > max)
      errors.min_capacity =
        "Capacidade mínima não pode ser maior que a máxima.";
  }

  return errors;
}

export function validateEvent({ name, event_date, event_times }) {
  const errors = {};

  if (!name || name.trim().length < 2)
    errors.name = "Nome deve ter ao menos 2 caracteres.";
  else if (name.trim().length > 80)
    errors.name = "Nome deve ter no máximo 80 caracteres.";

  if (!event_date) errors.event_date = "Informe a data do evento.";
  else if (event_date < todayISO())
    errors.event_date = "A data não pode estar no passado.";

  if (!event_times || event_times.length === 0)
    errors.event_times = "Adicione ao menos um horário.";
  else if (event_times.some((t) => !TIME_RE.test(t)))
    errors.event_times = "Horários devem estar no formato HH:MM.";
  else if (new Set(event_times).size !== event_times.length)
    errors.event_times = "Remova horários duplicados.";

  return errors;
}

export function validatePreset({ name, event_times }) {
  const errors = {};

  if (!name || name.trim().length < 2)
    errors.name = "Nome deve ter ao menos 2 caracteres.";
  else if (name.trim().length > 80)
    errors.name = "Nome deve ter no máximo 80 caracteres.";

  if (!event_times || event_times.length === 0)
    errors.event_times = "Adicione ao menos um horário.";
  else if (event_times.some((t) => !TIME_RE.test(t)))
    errors.event_times = "Horários devem estar no formato HH:MM.";
  else if (new Set(event_times).size !== event_times.length)
    errors.event_times = "Remova horários duplicados.";

  return errors;
}

export function validateReservation({
  guest_name,
  guest_phone,
  party_size,
  reservation_date,
  reservation_time,
}) {
  const errors = {};

  if (!guest_name || guest_name.trim().length < 2)
    errors.guest_name = "Informe seu nome.";

  if (!guest_phone || normalizePhone(guest_phone).length < 10)
    errors.guest_phone = "Informe um celular válido com DDD.";

  const n = Number(party_size);
  if (!party_size || !Number.isInteger(n) || n <= 0)
    errors.party_size = "Informe o número de pessoas.";

  if (!reservation_date) errors.reservation_date = "Selecione uma data.";

  if (!reservation_time || !TIME_RE.test(reservation_time))
    errors.reservation_time = "Selecione um horário.";

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
