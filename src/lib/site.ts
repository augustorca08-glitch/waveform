export const FREE_SHIPPING_FROM = 150;
export const SHIPPING_OPTIONS = [
  { id: "standard", label: "Estándar", detail: "3 a 5 días hábiles", price: 9 },
  { id: "express", label: "Express", detail: "24 a 48 horas", price: 18 },
  { id: "pickup", label: "Retiro en el estudio", detail: "Coordinamos por mensaje", price: 0 },
] as const;

/** Número ficticio. Reemplazar por el real (formato internacional, sin + ni espacios). */
export const WHATSAPP_NUMBER = "5491100000000";

const usd = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", currencyDisplay: "symbol", maximumFractionDigits: 0 });

/** Precios en dólares con formato local (es-AR muestra "US$ 1.200"). */
export function formatPrice(n: number) {
  return usd.format(n).replace(/\s/g, " ");
}

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/drop/low-tide", label: "New Drop" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/about", label: "About" },
] as const;

export function whatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
