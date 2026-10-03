import type { Metadata } from "next";
import { OrderSuccess } from "@/components/checkout/order-success";

export const metadata: Metadata = { title: "Pedido confirmado", robots: { index: false } };

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { order } = await searchParams;
  return <OrderSuccess order={typeof order === "string" ? order.slice(0, 16) : undefined} />;
}
