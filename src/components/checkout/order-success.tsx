"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatPrice } from "@/lib/site";
import { Sticker } from "@/components/ui/motion";

type Order = { order: string; email: string; total: number; name: string };

const noop = () => () => {};
function readLastOrder() {
  try {
    return sessionStorage.getItem("waveform-last-order");
  } catch {
    return null;
  }
}

export function OrderSuccess({ order }: { order?: string }) {
  const reduce = useReducedMotion();
  const raw = useSyncExternalStore(noop, readLastOrder, () => null);
  let data: Order | null = null;
  try {
    data = raw ? (JSON.parse(raw) as Order) : null;
  } catch {}
  const id = data?.order ?? order;
  return (
    <section className="relative mx-auto min-h-[80dvh] max-w-[1400px] overflow-hidden px-4 pb-24 pt-[calc(var(--header-h)+4rem)] md:px-8">
      <motion.h1
        initial={reduce ? false : { y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="display max-w-[12ch] text-[clamp(3rem,11vw,9rem)]"
      >
        {data?.name ? `Gracias, ${data.name}` : "Pedido confirmado"}
      </motion.h1>
      <div className="mt-8 max-w-[46ch] text-lg" role="status">
        {id ? (
          <p>
            Tu número de pedido es <strong className="mono">{id}</strong>.
            {data && (
              <>
                {" "}
                Total: <span className="mono">{formatPrice(data.total)}</span>. Te enviamos el detalle a <span className="break-all">{data.email}</span>.
              </>
            )}
          </p>
        ) : (
          <p>Recibimos tu pedido.</p>
        )}
        <p className="mt-3 text-base text-ink-soft">Esta es una compra de demostración: no se realizó ningún cobro.</p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-ink">
          Seguir comprando
        </Link>
        <Link href="/lookbook" className="btn btn-outline">
          Lookbook
        </Link>
      </div>
      <Sticker at="right-6 top-[calc(var(--header-h)+2rem)] md:right-[12vw]" rotate={12} className="h-28 w-28 rounded-full bg-sunburn text-xs text-ink md:h-36 md:w-36 md:text-sm">
        <span>
          See you
          <br />
          in the
          <br />
          water
        </span>
      </Sticker>
    </section>
  );
}
