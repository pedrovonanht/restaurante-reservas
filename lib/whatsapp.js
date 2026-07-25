// Monta o link wa.me a partir do telefone do convidado.

export function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

export function waLink(phone, message) {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  // Sem código do país (10–11 dígitos) → assume Brasil (+55).
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  const base = `https://wa.me/${withCountry}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
